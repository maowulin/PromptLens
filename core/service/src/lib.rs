use axum::{routing::get, Router};
use std::net::SocketAddr;
use tracing::info;

pub async fn serve_http(addr: SocketAddr) {
    let app = Router::new().route("/health", get(|| async { "ok" }));
    info!(%addr, "service starting");
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind");
    axum::serve(listener, app).await.expect("serve");
}


