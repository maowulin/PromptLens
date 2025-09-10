#!/bin/bash

# PromptLens One-Click Installation Script

echo "🚀 PromptLens One-Click Installation"
echo "====================================="
echo ""

# Change to project root
cd "$(dirname "$0")/.."

# Check if just is installed
if ! command -v just > /dev/null; then
    echo "❌ 'just' command not found. Please install it first:"
    echo "   cargo install just"
    echo "   # or"
    echo "   sudo apt install just"
    exit 1
fi

echo "📦 Installing all dependencies (system + project)..."
echo ""

# Run the install-all command
just install-all

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Installation completed successfully!"
    echo ""
    echo "💡 Quick start commands:"
    echo "   just dev          # Start development environment"
    echo "   just build        # Build all components"
    echo "   just --list       # Show all available commands"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi