#!/bin/bash

# PromptLens Development Startup Script
echo "🚀 Starting PromptLens development environment..."

# Load cargo environment
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
    echo "✅ Cargo environment loaded"
fi

# Change to project root
cd "$(dirname "$0")/.."

# Check if service is already running
if pgrep -f "promptlens-tauri" > /dev/null; then
    echo "🔄 Service already running, restarting..."
    pkill -f "promptlens-tauri" || true
    sleep 1
fi

# Start service in background
echo "🚀 Starting service on port 48080..."
nohup sh -c 'RUST_LOG=info HOST=127.0.0.1 PORT=48080 cargo run -p promptlens-tauri --bin promptlens-tauri' > logs/promptlens.log 2>&1 &

echo "✅ Service started"
echo "📝 Logs: logs/promptlens.log"
echo "🌐 Health check: http://127.0.0.1:48080/readyz"
echo "💡 Use 'just dev-down' to stop the service"
