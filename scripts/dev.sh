#!/bin/bash

# PromptLens Development Startup Script

# Function to stop development environment
stop_dev_environment() {
    echo "🛑 Stopping PromptLens development environment..."
    
    # Stop Tauri service
    if pgrep -f "promptlens-tauri" > /dev/null; then
        echo "🔄 Stopping Tauri service..."
        pkill -f "promptlens-tauri" || true
        echo "✅ Tauri service stopped"
    else
        echo "ℹ️  Tauri service not running"
    fi
    
    # Stop any remaining cargo processes
    if pgrep -f "cargo run" > /dev/null; then
        echo "🔄 Stopping cargo processes..."
        pkill -f "cargo run" || true
        echo "✅ Cargo processes stopped"
    fi
    
    echo "✅ Development environment stopped"
}

# Check if stop command is requested
if [ "$1" = "stop" ]; then
    stop_dev_environment
    exit 0
fi

echo "🚀 Starting PromptLens development environment..."

# Load cargo environment
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
    echo "✅ Cargo environment loaded"
fi

# Change to project root
cd "$(dirname "$0")/.."

# Function to show platform selection menu
show_platform_menu() {
    echo ""
    echo "🎯 Select platform to start:"
    echo "1) Linux Desktop (Tauri)"
    echo "2) Linux Mobile (Tauri - coming soon)"
    echo "3) Windows Desktop (Tauri)"
    echo "4) macOS Desktop (Tauri)"
    echo "5) Android (Tauri - coming soon)"
    echo "6) iOS (Tauri - coming soon)"
    echo "7) Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
}

# Function to start Linux Desktop (Tauri)
start_linux_desktop() {
    echo "🖥️  Starting Linux Desktop (Tauri)..."
    
    # Check if service is already running
    if pgrep -f "promptlens-tauri" > /dev/null; then
        echo "🔄 Service already running, restarting..."
        pkill -f "promptlens-tauri" || true
        sleep 1
    fi

    # Create logs directory if it doesn't exist
    mkdir -p logs

    # Change to Tauri app directory
    cd apps/desktop/tauri-app
    
    # Check if web frontend exists
    if [ ! -f "web/index.html" ]; then
        echo "❌ Web frontend not found"
        exit 1
    fi
    
    # Create dist directory for Tauri
    mkdir -p web/dist
    cp web/index.html web/dist/
    
    echo "🚀 Starting Tauri desktop application..."
    echo "💡 This will open a native Linux desktop window"
    echo "🎯 The app will run in the foreground - close the window to stop"
    
    # Start Tauri app using cargo run
    # This will open a native Linux desktop window
    RUST_LOG=info cargo run --bin promptlens-tauri
    
    # Note: This command will block until the app is closed
    # The user will see a native Linux desktop window
}

# Function to start Linux Mobile (Tauri - coming soon)
start_linux_mobile() {
    echo "📱 Linux Mobile (Tauri) - Coming Soon"
    echo "🚧 Tauri mobile support is being implemented"
    echo "💡 For now, use the desktop version or web client"
    echo ""
    read -p "Press Enter to return to menu..."
}

# Function to start Windows Desktop (Tauri)
start_windows_desktop() {
    echo "🪟 Windows Desktop (Tauri) - Not implemented yet"
    echo "💡 This feature will be available when running on Windows"
    echo "🔧 For now, you can use the Linux Desktop option"
}

# Function to start macOS Desktop (Tauri)
start_macos_desktop() {
    echo "🍎 macOS Desktop (Tauri) - Not implemented yet"
    echo "💡 This feature will be available when running on macOS"
    echo "🔧 For now, you can use the Linux Desktop option"
}

# Function to start Android (Tauri - coming soon)
start_android() {
    echo "🤖 Android (Tauri) - Coming Soon"
    echo "🚧 Tauri Android support is being implemented"
    echo "💡 For now, use the desktop version or web client"
    echo ""
    read -p "Press Enter to return to menu..."
}

# Function to start iOS (Tauri - coming soon)
start_ios() {
    echo "🍎 iOS (Tauri) - Coming Soon"
    echo "🚧 Tauri iOS support is being implemented"
    echo "💡 For now, use the desktop version or web client"
    echo ""
    read -p "Press Enter to return to menu..."
}

# Main script logic
echo "🔧 Platform: $(uname -s)"
echo "🏗️  Architecture: $(uname -m)"

# Show platform selection menu
show_platform_menu

# Handle user selection
case $choice in
    1)
        start_linux_desktop
        ;;
    2)
        start_linux_mobile
        ;;
    3)
        start_windows_desktop
        ;;
    4)
        start_macos_desktop
        ;;
    5)
        start_android
        ;;
    6)
        start_ios
        ;;
    7)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please select 1-7."
        exit 1
        ;;
esac

echo ""
echo "💡 Use './scripts/dev.sh stop' to stop the development environment"
echo "💡 Use './scripts/status.sh' to check service status"
