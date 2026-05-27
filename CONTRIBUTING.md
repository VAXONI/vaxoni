# Contributing

This repository contains the public JavaScript/TypeScript SDK for the VAXONI API.

It does **not** contain Aether Core or internal analysis logic.

## Development

```bash
npm install
npm run typecheck
npm run build
```

## Guidelines

- Keep the SDK small and provider-aware.
- Do not expose API keys in examples.
- Preserve support for `vaxoni` and `rapidapi` providers.
- Keep `analyze(mode, payload)` as the main public entrypoint.