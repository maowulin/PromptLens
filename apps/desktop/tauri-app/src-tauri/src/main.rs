use tokio::time::Duration;

#[tokio::main]
async fn main() {
    // Start HTTP server in background on all interfaces
    let server_addr = "0.0.0.0:48080".parse().unwrap();
    
    tokio::spawn(async move {
        println!("Starting HTTP server on {}", server_addr);
        pl_service::serve_http(server_addr).await;
    });
    
    // Wait a bit for server to start
    tokio::time::sleep(Duration::from_millis(500)).await;
    
    println!("PromptLens Desktop starting...");
    println!("Local server available on all network interfaces: http://0.0.0.0:48080");
    println!("Access from other devices using your local IP address and port 48080");
    
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


