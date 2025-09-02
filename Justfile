set shell := ["bash", "-cu"]

build-core:
    cargo build --workspace --release

build-desktop:
    cd apps/desktop/tauri-app/web && pnpm i && pnpm build
    cd apps/desktop/tauri-app && pnpm tauri build

build-mobile:
    cd apps/mobile/flutter-app && flutter build apk --release

fmt:
    cargo fmt --all

lint:
    cargo clippy --workspace --all-targets -- -D warnings

test:
    cargo test --workspace

run-service:
    RUST_LOG=info cargo run -p promptlens-tauri --bin promptlens-tauri

# Non-blocking dev helpers
dev-up:
    pkill -f promptlens-tauri || true
    nohup sh -c '. "$HOME/.cargo/env"; RUST_LOG=info HOST=${HOST:-127.0.0.1} PORT=${PORT:-48080} cargo run -p promptlens-tauri --bin promptlens-tauri' > logs/promptlens.log 2>&1 &
    echo $!

dev-down:
    pkill -f promptlens-tauri || true

dev-status:
    ss -ltnp | grep ${PORT:-48080} || true

dev-health:
    timeout 2s curl -sS http://${HOST:-127.0.0.1}:${PORT:-48080}/readyz || true

dev-metrics:
    timeout 2s curl -sS http://${HOST:-127.0.0.1}:${PORT:-48080}/metrics | head -n 10 || true


