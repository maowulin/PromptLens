[README](/README.md) · [中文](/docs/README.zh-CN.md) · [ARCHITECTURE](/docs/ARCHITECTURE.en.md) · [LICENSE](/LICENSE)

# PromptLens

A multi-platform (Desktop via Tauri, Mobile via Flutter, and Web) human-in-the-loop observation and control panel. It focuses on real-time audio pipelines (for ASR), screen capture + OCR experiments, device pairing, and a local HTTP service to orchestrate multi-device workflows.

- CI: GitHub Actions
- License: MIT
- Platforms: Rust · Tauri · Flutter · React

## Features

- Audio & Speech: local recording with an ASR-oriented pipeline
- Screen & OCR: screenshot capture and OCR experiment flow
- Multi-device: browser client pairs with the desktop app over LAN
- Modern Web UI: React + Tailwind + shadcn/ui
- Polyglot Monorepo: Rust core service + Tauri desktop + Flutter mobile + Web client

## Repository Layout

```
core/            # Rust crates: audio, capture, asr, ocr, service, storage
apps/
  desktop/       # Tauri desktop app
  mobile/        # Flutter mobile app
  web-client/    # Web client (Vite + React)
shared/
  proto/         # OpenAPI / schemas
scripts/         # Dev/build/cleanup helpers
.github/         # CI workflows
```

For detailed architecture, see ARCHITECTURE.md and docs/ARCHITECTURE.md.

## Quick Start

### Requirements

- Rust stable toolchain
- Node.js and pnpm (for the web client)
- Flutter SDK (optional, only if you plan to work on mobile)
- Tauri platform prerequisites (install per your OS)

### One-command dev (recommended)

The project uses a Justfile to standardize tasks. If you have `just` installed, you can:

```
pnpm start          # Interactive platform selection
```

### Build, Test, Lint, Format

```
pnpm build        # Build all components
```

Helper scripts are available in scripts/: dev.sh, status.sh, build.sh, clean.sh.

## Web Client

- Development: run via Just (preview-web-client) or use pnpm inside apps/web-client
- See apps/web-client/README.md for more details

## Contributing

See CONTRIBUTING.md for guidelines. Code ownership is defined in CODEOWNERS. Please use Conventional Commits and keep code formatted (just fmt) and linted (just lint).

## Security

See SECURITY.md for how to report vulnerabilities and our response process.

## License

This project is licensed under the MIT License - see the LICENSE file for details.