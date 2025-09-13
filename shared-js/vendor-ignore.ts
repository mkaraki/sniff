const spfIncludeIgnore= (domain: string): boolean => {
    const ignoreList = [
        // Microsoft 365
        'spf.protection.outlook.com',
        // Google Workspace domains
        '_spf.google.com',
        '_netblocks.google.com',
        '_netblocks2.google.com',
        '_netblocks3.google.com',
        // Cloudflare e-mail routing
        '_spf.mx.cloudflare.net',
        // See domain
        'spf.mailgun.org',
        'spf.mailjet.com',
        'mail.zendesk.com',
        '_spf.salesforce.com',
        'amazonses.com',
    ];

    return ignoreList.includes(domain);
}

const revDnsIgnore = (domain: string): boolean => {
    const ignoreList = [
        // GitHub CDN (GitHub Pages)
        /^cdn-[0-9\-]+\.github\.com$/i,
        // 1e100.net (Google internal)
        /\.1e100\.net$/i,
        // AWS EC2
        /^ec2-\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3}\.[a-z0-9\-]+\.compute\.amazonaws\.com$/i,
    ];
    for (let i = 0; i < ignoreList.length; i++) {
        if ((ignoreList[i] as RegExp).test(domain))
            return true;
    }

    return false;
}

const dnsIgnore = (domain: string): boolean => {
    const ignoreList = [
        // Cloudflare nameservers
        /^ns\d+\.cloudflare\.com$/,
        /\.ns\.cloudflare\.com$/,
        // Cloudflare e-mail routing
        /^route\d+\.mx\.cloudflare\.net$/,
        /^dmarc-reports\.cloudflare\.net$/,
        // Microsoft 365 Exchange Online
        /\.mail\.protection\.outlook\.com$/,
        /\.mx\.microsoft$/,
        /^autodiscover\.outlook\.com$/,
        // Microsoft 365
        /^onmicrosoft\.com$/,
        /^ns\d+\.bdm\.microsoftonline\.com$/,
        // Google Workspace
        /^aspmx\.l\.google\.com$/,
        /^alt\d+\.aspmx\.l\.google\.com$/,
        // Google Sites
        /^ghs\.googlehosted\.com$/,
        // Google Name Servers
        /^ns\d+\.google\.com$/,
        // Japan Science Information Network(SINET) Secondary DNS service
        // https://www.sinet.ad.jp/connect_service/service/dns_x
        /^dns-x\.sinet\.ad\.jp$/,
        // Vali mail DMARC rua reporting
        /^vali\.mail$/,
        // Mailgun DMARC rua, ruf
        /^mailgun\.net$/,
        // NS One DNS
        /^dns\d+\.p\d{2}\.nsone\.net$/,
        // AWS Route 53. THIS IS TOO DANGEROUS TO USE
        /^ns-\d+\.awsdns-\d{2}\.(org|co\.uk|com|net)$/,
        // AWS(internal ?) DMARC
        /^dmarc\.amazonaws\.com$/,
        // AWS(internal ?) DNS
        /^ns\d+\.amzndns\.(org|co\.uk|com|net)$/,
        // AWS SES inbound
        /^inbound-smtp\.[a-zA-Z0-9\-]+\.amazonaws\.com$/,
        // PowerDMARC DMARC rua, ruf
        /^rua\.powerdmarc\.com$/,
        /^ruf\.powerdmarc\.com$/,
        // Azure DNS
        /^ns\d+-\d+\.azure-dns\.(com|net|org|info)$/i,

        // Well-known service provider sites(like google.com.)
        /^google\.com$/, // To prevent huge result with Google Workspace domain due to DMARC check.
        /^github\.com$/, // To prevent huge result with GitHub pages.
    ]

    for (let i = 0; i < ignoreList.length; i++) {
        if ((ignoreList[i] as RegExp).test(domain))
            return true;
    }

    return false;
}

export {
    spfIncludeIgnore,
    revDnsIgnore,
    dnsIgnore,
};