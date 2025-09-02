use pl_audio::{AudioConfig};

fn main() {
    let cfg = AudioConfig { sample_rate_hz: 16000, channels: 1, frame_duration_ms: 20 };
    println!("audio example: sample_rate={} channels={} frame_ms={}", cfg.sample_rate_hz, cfg.channels, cfg.frame_duration_ms);
}


