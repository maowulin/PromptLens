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

# Build mobile Flutter app
build-mobile:
    cd apps/mobile/flutter-app && flutter build

# Build all components
build: build-core build-desktop build-mobile

# Format code
fmt:
    cargo fmt --all
    cd apps/desktop/tauri-app/web && npx prettier --write .
    cd apps/mobile/flutter-app && flutter format .
    cd apps/web-client && npx prettier --write .

# Lint code
lint:
    cargo clippy --workspace
    cd apps/desktop/tauri-app/web && npx eslint .
    cd apps/mobile/flutter-app && flutter analyze
    cd apps/web-client && npx eslint . || true

# Run tests
test:
    cargo test --workspace
    cd apps/desktop/tauri-app/web && npm test
    cd apps/mobile/flutter-app && flutter test
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
    cd apps/desktop/tauri-app/web && rm -rf node_modules dist
    cd apps/mobile/flutter-app && flutter clean
    cd apps/web-client && rm -rf node_modules dist || true

# Install dependencies
install:
    #!/usr/bin/env bash
    echo "📦 Installing project dependencies..."
    cargo build --workspace
    (cd apps/desktop/tauri-app/web && npm install)
    if command -v flutter > /dev/null; then
        (cd apps/mobile/flutter-app && flutter pub get)
    else
        echo "⚠️  Flutter not found, skipping Flutter dependencies"
    fi
    (cd apps/web-client && pnpm install)
    echo "✅ Project dependencies installed"

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
            libssl-dev \
            libgtk-3-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev \
            libwebkit2gtk-4.1-dev \
            libjavascriptcoregtk-4.1-dev
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
    @echo "  build-mobile - Build Flutter mobile app"
    @echo "  fmt          - Format all code"
    @echo "  lint         - Lint all code"
    @echo "  test         - Run all tests"
    @echo "  clean        - Clean build artifacts"
    @echo "  install      - Install project dependencies"
    @echo "  install-system-deps - Install system dependencies (Ubuntu/Debian)"
    @echo "  install-all  - Install all dependencies (system + project)"
    @echo "  run-service  - Run service in foreground"


