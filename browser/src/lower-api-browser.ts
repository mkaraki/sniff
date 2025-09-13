import { type LowerApi, type TextOutputStream } from '../../shared-js/lower-api.ts';
import {dnsOverHttpsQuery} from "../../shared-js/api/dns-over-https.ts";

class LowerApiBrowserConfig {
  stdoutDom: HTMLElement | undefined;
  stderrDom: HTMLElement | undefined;
  dnsOverHttpEndpoint: string | undefined;
}

const initializeLowerApiBrowser: (config: LowerApiBrowserConfig) => LowerApi = (config) => {
  const digFetch = async (type: string, name: string) => {
    return await dnsOverHttpsQuery(config.dnsOverHttpEndpoint ?? '', type, name);
  }

  const textOutputStreamStdOutPrint = (value: string) => {
    let newSpan = document.createElement('span');
    newSpan.innerText = value;
    config.stdoutDom?.appendChild(newSpan);
  };

  const textOutputStreamStdErrPrint = (value: string) => {
    let newSpan = document.createElement('span');
    newSpan.innerText = value;
    newSpan.classList.add('stderr')
    config.stderrDom?.appendChild(newSpan);
  };

  class BrowserStdOut implements TextOutputStream {
    print = (value: string) => textOutputStreamStdOutPrint(value);
    println = (value?: string) => textOutputStreamStdOutPrint((value ?? '') + '\n');
  }

  class BrowserStdErr implements TextOutputStream {
    print = (value: string) => textOutputStreamStdErrPrint(value);
    println = (value?: string) => textOutputStreamStdErrPrint((value ?? '') + '\n');
  }


  class LowerApiBrowser implements LowerApi {
    dig = digFetch;
    stdout = new BrowserStdOut();
    stderr = new BrowserStdErr();
  }

  return new LowerApiBrowser();
};

export {
  initializeLowerApiBrowser,
  LowerApiBrowserConfig,
}