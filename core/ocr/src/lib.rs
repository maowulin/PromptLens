use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum OcrError {
    #[error("OCR provider error: {0}")]
    Provider(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OcrBlock {
    pub bbox: (u32, u32, u32, u32),
    pub text: String,
}


