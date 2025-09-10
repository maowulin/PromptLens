use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AsrError {
    #[error("Provider error: {0}")]
    Provider(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranscriptDelta {
    pub lang: String,
    pub text: String,
    pub is_final: bool,
}

#[async_trait]
pub trait AsrStream: Send + Sync {
    async fn push_pcm(&self, _pcm: &[i16]);
}
