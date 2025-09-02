use async_trait::async_trait;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AudioError {
    #[error("Device not found")]
    DeviceNotFound,
    #[error("Stream build failed: {0}")]
    StreamBuild(String),
}

#[derive(Clone, Copy, Debug)]
pub struct AudioConfig {
    pub sample_rate_hz: u32,
    pub channels: u16,
    pub frame_duration_ms: u16,
}

#[async_trait]
pub trait AudioCapture: Send + Sync {
    async fn start(&self) -> Result<(), AudioError>;
    async fn stop(&self) -> Result<(), AudioError>;
}


