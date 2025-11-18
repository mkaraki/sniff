import {isDomain, isIp} from "../validator.ts";

const parseCtData = (sniffer: Sniffer, ctData: Array<Array<any>>): Array<string> => {
    const csRes = [];

    ctData[0].forEach((v: Dict<any>) => {
        sniffer.println(`- CERT: ${v['cert_sha256']} (not_before: ${v['not_before']}, not_after: ${v['not_after']})`);
        v['dns_names'].forEach((d: string) => {
            d = d.trim();
            if (!d.startsWith('*.') && (isDomain(d) || isIp(d)))
                csRes.push(d);
            sniffer.println(` - ${d}`);
        });
    })
    sniffer.println('EOF')

    return csRes;
}

const queryCtData = async (sniffer: Sniffer, target: string): Promise<Array<String>> => {
    let resData = []
    sniffer.println(`# curl https://api.certspotter.com/v1/issuances?domain=${target}&include_subdomains=true # <- Certificate Transparency`)
    let ctRaw = undefined;

    try {
        ctRaw = await fetch(`https://api.certspotter.com/v1/issuances?domain=${target}&include_subdomains=true&expand=dns_names&expand=issuer.caa_domains&expand=issuer.name`);
    }
    catch (e) {
        sniffer.eprintln(`Failed to query CT info: ${e}`)
        sniffer.println()
        return resData;
    }

    let ctData = undefined;

    try {
        ctData = (Array<any>)(await ctRaw.json());
    }
    catch (e) {
        sniffer.eprintln(`Failed to parse CT info from JSON: ${e}`)
        sniffer.println()
        return resData;
    }

    try {
        resData = parseCtData(sniffer, ctData);
    }
    catch (e) {
        sniffer.eprintln(`Failed to retrieve CT info: ${e}`)
        //console.error(ctData);
    }
    sniffer.println()

    return resData;
}

export {
    parseCtData,
    queryCtData,
}