# PromptLens Desktop Interface

A modern, clean desktop interface for the PromptLens AI-powered audio & visual intelligence platform.

## 🚀 Features

### 📊 Service Status Dashboard

- Real-time service health monitoring
- Live metrics display (uptime, request count)
- Service status indicators with visual feedback

### 🎤 Audio Recording

- Start/stop audio recording with configurable sample rates
- Real-time recording status with animated indicators
- Recording duration timer
- Support for 16kHz, 22.05kHz, 44.1kHz, and 48kHz sample rates

### 📸 Screenshot Capture

- Multiple capture modes:
  - Full Screen
  - Active Window
  - Selected Region
- Instant capture with result feedback
- Image ID generation for tracking

### 🔗 Device Pairing

- Easy device pairing with customizable tokens
- Session management
- Pairing status feedback

### 📋 Activity Logs

- Real-time activity logging
- Timestamped entries
- Clear logs functionality
- Scrollable log history

## 🎨 Design Features

- **Modern UI**: Clean, card-based layout with gradient backgrounds
- **Responsive Design**: Adapts to different screen sizes
- **Visual Feedback**: Status indicators, animations, and color coding
- **Intuitive Controls**: Easy-to-use buttons and form controls
- **Real-time Updates**: Automatic status updates every 10 seconds

## 🛠️ Technical Details

- **Frontend**: Pure HTML/CSS/JavaScript (no frameworks)
- **Backend API**: Communicates with Rust backend on port 48080
- **Real-time**: Automatic health checks and metrics updates
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🚀 Getting Started

1. **Start the Service**:

   ```bash
   ./scripts/dev.sh
   ```

2. **Open Desktop Interface**:

   ```bash
   ./scripts/open-desktop.sh
   ```

   Or manually open: http://127.0.0.1:48080

3. **Check Service Status**:
   ```bash
   ./scripts/status.sh
   ```

## 🔧 API Endpoints Used

- `GET /health` - Service health check
- `GET /metrics` - Service metrics
- `POST /v1/record/start` - Start audio recording
- `POST /v1/record/stop` - Stop audio recording
- `POST /v1/capture/screenshot` - Capture screenshot
- `POST /v1/pair` - Device pairing

## 🎯 Use Cases

- **Audio Processing**: Record audio for ASR (Automatic Speech Recognition)
- **Visual Analysis**: Capture screenshots for OCR and image analysis
- **Device Management**: Pair and manage multiple devices
- **Monitoring**: Real-time service health and performance monitoring

## 🔮 Future Enhancements

- Real-time audio waveform visualization
- Image preview and editing capabilities
- Advanced device management dashboard
- Performance analytics and charts
- Customizable themes and layouts

## 📱 Mobile Companion

This desktop interface works alongside the Tauri mobile app for a complete cross-platform experience.

---

Built with ❤️ using Tauri, Rust, and modern web technologies.
