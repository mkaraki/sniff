# ToDo: Add all
all: browser/dist

browser/dist: browser/node_modules shared-js/node_modules
	cd browser
	bun run build

browser/node_modules: browser/package.json
	cd browser
	bun install

shared-js/node_modules: shared-js/package.json
	cd shared-js
	bun install
