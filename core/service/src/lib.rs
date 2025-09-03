use axum::{
    extract::Path,
    http::StatusCode,
    response::{IntoResponse, Response, Html},
    routing::{get, post, get_service},
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

    // Choose static assets directory: prefer web-client/dist, fallback to tauri web/dist
    let crate_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let primary_static = crate_dir.join("../../apps/web-client/dist");
    let fallback_static = crate_dir.join("../../apps/desktop/tauri-app/web/dist");

    let mut app = Router::new()
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

    // Mount static assets at /
    if primary_static.exists() {
        app = app.route_service(
            "/",
            get_service(tower_http::services::ServeDir::new(primary_static))
                .handle_error(|_err| async move { (StatusCode::INTERNAL_SERVER_ERROR, "static error") }),
        );
    } else if fallback_static.exists() {
        app = app.route_service(
            "/",
            get_service(tower_http::services::ServeDir::new(fallback_static))
                .handle_error(|_err| async move { (StatusCode::INTERNAL_SERVER_ERROR, "static error") }),
        );
    } else {
        app = app.route("/", get(desktop_interface));
    }

    info!(%addr, "service starting");
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind");
    axum::serve(listener, app).await.expect("serve");
}

async fn desktop_interface() -> Html<&'static str> {
    HTTP_COUNTER.inc();
    // Check if web-client dist exists, otherwise fallback to desktop web
    let web_client_path = "../../../apps/web-client/dist/index.html";
    let fallback_path = "../../../apps/desktop/tauri-app/web/index.html";
    
    // For now, return a simple message directing to the web client
    Html(r#"
    <!DOCTYPE html>
    <html>
    <head>
        <title>PromptLens Server</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            .title { font-size: 2em; margin-bottom: 20px; }
            .message { font-size: 1.2em; margin-bottom: 30px; color: #666; }
            .link { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="title">📱 PromptLens Server</h1>
            <p class="message">桌面应用程序正在运行</p>
            <p class="message">Web 客户端正在开发中，请使用桌面应用程序进行操作</p>
            <p><strong>API 端点可用:</strong></p>
            <ul style="text-align: left; display: inline-block;">
                <li>GET /health - 健康检查</li>
                <li>GET /metrics - 服务指标</li>
                <li>POST /v1/record/start - 开始录制</li>
                <li>POST /v1/record/stop - 停止录制</li>
                <li>POST /v1/capture/screenshot - 截图</li>
                <li>POST /v1/pair - 设备配对</li>
            </ul>
        </div>
    </body>
    </html>
    "#)
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


