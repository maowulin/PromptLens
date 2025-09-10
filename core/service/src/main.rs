use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    // Bind address (default to 127.0.0.1:48080)
    let addr: SocketAddr = std::env::var("PL_SERVICE_ADDR")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or_else(|| "127.0.0.1:48080".parse().expect("parse addr"));

    pl_service::serve_http(addr).await;
}
