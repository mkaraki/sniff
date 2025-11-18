import {isDomain} from "../validator.ts";
import {normalizeDomain} from "../normalize.ts";
import {dnsIgnore} from "../vendor-ignore.ts";
import {Sniffer} from '../sniffer.ts';

const parseRdapObject = (sniffer: Sniffer, firstRdapResultJson: any): Array<string> => {
    const found: Array<string> = [];

    if (typeof firstRdapResultJson['status'] !== 'undefined') {
        sniffer.println('- Status:');
        firstRdapResultJson['status'].forEach((v: any) => {
            sniffer.println(`   - ${v}`);
        });
        sniffer.println('  EOF');
    }

    if (typeof firstRdapResultJson['nameservers'] !== 'undefined') {
        sniffer.println('- Nameservers:');
        firstRdapResultJson['nameservers'].forEach((v: any) => {
            sniffer.print(`   - ${v['ldhName']}`);
            if (v['objectClassName'] === 'nameserver') {
                sniffer.println();
            } else {
                sniffer.println(` (objectClassName: ${v['objectClassName']})`);
            }
        });
        sniffer.println('  EOF');
    }

    if (typeof firstRdapResultJson['entities'] !== 'undefined') {
        sniffer.println('- Entities:');
        firstRdapResultJson['entities'].forEach((v: any) => {
            sniffer.println(`   - Roles: ${v['roles'].join(', ')}`);
            if (typeof v['vcardArray'] === 'undefined') {
                sniffer.eprintln('     ! This system requires `vcardArray` element. But given entity does not have sniffer.');
                return;
            }

            sniffer.println('     vcardArray[1]:');
            try {
                v['vcardArray'][1].forEach((ve: any) => {
                    sniffer.print('     -');
                    sniffer.print(` ${ve[0]}`);
                    sniffer.print(` ${JSON.stringify(ve[1])}`);
                    sniffer.print(` ${ve[2]}`);
                    if (typeof ve[3] === 'string') {
                        sniffer.print(` ${ve[3]}`);
                    } else if (Array.isArray(ve[3])) {
                        sniffer.print(` "${ve[3].join(', ')}"`);
                    } else {
                        sniffer.print(` ${JSON.stringify(ve[3])}`);
                    }
                    sniffer.println();

                    // If sniffer.vcard entry is an email, extract domain and add to found interests
                    try {
                        if (ve[0] === 'email') {
                            let emailVal = '';
                            if (typeof ve[3] === 'string') {
                                emailVal = ve[3];
                            } else if (Array.isArray(ve[3]) && ve[3].length > 0) {
                                emailVal = ve[3][0];
                            }

                            const atIdx = emailVal.lastIndexOf('@');
                            if (atIdx !== -1) {
                                const domainPart = emailVal.substring(atIdx + 1).toLowerCase();
                                if (isDomain(domainPart)) {
                                    const norm = normalizeDomain(domainPart);
                                    if (!dnsIgnore(norm)) {
                                        found.push(norm);
                                    }
                                }
                            }
                        }
                    }
                    catch (e) {
                        console.error(e);
                        sniffer.eprintln(`       ! Error when extracting email address: ${e}`);
                    }
                });
            }
            catch (error) {
                console.error(error);
                sniffer.eprintln(`   ! Unexpected: ${error}`);
                return;
            }
        })
        sniffer.println('  EOF');
    }

    return found;
}

const recursiveRdap = async (sniffer: Sniffer, type: 'domain'|'ip'|'autnum', target: string) : Promise<Array<string>> => {
    let found: Array<string> = [];

    // =================================
    // Code for rdap.org
    // =================================
    const rdapOrgUrl = `https://rdap.org/${type}/${target}`;
    sniffer.println(`# curl ${rdapOrgUrl} # <- RDAP`);
    let rdapOrgRes;
    try {
        rdapOrgRes = await fetch(rdapOrgUrl, {
        });

        if (!rdapOrgRes.redirected) {
            switch (rdapOrgRes.status) {
                case 400:
                    sniffer.eprintln('! rdap.org returns 400. Program bug?');
                    sniffer.println();
                    return found;
                case 403:
                    sniffer.eprintln('! This client might blocked by rdap.org');
                    sniffer.println();
                    return found;
                case 404:
                    sniffer.eprintln('! rdap.org don\'t know endpoint');
                    sniffer.println();
                    return found;
                case 500:
                    sniffer.eprintln('! rdap.org returns 500');
                    sniffer.println();
                    return found;
                default:
                    sniffer.eprintln(`! rdap.org returns unexpected code: ${rdapOrgRes.status}`);
                    sniffer.println();
                    return found;
            }
        }
    }
    catch (error) {
        console.error(error);
        sniffer.eprintln(`! rdap.org error: ${error}`);
        sniffer.println();
        return found;
    }
    sniffer.println('EOF');
    sniffer.println();
    // =================================
    // END OF Code for rdap.org
    // =================================


    const newUrl = rdapOrgRes.url;
    sniffer.println(`# curl ${newUrl} # <- RDAP (final redirected address)`);
    try {
        const firstRdapResultJson: any = await rdapOrgRes.json();

        found = parseRdapObject(sniffer, firstRdapResultJson);
    }
    catch (error) {
        console.error(error);
        console.error(error);
        sniffer.eprintln(`! error: ${error}`);
        sniffer.println();
        return found;
    }

    sniffer.println('EOF');
    sniffer.println();

    return found;
};

export {
    parseRdapObject,
    recursiveRdap,
};