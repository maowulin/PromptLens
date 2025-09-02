#!/bin/bash

# PromptLens Cleanup Script
echo "🧹 Cleaning up PromptLens project..."

cd "$(dirname "$0")/.."

# Stop running services
echo "🛑 Stopping services..."
pkill -f "promptlens-tauri" || true

# Clean Rust build artifacts
echo "🗑️  Cleaning Rust build artifacts..."
cargo clean --workspace

# Clean logs
if [ -d "logs" ]; then
    echo "🗑️  Cleaning logs..."
    rm -rf logs/*
    echo "📁 Kept logs directory"
fi

echo "✅ Cleanup completed!"
echo "💡 Use './scripts/dev.sh' to start fresh development environment"
