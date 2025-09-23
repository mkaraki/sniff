all: browser/.output/public console-all

clean:
	rm -r browser/node_modules || true
	rm -r browser/.output/public || true
	rm -r console/node_modules || true
	rm -r console/out || true
	rm -r shared-js/node_modules || true

browser/.output/public: browser/node_modules shared-js/node_modules
	cd browser; bun --bun run generate

browser/node_modules: browser/package.json
	cd browser; bun install

console/node_modules: console/package.json
	cd console; bun install

console/out/sniff: console/node_modules shared-js/node_modules console/index.ts
	cd console; bun build index.ts --compile --outfile out/sniff

console/out/sniff-oneshot: console/node_modules shared-js/node_modules console/one-shot.ts
	cd console; bun build one-shot.ts --compile --outfile out/sniff-oneshot

console-all: console/out/sniff console/out/sniff-oneshot

shared-js/node_modules: shared-js/package.json
	cd shared-js; bun install
