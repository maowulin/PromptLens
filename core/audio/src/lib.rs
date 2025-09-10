use async_trait::async_trait;
use serde::Serialize;
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

// --- New: Device enumeration API ---
#[derive(Debug, Clone, Serialize)]
pub struct AudioDeviceInfo {
    pub id: String,
    pub name: String,
    pub is_default: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct AudioDevices {
    pub inputs: Vec<AudioDeviceInfo>,
    pub outputs: Vec<AudioDeviceInfo>,
}

pub fn list_devices() -> Result<AudioDevices, AudioError> {
    use cpal::traits::{DeviceTrait, HostTrait};

    let host = cpal::default_host();

    // Inputs
    let default_input = host.default_input_device();
    let default_input_name = default_input.as_ref().and_then(|d| d.name().ok());
    let mut inputs = Vec::new();
    if let Ok(devices) = host.input_devices() {
        for d in devices {
            let name = d.name().unwrap_or_else(|_| "Unknown".to_string());
            let id = format!("{:?}", d.name().ok().unwrap_or_else(|| name.clone()));
            let is_default = default_input_name
                .as_ref()
                .map(|n| n == &name)
                .unwrap_or(false);
            inputs.push(AudioDeviceInfo {
                id,
                name,
                is_default,
            });
        }
    }

    // Outputs
    let default_output = host.default_output_device();
    let default_output_name = default_output.as_ref().and_then(|d| d.name().ok());
    let mut outputs = Vec::new();
    if let Ok(devices) = host.output_devices() {
        for d in devices {
            let name = d.name().unwrap_or_else(|_| "Unknown".to_string());
            let id = format!("{:?}", d.name().ok().unwrap_or_else(|| name.clone()));
            let is_default = default_output_name
                .as_ref()
                .map(|n| n == &name)
                .unwrap_or(false);
            outputs.push(AudioDeviceInfo {
                id,
                name,
                is_default,
            });
        }
    }

    Ok(AudioDevices { inputs, outputs })
}
