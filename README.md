# Sniff

[![codecov](https://codecov.io/github/mkaraki/sniff/graph/badge.svg?token=2ghmclIUef)](https://codecov.io/github/mkaraki/sniff)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/59d229550c8645e8b01e49769c8ef8f7)](https://app.codacy.com/gh/mkaraki/sniff/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=mkaraki_sniff&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=mkaraki_sniff)

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
