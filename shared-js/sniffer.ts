import {DigAnswerEntry, type LowerApi} from './lower-api';
import {getPtrAcceptableAddress, isDomain, isIp} from "./validator.ts";
import {normalizeDomain} from "./normalize.ts";
import {ALL_DIG_TYPES_STRING, DNS_RECORD_TYPE_STRING_LOOKUP_TABLE} from "./dns.ts";
// @ts-ignore
import psl from 'psl';
// @ts-ignore
import spf from 'spf-parse';
import {dnsIgnore, revDnsIgnore, spfIncludeIgnore} from "./vendor-ignore.ts";
import {recursiveRdap} from "./sniffers/rdap.ts";

class ContinuousSearchResult {
  nextSearch: Array<string> = [];
  doneProcess: Array<string> = [];
  dumps: {[name: string] : string} = {};
}

class Sniffer {
  lowerApi: LowerApi;

  constructor(lowerApi: LowerApi) {
    this.lowerApi = lowerApi;
  }

  public println = (value?: string) => {
    this.lowerApi.stdout.println(value);
  }
  public print = (value: string) => {
    this.lowerApi.stdout.print(value);
  }
  public eprintln = (value?: string) => {
    this.lowerApi.stderr.println(value);
  }
  public eprint = (value: string) => {
    this.lowerApi.stderr.print(value);
  }

  private _trimDoubleQuote = (v: string | null | undefined) => {
    if (v === null || v === undefined) return '';

    if (v.startsWith('"')) v = v.substring(1, v.length - 1);
    if (v.endsWith('"')) v = v.substring(0, v.length - 2);

    return v;
  }

  private _ipSearch = async (target: string) => {
    const csRes = new ContinuousSearchResult();

    const rdapInterests = await recursiveRdap(this, 'ip', target);
    rdapInterests.forEach(i => {
      if (isDomain(i)) {
        const norm = normalizeDomain(i);
        if (!revDnsIgnore(norm))
          csRes.nextSearch.push(norm);
      } else if (isIp(i)) {
        csRes.nextSearch.push(i);
      }
    });

    await (async () => {
      const ptrAddr = getPtrAcceptableAddress(target);
      if (ptrAddr === null) {
        this.eprintln(`! Can't get PTR address for ${target}`);
        return;
      }
      this.println(`# dig PTR ${ptrAddr} # <- PTR of ${target}`);

      const ptrResult = await this.lowerApi.dig('PTR', ptrAddr);
      if (ptrResult.status !== 0) {
        this.eprintln(`! PTR query failed: ${ptrResult.status}`);
        return;
      } else if (ptrResult.entries.length === 0) {
        this.println(`! No PTR record found`);
        return;
      }

      ptrResult.entries.forEach(v => {
        this.println(`- ${v.data}`);
        if (isDomain(v.data)) {
          const norm = normalizeDomain(v.data as string);
          if (!revDnsIgnore(norm))
            csRes.nextSearch.push(norm);
        }
      })
      this.println('EOS');
    })();
    this.println();
    csRes.doneProcess.push('ptr');

    return csRes;
  }

  private _digAll = async (fqdn: string) => {
    let ret: Array<DigAnswerEntry> = [];
    let res = await Promise.all(ALL_DIG_TYPES_STRING.map(async t => await this.lowerApi.dig(t, fqdn)));

    res.forEach(v => {
      if (v === undefined || v.status !== 0 || v.entries.length === 0) return;

      v.entries.forEach(i => {
        ret.push(i);
      })
    })

    return ret;
  }

