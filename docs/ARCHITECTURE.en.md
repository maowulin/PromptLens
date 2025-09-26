[README](/README.md) · [中文](/docs/ARCHITECTURE.md) · [LICENSE](/LICENSE)

# Architecture

This project follows a layered design: Desktop shell + Rust Core + Local Web Service + Mobile companion, optimized for local-first processing and secure LAN control.

## Overview
- Desktop (Tauri): UI shell that talks to the local service; displays live captions/translation, screenshot OCR results, and suggestion cards.
- Rust Core:
  - Audio capture + VAD
  - ASR adapters (local/cloud, swappable)
  - Screen capture + encoding (on demand)
  - OCR pipeline
  - NLU (translate/summarize/keywords/suggestions)
  - Local Web Service (REST/WS/TLS with self-signed cert + fingerprint pinning)
  - Pairing & auth (mDNS/QR + short-lived token)
  - Storage (SQLite/SQLCipher)
- Mobile (Tauri): Companion screen and remote control panel; can trigger screenshots and view results.
- Shared: OpenAPI/Proto and UI tokens shared across apps.

```mermaid
flowchart LR
  subgraph Desktop[Tauri Desktop]
    DUI[UI]
  end

  subgraph Core[Rust Core]
    AC[Audio+VAD] --> ASR[ASR Adapter]
    ASR --> NLU[Translate/Summarize]
    CAP[Screen Capture] --> OCR[OCR]
    SVC[Local Service (REST/WS/TLS)]
    AUTH[Pairing/Auth]
    DB[(SQLite/SQLCipher)]
    AC --> SVC
    NLU --> SVC
    CAP --> OCR --> SVC
    SVC <---> AUTH
    SVC <---> DB
  end

  subgraph Mobile[Tauri Companion]
    MUI[Companion UI]
  end

  DUI <-- IPC/HTTP/WS --> SVC
  MUI <-- WS/TLS --> SVC
```

## Data & Security Highlights
- Local-first by default; cloud models are optional enhancements.
- Permissions and indicators: microphone/screen permissions are explicit; actions require user initiation.
- Secure links: TLS (self-signed + fingerprint), short-lived tokens, session renewal, and rate limits.

(For more details, refer to the root ARCHITECTURE.md.)

## Todo List

- P0 (MVP)
  - [ ] Rust Core: audio capture + VAD skeleton; cloud ASR adapter; subtitle delta over WS
  - [ ] Local Service: axum REST/WS; self-signed TLS with fingerprint; mDNS/QR pairing + short-lived token; rate limit & session renewal
  - [ ] Desktop: Tauri shell; subtitle view; permission onboarding (mic/screen)
  - [ ] Screenshot + OCR: minimal loop for `POST /v1/capture/screenshot[+ocr]`; suggestion cards placeholder
  - [ ] Storage & Export: SQLite/SQLCipher; export Markdown
  - Tooling
    - [x] Just tasks: fmt / lint / test
    - [x] CI cache (Rust cargo cache)
    - [ ] CI path filters (trigger only when relevant modules change)
- P1 (Enhancements)
  - [ ] Local Whisper (GPU preferred) mode switch; OCR layout/code-problem optimization
  - [ ] Mobile companion: event stream view + remote screenshot trigger UI
  - [ ] Settings center and logs/diagnostics; error reporting (optional, user-consented)
  - [ ] Packaging & Distribution: Windows (MSIX), macOS (Notarization), Linux (AppImage/Snap)