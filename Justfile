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


