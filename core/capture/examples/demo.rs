use pl_capture::CaptureConfig;

fn main() {
    let cfg = CaptureConfig {
        max_fps: 2,
        max_width: 1280,
    };
    println!(
        "capture example: fps={} width={} ",
        cfg.max_fps, cfg.max_width
    );
}
