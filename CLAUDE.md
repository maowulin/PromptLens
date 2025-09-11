# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

PromptLens is a Rust-based polyglot monorepo with multi-platform support. The project uses a modular architecture with the following structure:

- **Core Rust crates** (workspace members in `Cargo.toml`):
  - `core/audio`: Audio recording and processing with CPAL and WebRTC VAD
  - `core/capture`: Screen capture functionality using screenshots crate
  - `core/asr`: Automatic speech recognition pipelines
  - `core/ocr`: Optical character recognition experiments
  - `core/service`: HTTP API service layer using Axum with Prometheus metrics
  - `core/storage`: Data persistence layer with SQLx/SQLite

- **Applications**:
  - `apps/desktop/tauri-app`: Native desktop app using Tauri framework
    - `src-tauri/`: Rust backend (workspace member)
    - `web/`: React frontend for Tauri
  - `apps/mobile/flutter-app`: Mobile app using Flutter (Android/iOS)
  - `apps/web-client/`: Standalone web client (Vite + React + Tailwind + shadcn/ui)

- **Shared components**:
  - `shared/proto/`: OpenAPI schemas and protocol definitions

## Key File Locations

- **Main workspace config**: `Cargo.toml` (lines 1-52)
- **Development commands**: `Justfile` (comprehensive task runner)
- **Service entry point**: `core/service/src/lib.rs:46` - `serve_http()` function
- **Tauri app**: `apps/desktop/tauri-app/src-tauri/`
- **Web client**: `apps/web-client/` (Vite + React)
- **Development scripts**: `scripts/` directory

## Development Commands

Use the Justfile for all development tasks. Key commands:

```bash
# Development & Testing
just dev            # Interactive platform selection (scripts/dev.sh)
just dev-down       # Stop development environment
just dev-status     # Check service status (scripts/status.sh)
just dev-health     # Check service health (curl /health)
just dev-metrics    # Check service metrics (curl /metrics)
just run-service    # Run service in foreground for debugging

# Building
just build          # Build all components
just build-core     # Build Rust core crates only
just build-desktop  # Build Tauri desktop app
just bundle-desktop # Build desktop installers (web + tauri)
just build-mobile   # Build Flutter mobile app
just build-web-client # Build standalone web client

# Code Quality
just fmt            # Format all code (Rust + web + Flutter)
just lint           # Lint all code (clippy + eslint + flutter analyze)
just test           # Run all tests

# Dependencies & Cleanup
just install           # Install project dependencies only
just install-system-deps # Install system dependencies (Ubuntu/Debian)
just install-all       # Install all dependencies (system + project)
just clean            # Clean build artifacts

# Web Client Specific
just preview-web-client # Preview web client on port 5173
```

## Service Endpoints

The HTTP service runs on `http://127.0.0.1:48080` with:
- Health checks: `/health`, `/readyz`, `/livez`
- Metrics: `/metrics` (Prometheus format)
- Main API endpoints for pairing, recording, and screen capture

## Development Workflow

1. **One-click setup**: `./scripts/install.sh` or `just install-all`
2. **Start development**: `just dev` (interactive platform selection)
3. **Build for production**: `just build` or platform-specific build commands
4. **Monitor services**: `just dev-status` and `just dev-health`

## WSL Environment Considerations

When working in WSL, follow guidelines from `.cursorrules`:
- **Never use pipes (`|`) with long-running commands** - they can hang in WSL
- **Prefer `just` commands** over direct terminal commands
- **Use `pkill -f process_name`** to clean up before starting services
- **Set timeouts** on network requests and avoid complex shell constructs
- **Kill processes explicitly** before starting new ones to avoid port conflicts

## Build System Details

- **Rust**: Cargo workspace with shared dependencies in root `Cargo.toml`
- **Web**: Vite + React for web-client, integrated with Tauri for desktop
- **Flutter**: Standard Flutter project structure
- **Package management**: pnpm for web, cargo for Rust, pub for Flutter

## Service Architecture

The HTTP service (`core/service`) uses:
- Axum framework for HTTP handling with tower middleware
- Prometheus metrics collection and exposure
- CORS enabled for cross-origin requests from web clients
- UUID-based session and resource identifiers
- Modular architecture with independent core crates
- Health checks and readiness probes for service monitoring