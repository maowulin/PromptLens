use axum::{
    extract::Path,
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};
use std::time::Duration;
use once_cell::sync::Lazy;
use prometheus::{Encoder, IntCounter, Registry, TextEncoder};
use std::net::SocketAddr;
use tracing::info;

#[derive(Debug, Serialize)]
struct HealthResp {
    ok: bool,
}

#[derive(Debug, Deserialize)]
struct PairReq {
    pair_token: String,
}

#[derive(Debug, Serialize)]
struct PairResp {
    session_id: String,
}

static REGISTRY: Lazy<Registry> = Lazy::new(Registry::new);
static HTTP_COUNTER: Lazy<IntCounter> = Lazy::new(|| {
    let c = IntCounter::new("http_requests_total", "Total HTTP requests").unwrap();
    REGISTRY.register(Box::new(c.clone())).ok();
    c
});

pub async fn serve_http(addr: SocketAddr) {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/readyz", get(|| async { "ok" }))
        .route("/livez", get(|| async { "ok" }))
        .route("/metrics", get(move || async move {
            HTTP_COUNTER.inc();
            let mut buf = Vec::new();
            let encoder = TextEncoder::new();
            let mf = REGISTRY.gather();
            encoder.encode(&mf, &mut buf).unwrap();
            ([("Content-Type", "text/plain; version=0.0.4")], buf)
        }))
        .route("/v1/pair", post(pair))
        .route("/v1/record/start", post(record_start))
        .route("/v1/record/stop", post(record_stop))
        .route("/v1/capture/screenshot", post(capture_screenshot))
        .route("/v1/image/:image_id", get(get_image))
        .layer(cors);

    info!(%addr, "service starting");
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind");
    axum::serve(listener, app).await.expect("serve");
}

async fn pair(Json(_req): Json<PairReq>) -> impl IntoResponse {
    HTTP_COUNTER.inc();
    let session_id = format!("s-{}", uuid::Uuid::new_v4());
    Json(PairResp { session_id })
}

async fn record_start() -> impl IntoResponse {
    HTTP_COUNTER.inc();
    Json(serde_json::json!({ "ok": true }))
}

async fn record_stop() -> impl IntoResponse {
    HTTP_COUNTER.inc();
    Json(serde_json::json!({ "ok": true }))
}

async fn capture_screenshot() -> impl IntoResponse {
    HTTP_COUNTER.inc();
    let image_id = format!("img-{}", uuid::Uuid::new_v4());
    Json(serde_json::json!({ "image_id": image_id }))
}

async fn get_image(Path(_image_id): Path<String>) -> Response {
    HTTP_COUNTER.inc();
    let bytes: Vec<u8> = b"not-implemented".to_vec();
    ([("Content-Type", "application/octet-stream")], bytes).into_response()
}


