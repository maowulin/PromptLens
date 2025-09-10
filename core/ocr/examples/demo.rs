use pl_ocr::OcrBlock;

fn main() {
    let b = OcrBlock {
        bbox: (0, 0, 100, 40),
        text: "demo".into(),
    };
    println!("ocr example: bbox={:?} text={}", b.bbox, b.text);
}
