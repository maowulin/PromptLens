use thiserror::Error;

#[derive(Debug, Error)]
pub enum CaptureError {
    #[error("Permission denied or not granted")]
    Permission,
    #[error("Capture backend unavailable")]
    BackendUnavailable,
}

#[derive(Clone, Copy, Debug)]
pub struct CaptureConfig {
    pub max_fps: u8,
    pub max_width: u32,
}

pub trait ScreenCapture {
    fn capture_once(&self, cfg: &CaptureConfig) -> Result<Vec<u8>, CaptureError>;
}
