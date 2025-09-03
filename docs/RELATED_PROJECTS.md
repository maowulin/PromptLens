## Related Open-Source Projects and Templates

This document lists reference projects close to PromptLens architecture (Rust core + Desktop app + Mobile app + Web server + Frontend static assets). Each entry includes what to learn and how it maps to our repo.

### 1) AppFlowy (Rust core + Flutter, monorepo)

- Repo: https://github.com/AppFlowy-IO/AppFlowy
- Why relevant: Mature monorepo with Rust core and Flutter UI across platforms.
- Learnings: Rust↔Flutter FFI, build/release pipelines, workspace scripts, CI, codegen.
- Apply here: Use their FFI patterns for `core/*` into `apps/mobile/flutter-app`.

### 2) RustDesk (Rust core + Flutter clients, multi-platform)

- Repo: https://github.com/rustdesk/rustdesk
- Why relevant: Complex cross-platform app with screen/audio capture & LAN features.
- Learnings: Screen/audio capture, client/server split, release engineering.
- Apply here: Model capture/audio modules in `core/capture`, `core/audio`; distribution.

### 3) LocalSend (LAN + Web control pattern)

- Repo: https://github.com/localsend/localsend
- Why relevant: Same “local server + LAN access” interaction pattern.
- Learnings: Service discovery, LAN UX, web control surface.
- Apply here: LAN discovery and UX for accessing `http://<host>:48080/`.

### 4) Tauri Plugins Workspace (desktop primitives)

- Repo: https://github.com/tauri-apps/plugins-workspace
- Why relevant: Ready-made plugins (autostart, single-instance, global-shortcut, etc.).
- Learnings: Cross-platform system capabilities via plugins.
- Apply here: Adopt plugins in `apps/desktop/tauri-app` instead of re-implementing.

### 5) Screenshot / Audio Capture Plugins for Tauri

- Screenshot: https://github.com/tauri-apps-community/tauri-plugin-screenshot
- Why relevant: Direct solutions for desktop capture.
- Apply here: Integrate into Tauri app and expose endpoints in `core/service` if needed.

### 6) Axum Static Files (ServeDir example)

- Example: https://github.com/tokio-rs/axum/tree/main/examples/static-file-server
- Why relevant: Best-practice static hosting from Rust server.
- Learnings: Mount `ServeDir` + error handling.
- Apply here: We already mounted `apps/web-client/dist` with fallback to desktop web.

### 7) Leptos + Axum Template (SSR/SPA hosting)

- Repo: https://github.com/leptos-rs/start-axum
- Why relevant: Integrates SPA build outputs with Axum hosting / routing fallbacks.
- Learnings: Build pipelines & server integration patterns.
- Apply here: Refine routing fallback for SPA frontends.

### 8) flutter_rust_bridge (FRB) Templates

- Repo: https://github.com/fzyzcjy/flutter_rust_bridge
- Why relevant: Production-grade Rust↔Flutter bridge.
- Learnings: Codegen/FFI, dev workflow, packaging.
- Apply here: Connect `core/*` crates to Flutter mobile app.

---

Suggested Adoption Order

1. Desktop: integrate Tauri plugins for screenshot/mic; keep Axum static hosting.
2. Mobile: adopt FRB for Rust core calls; reuse same HTTP endpoints + static UI.
3. Frontend: unify `apps/web-client` pipelines; ensure SPA routing fallback.
4. DevEx: mirror AppFlowy/RustDesk’s CI/release scripts for multi-platform builds.

Notes

- Prefer plugins and FRB over hand-rolled OS bindings to speed up delivery.
- Keep local server behavior consistent across desktop/mobile for LAN access.
