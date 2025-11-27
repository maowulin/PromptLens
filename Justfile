dev-web:
    cd apps/web-client && pnpm dev --host 0.0.0.0 --port 5173

dev-desktop:
    cd apps/desktop/tauri-app && pnpm tauri dev

build:
    cargo build --workspace
    cd apps/web-client && pnpm build

bundle:
    cd apps/desktop/tauri-app && pnpm tauri build

fmt:
    cargo fmt --all

lint:
    cargo clippy --workspace

test:
    cargo test --workspace

clean:
    cargo clean
    rm -rf apps/web-client/dist

install:
    cargo fetch
    cd apps/web-client && pnpm install
    cd apps/desktop/tauri-app && pnpm install

default:
    @just --list


