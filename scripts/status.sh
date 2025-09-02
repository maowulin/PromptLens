#!/bin/bash

# PromptLens Status Script - Core Services Only
echo "📊 PromptLens Core Services Status"
echo "=================================="

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check service status
echo "🚀 Core Service:"
if pgrep -f "promptlens-tauri" > /dev/null; then
    echo "  ✅ Running"
    
    # Check port and endpoints
    if ss -ltnp | grep 48080 > /dev/null; then
        echo "  ✅ Port 48080 listening"
        
        # Quick endpoint test
        if curl -s http://127.0.0.1:48080/health > /dev/null 2>&1; then
            echo "  ✅ Health check OK"
        else
            echo "  ❌ Health check failed"
        fi
    else
        echo "  ⚠️  Port not listening"
    fi
else
    echo "  ❌ Not running"
fi

# Check core libraries
echo ""
echo "📚 Core Libraries:"
core_libs=("audio" "capture" "asr" "ocr" "service" "storage")
for lib in "${core_libs[@]}"; do
    if [ -f "$PROJECT_ROOT/core/$lib/Cargo.toml" ]; then
        echo "  ✅ pl-$lib"
    else
        echo "  ❌ pl-$lib"
    fi
done

# Check applications
echo ""
echo "🖥️  Applications:"
if [ -f "$PROJECT_ROOT/apps/desktop/tauri-app/src-tauri/Cargo.toml" ]; then
    echo "  ✅ Tauri Desktop"
else
    echo "  ❌ Tauri Desktop"
fi

if [ -f "$PROJECT_ROOT/apps/mobile/flutter-app/pubspec.yaml" ]; then
    echo "  ✅ Flutter Mobile"
else
    echo "  ❌ Flutter Mobile"
fi

# Quick actions
echo ""
echo "💡 Quick Actions:"
echo "  Start:  ./scripts/dev.sh"
echo "  Stop:   ./scripts/dev.sh stop"
echo "  Build:  ./scripts/build.sh"