  private _domainSearch = async (target: string) => {
    const csRes = new ContinuousSearchResult();

    // PSL and RDAP
    await (async () => {
      const pslParsed = psl.parse(target);

      // ToDo: Add all parent subdomains

      if (pslParsed.domain === target) {
        // If this is not a subdomain.
        // ToDo: This also contains rental server system (*.sakura.ne.jp). Remove those to avoid RDAP fail.

        const rdapInterests = await recursiveRdap(this, 'domain', target);
        rdapInterests.forEach(i => {
          if (isDomain(i)) {
            const norm = normalizeDomain(i);
            if (!dnsIgnore(norm))
              csRes.nextSearch.push(norm);
          } else if (isIp(i)) {
            csRes.nextSearch.push(i);
          }
        });

        // Perform CT scan
        this.println(`# curl https://api.certspotter.com/v1/issuances?domain=${target}&include_subdomains=true # <- Certificate Transparency`)
        try {
          const ctRaw = await fetch(`https://api.certspotter.com/v1/issuances?domain=${target}&include_subdomains=true&expand=dns_names&expand=issuer.caa_domains&expand=issuer.name`);
          const ctData = (Array<any>)(await ctRaw.json());
          console.debug(ctData)

          ctData[0].forEach((v: Dict<any>) => {
            console.trace(v);
            this.println(`- CERT: ${v['cert_sha256']} (not_before: ${v['not_before']}, not_after: ${v['not_after']})`);
            v['dns_names'].forEach((d: string) => {
              csRes.nextSearch.push(d);
              this.println(` - ${d}`);
            });
          })
          this.println('EOF')
        }
        catch (e) {
          this.eprintln('Failed to retrieve CT info.')
          console.error(e)
        }
        this.println()

        //this.println();
        return;
      }

      // if (pslParsed !== target)
      csRes.nextSearch.push(pslParsed.domain);
    })();


    await(async() => {
      this.println(`# dig ANY ${target} (ANY-ish query)`)
      const digRes = await this._digAll(target);
      digRes.forEach(v => {
        v.type = v.type as number;
        v.data = v.data as string;
        this.println(`- ${DNS_RECORD_TYPE_STRING_LOOKUP_TABLE[v.type] ?? v.type} ${v.data}`);

        if ([1, 2, 5, 28].includes(v.type)) {
          // On A, NS, CNAME, AAAA
          if (isDomain(v.data)) {
            const norm = normalizeDomain(v.data as string);
            if (!dnsIgnore(norm))
              csRes.nextSearch.push(norm);
          } else if (isIp(v.data)) {
            csRes.nextSearch.push(v.data);
          }
        } else if (v.type === 15) {
          // On MX
          const parsed = v['data'].split(' ') as [string, string];
          if (isDomain(parsed[1])) {
            const norm = normalizeDomain(parsed[1]);
            if (!dnsIgnore(norm))
              csRes.nextSearch.push(norm);
          }
        } else if (v.type === 16) {
          // On TXT
          const txt = v.data;
          const noTrim = this._trimDoubleQuote(txt);
          const txtLow = txt.toLowerCase();

          if (txtLow.includes('v=spf1')) {
            const spfRecord: any = spf(noTrim);
            spfRecord.mechanisms.forEach((v: { [x: string]: string; }) => {
              this.println(` - ${v['prefix']} ${v['type']} ${v['value'] ?? ''}`)

              if (v['type'] === 'include') {
                v['value'] = v['value'] as string;
                if (!spfIncludeIgnore(v['value']))
                  csRes.nextSearch.push(v['value']);
              } else if (v['type'] === 'ip4' || v['type'] === 'ip6') {
                if (v['value'] !== undefined) {
                  const firstAddr = v['value'].split('/')[0];
                  if (isIp(firstAddr)) {
                    csRes.nextSearch.push(firstAddr as string);
                  }
                }
              } else if (v['type'] === 'a' || v['type'] === 'mx') {
                if (v['value'] !== undefined && isDomain(v['value'])) {
                  if (!dnsIgnore(v['value']))
                    csRes.nextSearch.push(normalizeDomain(v['value']));
                }
              }
            })
          }
        }
      })
    })();
    this.println();

    return csRes;
  }

  private _doSearchOneShotInternal = async (target: string) => {
    if (isIp(target)) {
      return await this._ipSearch(target);
    } else if (isDomain(target)) {
      return await this._domainSearch(target);
    } else {
      return false;
    }
  }

  doSearchOneShot = async (target: string) => {
    const res = await this._doSearchOneShotInternal(target);
    if (res === false) {
      this.eprintln(`! Not supported target type`);
      return;
    }

    res.nextSearch = [...new Set(res.nextSearch)];

    this.println('# ===================================');
    this.println('# Interests');
    this.println('# ===================================');
    res.nextSearch.forEach(v => {
      this.println(`- ${v}`);
    });
    this.println('EOS');

    return res;
  }

  doRecursiveSearch = async (target: string) => {
    let csState = new ContinuousSearchResult();
    csState.nextSearch.push(target);
    let scanned: Array<string> = [];

    for (let i = 0; i < csState.nextSearch.length; i++) {
      const scanItem = csState.nextSearch[i] as string;

      this.println(`% target: ${scanItem} (${i + 1}/${csState.nextSearch.length})`);
      this.println();

      const res = await this._doSearchOneShotInternal(scanItem);
      if (res === false) {
        this.eprintln(`! Not supported target type`);
        this.println();
        scanned.push(scanItem);
        continue;
      }
      scanned.push(scanItem);

      res.nextSearch.forEach(v => {
        if (isDomain(v)) {
          let vn = normalizeDomain(v);
          if (!scanned.includes(vn) && !dnsIgnore(vn)) // ToDo: Check DNS ignore list
            csState.nextSearch.push(vn);
        } else if (isIp(v)) {
          if (!scanned.includes(v))
            csState.nextSearch.push(v);
        }
      })

      csState.dumps = Object.assign(csState.dumps, res.dumps);

      // This might not need. But for more secure result, we add this.
      csState.nextSearch = [... new Set(csState.nextSearch)];
    }

    scanned = [...new Set(scanned)];

    this.println('# ===================================');
    this.println('# Scanned items');
    this.println('# ===================================');
    scanned.forEach(v => {
      this.println(`- ${v}`);
    });
    this.println('EOS');

    return csState;
  }

  /*extractEmlInterest = async (emlString: string) => {
    const mailObj = await simpleParser(emlString, {
      'skipHtmlToText': true,
      'maxHtmlLengthToParse': 1,
      'skipImageLinks': true,
      'skipTextToHtml': true,
      'skipTextLinks': true,
    });
  }*/
}

export {
  Sniffer,
}