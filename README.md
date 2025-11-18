# Sniff

[![codecov](https://codecov.io/github/mkaraki/sniff/graph/badge.svg?token=2ghmclIUef)](https://codecov.io/github/mkaraki/sniff)

Check unknown domain/IP information.

## Browser edition usage

You can run development server by executing following command in `/browser` directory.

```bash
bun run dev
```

## CLI edition usage

There are two entrypoint file in `/console` directory.

```bash
bun run ./index.ts $IP_OR_DOMAIN # Recursive search
bun run ./one-shot.ts $IP_OR_DOMAIN # One-shot search
```
