import { DigAnswer, DigAnswerEntry } from '../lower-api.ts';

const dnsOverHttpsQuery = async (endpoint: string, type: string, name: string) => {
    const url = `${endpoint}?name=${name}&type=${type}`;
    const rawRes = await fetch(url, {
        'headers': {
            'accept': 'application/dns-json',
        }
    });
    // API response: https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/
    // or: `application/dns-json`
    const res: any = await rawRes.json();

    let ret = new DigAnswer();
    ret.entries = [];

    ret.status = res['Status'];

    if (res['Answer'] !== undefined) {
        (res['Answer'] as Array<DigAnswerEntry>).forEach(v => {
            let e = new DigAnswerEntry();

            e.name = v['name'];
            e.type = v['type'];
            e.data = v['data'];
            e.ttl  = v['ttl'];

            ret.entries.push(e);
        });
    }
    // else ret.entries = []; // Already did.

    return ret;
}

export {
    dnsOverHttpsQuery,
}