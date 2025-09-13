import { DigAnswer, DigAnswerEntry, type LowerApi, type TextOutputStream } from '../shared-js/lower-api.ts';
import dns from 'node:dns';
import {dnsOverHttpsQuery} from "../shared-js/api/dns-over-https.ts";

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

export {
    initializeLowerApiConsole,
}
