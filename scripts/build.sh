#!/bin/bash

# PromptLens Build Script
echo "🔨 Building PromptLens project..."

# Load cargo environment
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

cd "$(dirname "$0")/.."

# Build Rust workspace
echo "🔧 Building Rust workspace..."
cargo build --workspace
echo "✅ Rust build completed"

echo "🎉 Build completed successfully!"
echo "💡 Use './scripts/dev.sh' to start the development service"
