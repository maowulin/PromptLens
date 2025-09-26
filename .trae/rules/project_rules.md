This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

PromptLens is a Rust-based application with multi-platform support. The project uses a modular architecture with the following structure:

- **Core crates** (Rust workspace): Independent functionality modules
  - `core/audio`: Audio recording and processing
  - `core/capture`: Screen capture functionality  
  - `core/asr`: Automatic speech recognition
  - `core/ocr`: Optical character recognition
  - `core/service`: HTTP API service layer using Axum
  - `core/storage`: Data persistence layer with SQLx/SQLite

- **Applications**:
  - `apps/desktop/tauri-app`: Native desktop app using Tauri framework
  - `apps/mobile`: Mobile app using Tauri (Android/iOS - coming soon)

The core service (`core/service/src/lib.rs`) provides an HTTP API with endpoints for pairing, recording, and screen capture. The Tauri desktop app serves as both a native wrapper and embeds the web interface.

## Development Commands

Use the Justfile for all development tasks:

```bash
# Start development (interactive platform selection)
just dev

# Stop development environment  
just dev-down

# Check service status and health
just dev-status
just dev-health

# Build all components
just build

# Build specific targets
just build-core      # Core Rust crates
just build-desktop   # Tauri desktop app
just build-mobile    # Mobile app (now using Tauri for all platforms)

# Code quality
just fmt    # Format all code (Rust + web)
just lint   # Lint all code
just test   # Run all tests

# Dependencies and cleanup
just install  # Install all dependencies
just clean    # Clean build artifacts
```

The development script (`scripts/dev.sh`) provides platform-specific startup options and handles service lifecycle management.

## WSL Environment Considerations

When working in WSL, follow these guidelines from `.cursorrules`:

- **Never use pipes (`|`) with long-running commands** - they can hang in WSL
- **Prefer `just` commands** over direct terminal commands
- **Use `pkill -f process_name`** to clean up before starting services
- **Set timeouts** on network requests and avoid complex shell constructs

## Build System

- **Rust**: Cargo workspace with shared dependencies defined in root `Cargo.toml`
- **Web**: Minimal setup with Tauri integration, uses `package.json` for Tauri CLI

The service runs on `http://127.0.0.1:48080` by default with health endpoints at `/health`, `/readyz`, `/livez` and metrics at `/metrics`.

## Service Architecture

The HTTP service (`core/service`) uses:
- Axum for HTTP handling
- Prometheus metrics collection
- CORS enabled for cross-origin requests
- UUID-based session and resource IDs
- Embedded web interface served from root endpoint

All core crates are designed as independent modules that can be used separately or composed together through the service layer.