# PromptLens Development Commands

# Build core Rust crates
build-core:
    cargo build --workspace

# Build desktop Tauri app
build-desktop:
    cargo build -p promptlens-tauri

bundle-desktop:
    cd apps/desktop/tauri-app/web && pnpm install && pnpm build
    cd apps/desktop/tauri-app && pnpm tauri build

# Build mobile app (now using Tauri for all platforms)
build-mobile:
    @echo "📱 Mobile builds now handled by Tauri - use 'just build-desktop' for all platforms"

# Build all components
build: build-core build-desktop build-mobile

# Format all code (Rust + web)
fmt:
    cargo fmt --all
    cd apps/desktop/tauri-app && pnpm format

# Lint code
lint:
    cargo clippy --all-targets --all-features -- -D warnings
    cd apps/desktop/tauri-app && pnpm lint

# Run tests
test:
    cargo test --workspace
    cd apps/desktop/tauri-app/web && npm test
    cd apps/web-client && npm test || true

# Start development environment with platform selection
dev:
    ./scripts/dev.sh

# Stop development environment
dev-down:
    ./scripts/dev.sh stop

# Check service status
dev-status:
    ./scripts/status.sh

# Check service health
dev-health:
    curl -s http://127.0.0.1:48080/health

# Check service metrics
dev-metrics:
    curl -s http://127.0.0.1:48080/metrics

# Run service in foreground (for debugging)
run-service:
    RUST_LOG=info cargo run -p promptlens-tauri --bin promptlens-tauri

# Build web-client and copy to dist if needed
build-web-client:
    cd apps/web-client && pnpm install && pnpm build

# Preview web-client
preview-web-client:
    cd apps/web-client && pnpm preview --host 0.0.0.0 --port 5173

# Clean build artifacts
clean:
    cargo clean
    cd apps/desktop/tauri-app && pnpm clean || rm -rf dist target

# Install dependencies
install:
    cargo fetch
    cd apps/desktop/tauri-app && pnpm install
    @echo "✅ All dependencies installed"

# Install system dependencies (Ubuntu/Debian)
install-system-deps:
    #!/usr/bin/env bash
    echo "📦 Installing system dependencies..."
    if command -v apt > /dev/null; then
        sudo apt update
        sudo apt install -y \
            build-essential \
            curl \
            wget \
            file \
            pkg-config \
            patchelf \
            libssl-dev \
            libgtk-3-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev \
            libwebkit2gtk-4.1-dev \
            libjavascriptcoregtk-4.1-dev \
            libasound2-dev
        echo "✅ System dependencies installed"
    else
        echo "⚠️  apt not found. Please install system dependencies manually:"
        echo "   - build-essential, curl, wget, file"
        echo "   - libssl-dev, libgtk-3-dev, libayatana-appindicator3-dev"
        echo "   - librsvg2-dev, libwebkit2gtk-4.1-dev, libjavascriptcoregtk-4.1-dev"
    fi

# Install all dependencies (system + project)
install-all: install-system-deps install

# Show help
default:
    @echo "Available commands:"
    @echo "  dev          - Start development environment (interactive platform selection)"
    @echo "  dev-down     - Stop development environment"
    @echo "  dev-status   - Check service status"
    @echo "  dev-health   - Check service health"
    @echo "  dev-metrics  - Check service metrics"
    @echo "  build        - Build all components"
    @echo "  build-core   - Build Rust core crates"
    @echo "  build-desktop- Build Tauri desktop app"
    @echo "  bundle-desktop - Build desktop installers (web build + tauri build)"
    @echo "  build-mobile - Build mobile app (now using Tauri for all platforms)"
    @echo "  fmt          - Format all code"
    @echo "  lint         - Lint all code"
    @echo "  test         - Run all tests"
    @echo "  clean        - Clean build artifacts"
    @echo "  install      - Install project dependencies"
    @echo "  install-system-deps - Install system dependencies (Ubuntu/Debian)"
    @echo "  install-all  - Install all dependencies (system + project)"
    @echo "  run-service  - Run service in foreground"


