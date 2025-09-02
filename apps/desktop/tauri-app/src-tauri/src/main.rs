use pl_service::serve_http;
use std::net::SocketAddr;
use tracing_subscriber::EnvFilter;
use std::env;
use dotenvy::dotenv;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter(EnvFilter::from_default_env()).init();
    dotenv().ok();
    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".into());
    let port = env::var("PORT").unwrap_or_else(|_| "48080".into());
    let addr: SocketAddr = format!("{}:{}", host, port).parse().unwrap();
    serve_http(addr).await;
}


