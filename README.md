[README](/README.md) · [中文](/docs/README.zh-CN.md) · [ARCHITECTURE](/docs/ARCHITECTURE.en.md) · [LICENSE](/LICENSE)

# PromptLens

A multi-platform (Desktop and Mobile via Tauri, and Web) human-in-the-loop observation and control panel. It focuses on real-time audio pipelines (for ASR), screen capture + OCR experiments, device pairing, and a local HTTP service to orchestrate multi-device workflows.

- CI: GitHub Actions
- License: MIT
- Platforms: Rust · Tauri · React

## Features

- Audio & Speech: local recording with an ASR-oriented pipeline
- Screen & OCR: screenshot capture and OCR experiment flow
- Multi-device: browser client pairs with the desktop app over LAN
- Modern Web UI: React + Tailwind + shadcn/ui
- Polyglot Monorepo: Rust core service + Tauri desktop/mobile + Web client

## Repository Layout

```
core/            # Rust crates: audio, capture, asr, ocr, service, storage
apps/
  desktop/       # Tauri desktop app
  mobile/        # Tauri mobile app (coming soon)
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
- (Optional) Platform-specific dependencies for Tauri

### One-Click Installation (recommended)

For the easiest setup experience, use our one-click installation script:

```bash
# Clone the repository
git clone <repository-url>
cd PromptLens

# One-click install (installs system dependencies + project dependencies)
./scripts/install.sh
```

### Manual Installation

If you prefer manual control, the project uses a Justfile to standardize tasks:

```bash
# Install just command runner (if not already installed)
cargo install just
# or: sudo apt install just

# Install all dependencies (system + project)
just install-all

# Or install separately:
just install-system-deps    # System dependencies (Ubuntu/Debian)
just install                 # Project dependencies only
```

### Development Commands

```bash
just dev            # Interactive platform selection
just build          # Build all components
just --list         # Show all available commands
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