import {initializeLowerApiConsole} from "../shared-js/lower-api-console.ts";
import {Sniffer} from "../shared-js/sniffer.ts";
import type {LowerApi} from "../shared-js/lower-api.ts";

const lowerApi = initializeLowerApiConsole() as LowerApi;
const sniffer = new Sniffer(lowerApi);

// Get target from args
if (process.argv.length < 3) {
    console.error('Target missing');
    process.exit(1);
}
const target = process.argv[2] ?? '';

await sniffer.doRecursiveSearch(target);