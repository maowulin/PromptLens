# PromptLens Platform Selection Guide

## 🎯 Overview

The new `dev.sh` script provides an interactive platform selection menu, allowing you to choose which application to start in development mode. This replaces the previous single-purpose startup scripts with a unified, user-friendly interface.

## 🚀 Quick Start

### Basic Usage

```bash
# Start development environment with platform selection
./scripts/dev.sh

# Stop development environment
./scripts/dev.sh stop

# Check service status
./scripts/status.sh
```

### Platform Selection Menu

When you run `./scripts/dev.sh`, you'll see this menu:

```
🎯 Select platform to start:
1) Linux Desktop (Tauri)
2) Linux Mobile (Flutter)
3) Windows Desktop (Tauri)
4) macOS Desktop (Tauri)
5) Android (Flutter)
6) iOS (Flutter)
7) Exit

Enter your choice (1-7):
```

## 🖥️ Linux Desktop (Tauri)

**Selection**: Option 1

**What it does**:

- Starts Rust backend service on port 48080
- Serves Tauri desktop interface
- Automatically opens browser (optional)
- Provides health monitoring endpoints
- Enables all API functionality

**Features**:

- Real-time service monitoring
- Audio recording controls
- Screenshot capture
- Device pairing
- Activity logs
- Metrics dashboard

**URLs**:

- Desktop Interface: http://127.0.0.1:48080
- Health Check: http://127.0.0.1:48080/health
- Metrics: http://127.0.0.1:48080/metrics

## 📱 Linux Mobile (Flutter)

**Selection**: Option 2

**What it does**:

- Checks Flutter installation
- Installs dependencies if needed
- Starts Flutter development server
- Opens Flutter DevTools
- Runs app in development mode

**Requirements**:

- Flutter SDK installed
- GUI environment (X11/Wayland) for visual development
- Headless mode available for WSL without GUI

## 🔄 Other Platforms

### Windows Desktop (Tauri)

- **Status**: Coming Soon
- **Description**: Will be available when running on Windows
- **Alternative**: Use Linux Desktop option

### macOS Desktop (Tauri)

- **Status**: Coming Soon
- **Description**: Will be available when running on macOS
- **Alternative**: Use Linux Desktop option

### Android (Flutter)

- **Status**: Coming Soon
- **Description**: Will be available when Android SDK is configured
- **Alternative**: Use Linux Mobile option

### iOS (Flutter)

- **Status**: Coming Soon
- **Description**: Will be available when Xcode is configured
- **Alternative**: Use Linux Mobile option

## 🛠️ Scripts and Commands

### Core Scripts

- `./scripts/dev.sh` - Main development startup script
- `./scripts/dev.sh stop` - Stop development environment
- `./scripts/status.sh` - Check service status
- `./scripts/test-desktop.sh` - Test desktop interface
- `./scripts/demo-platforms.sh` - Show platform demo

### Justfile Commands (if just is installed)

```bash
just dev          # Interactive platform selection
just dev-down     # Stop development environment
just dev-status   # Check service status
just dev-health   # Check service health
just dev-metrics  # Check service metrics
```

## 🔧 Technical Details

### Service Management

- **Process Detection**: Automatically detects running services
- **Graceful Shutdown**: Properly terminates all related processes
- **Port Management**: Checks port availability before starting
- **Log Management**: Centralized logging in `logs/promptlens.log`

### Platform Detection

- **Automatic Detection**: Detects current OS and architecture
- **Environment Check**: Verifies required tools are installed
- **GUI Support**: Detects X11/Wayland for Flutter development
- **WSL Support**: Optimized for Windows Subsystem for Linux

### Error Handling

- **Dependency Check**: Verifies required tools before starting
- **Service Validation**: Confirms service started successfully
- **Fallback Options**: Provides alternatives when features unavailable
- **Clear Messaging**: User-friendly error messages and suggestions

## 📋 Usage Examples

### Example 1: Start Linux Desktop

```bash
./scripts/dev.sh
# Select option 1
# Choose whether to open browser automatically
```

### Example 2: Start Linux Mobile

```bash
./scripts/dev.sh
# Select option 2
# Flutter will start in development mode
```

### Example 3: Stop Everything

```bash
./scripts/dev.sh stop
# Stops all development processes
```

### Example 4: Check Status

```bash
./scripts/status.sh
# Shows current service status
```

## 🚨 Troubleshooting

### Common Issues

#### Service Won't Start

```bash
# Check if port is already in use
ss -ltnp | grep 48080

# Check logs
cat logs/promptlens.log

# Restart service
./scripts/dev.sh stop
./scripts/dev.sh
```

#### Flutter Not Working

```bash
# Check Flutter installation
flutter --version

# Check GUI environment
echo $DISPLAY
echo $WAYLAND_DISPLAY

# Install Flutter if needed
# Visit: https://flutter.dev/docs/get-started/install/linux
```

#### Browser Won't Open

```bash
# Manual access
# Open: http://127.0.0.1:48080

# Check if service is running
./scripts/status.sh
```

### Debug Mode

```bash
# Run service in foreground for debugging
RUST_LOG=info cargo run -p promptlens-tauri --bin promptlens-tauri
```

## 🔮 Future Enhancements

### Planned Features

- **Hot Reload**: Automatic restart on code changes
- **Multi-Platform**: Simultaneous development on multiple platforms
- **Profile Management**: Save and load development configurations
- **Dependency Management**: Automatic dependency installation
- **Performance Monitoring**: Real-time performance metrics

### Platform Support Roadmap

1. **Phase 1**: Linux Desktop & Mobile ✅
2. **Phase 2**: Windows Desktop & Android
3. **Phase 3**: macOS Desktop & iOS
4. **Phase 4**: Cross-platform synchronization

## 📚 Additional Resources

- [Tauri Documentation](https://tauri.app/docs/)
- [Flutter Documentation](https://flutter.dev/docs/)
- [Rust Documentation](https://doc.rust-lang.org/)
- [Project Architecture](ARCHITECTURE.md)
- [Development Setup](CONTRIBUTING.md)

---

**Note**: This guide is part of the PromptLens project. For issues or questions, please refer to the project documentation or create an issue in the repository.
