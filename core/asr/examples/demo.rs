use pl_asr::TranscriptDelta;

fn main() {
    let d = TranscriptDelta {
        lang: "zh".into(),
        text: "hello".into(),
        is_final: false,
    };
    println!("asr example: {}:{} final={}", d.lang, d.text, d.is_final);
}
