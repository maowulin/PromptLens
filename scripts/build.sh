#!/bin/bash

# PromptLens Build Script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔨 Building PromptLens project..."

# Load cargo environment
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
else
    echo "⚠️  Cargo environment not found, please install Rust first"
    exit 1
fi

cd "$PROJECT_ROOT"

# Parse arguments
BUILD_TYPE="${1:-release}"
BUILD_CORE=true
BUILD_DESKTOP=false
BUILD_MOBILE=false

case "$BUILD_TYPE" in
    "core"|"rust")
        BUILD_CORE=true
        BUILD_DESKTOP=false
        BUILD_MOBILE=false
        ;;
    "desktop"|"tauri")
        BUILD_CORE=true
        BUILD_DESKTOP=true
        BUILD_MOBILE=false
        ;;
    "mobile"|"flutter")
        BUILD_CORE=true
        BUILD_DESKTOP=false
        BUILD_MOBILE=true
        ;;
    "all")
        BUILD_CORE=true
        BUILD_DESKTOP=true
        BUILD_MOBILE=true
        ;;
    *)
        echo "Usage: $0 [core|desktop|mobile|all]"
        echo "  core:    Build Rust crates only"
        echo "  desktop: Build Rust + Tauri desktop app"
        echo "  mobile:  Build Rust + Flutter mobile app"
        echo "  all:     Build everything (default: release)"
        exit 1
        ;;
esac

echo "🎯 Build target: $BUILD_TYPE"

# Build Rust core
if [ "$BUILD_CORE" = true ]; then
    echo "🔧 Building Rust workspace..."
    if [ "$BUILD_TYPE" = "release" ]; then
        cargo build --workspace --release
    else
        cargo build --workspace
    fi
    echo "✅ Rust build completed"
fi

# Build desktop app
if [ "$BUILD_DESKTOP" = true ]; then
    echo "🖥️  Building desktop app..."
    cd apps/desktop/tauri-app/web
    if command -v pnpm > /dev/null; then
        pnpm install
        pnpm build
    else
        echo "⚠️  pnpm not found, skipping web build"
    fi
    cd "$PROJECT_ROOT"
    echo "✅ Desktop build completed"
fi

# Build mobile app
if [ "$BUILD_MOBILE" = true ]; then
    echo "📱 Building mobile app..."
    cd apps/mobile/flutter-app
    if command -v flutter > /dev/null; then
        flutter pub get
        flutter build apk --release
    else
        echo "⚠️  Flutter not found, skipping mobile build"
    fi
    cd "$PROJECT_ROOT"
    echo "✅ Mobile build completed"
fi

echo "🎉 Build completed successfully!"
echo "📁 Binaries: target/release/ (if release build)"
echo "💡 Use './scripts/dev.sh' to start the development service"
