use pl_service::serve_http;
use std::net::SocketAddr;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter(EnvFilter::from_default_env()).init();
    let addr: SocketAddr = "127.0.0.1:48080".parse().unwrap();
    serve_http(addr).await;
}


