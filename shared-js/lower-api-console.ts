import { type LowerApi, type TextOutputStream } from './lower-api.ts';
import {dnsOverHttpsQuery} from "./api/dns-over-https.ts";

const initializeLowerApiConsole = () => {
    const digFetch = async (type: string, name: string) => {
        return await dnsOverHttpsQuery('https://cloudflare-dns.com/dns-query', type, name);
    }

    const textOutputStreamStdOutPrint = (value: string) => {
        process.stdout.write(value);
    };

    const textOutputStreamStdErrPrint = (value: string) => {
        process.stderr.write(value);
    };

    class StdOut implements TextOutputStream {
        print = (value: string) => textOutputStreamStdOutPrint(value);
        println = (value?: string) => textOutputStreamStdOutPrint((value ?? '') + '\n');
    }

    class StdErr implements TextOutputStream {
        print = (value: string) => textOutputStreamStdErrPrint(value);
        println = (value?: string) => textOutputStreamStdErrPrint((value ?? '') + '\n');
    }

    class LowerApiConsole implements LowerApi {
        dig = digFetch;
        stdout = new StdOut();
        stderr = new StdErr();
    }

    return new LowerApiConsole();
};

const initializeLowerApiConsoleForTest = () => {
    const digFetch = async (type: string, name: string) => {
        return await dnsOverHttpsQuery('https://cloudflare-dns.com/dns-query', type, name);
    }

    class OutputDevNull implements TextOutputStream {
        print = (value: string) => {};
        println = (value?: string) => {};
    }

    class LowerApiConsole implements LowerApi {
        dig = digFetch;
        stdout = new OutputDevNull();
        stderr = new OutputDevNull();
    }

    return new LowerApiConsole();
};

export {
    initializeLowerApiConsole,
    initializeLowerApiConsoleForTest
}
