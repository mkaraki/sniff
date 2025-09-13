import { Sniffer } from "../../shared-js/sniffer";
import {initializeLowerApiBrowser, LowerApiBrowserConfig} from "./lower-api-browser.js";

const res = document.getElementById('res');

const lowerApiConfig = new LowerApiBrowserConfig();
lowerApiConfig.stdoutDom = res;
lowerApiConfig.stderrDom = res;
lowerApiConfig.dnsOverHttpEndpoint = 'https://cloudflare-dns.com/dns-query';

const lowerApi = initializeLowerApiBrowser(lowerApiConfig);

const sniffer = new Sniffer(lowerApi);

// ToDo: add loading screen to wait for sniffer

const domainInput = document.getElementById('domain');
const searchButton = document.getElementById('search');
const searchRecursiveButton = document.getElementById('search-recursive')

const downloadableList = document.getElementById('downloadable-list');

const applyResultToUi = (ret) => {
    const dumps = ret.dumps;

    if (dumps.length > 0) {
        Object.keys(dumps).forEach(k => {
            let v = dumps[k];
            const liTag = document.createElement('li');
            const aTag = document.createElement('a');
            aTag.href = `data:,${encodeURIComponent(v)}`;
            aTag.download = k;
            aTag.innerText = k;
            liTag.appendChild(aTag);
            downloadableList.appendChild(liTag);
        });
        {
            const liTag = document.createElement('li');
            liTag.innerText = 'EOS';
            downloadableList.append(liTag);
        }
    }
    else {
        const liTag = document.createElement('li');
        liTag.innerText = 'EOS (dump not found)';
        downloadableList.append(liTag);
    }
}

const doSearchInternal = async (target) => {
    // This is one shot.
    res.innerText = '';
    downloadableList.innerHTML = '';
    const ret = await sniffer.doSearchOneShot(target);
    applyResultToUi(ret);
};

const doSearchRecursiveInternal = async (target) => {
    res.innerText = '';
    downloadableList.innerHTML = '';
    const ret = await sniffer.doRecursiveSearch(target);
    applyResultToUi(ret);
}

searchButton.onclick = async () => {
    searchButton.disabled = true;
    searchRecursiveButton.disabled = true;

    let target = domainInput.value;
    await doSearchInternal(target);

    searchButton.disabled = false;
    searchRecursiveButton.disabled = false;
};

searchRecursiveButton.onclick = async () => {
    searchButton.disabled = true;
    searchRecursiveButton.disabled = true;

    let target = domainInput.value;
    await doSearchRecursiveInternal(target);

    searchButton.disabled = false;
    searchRecursiveButton.disabled = false;
}