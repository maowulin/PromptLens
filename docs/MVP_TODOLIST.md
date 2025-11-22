# PromptLens MVP Todolist

## 🎯 MVP 目标

**Week 1**: 麦克风说话 → 网页显示实时文字  
**Week 2**: 网页点按钮 → 截图 + OCR + AI建议  
**Week 3**: 手机连接 + 完整场景演示

---

## Week 1: 实时语音转文字 (7天)

### Day 1-2: 音频采集实现

**文件**: `core/audio/src/capture.rs`

- [ ] 创建 CpalAudioCapture 结构体
  - 包含 `mpsc::Sender<Vec<i16>>`
  - 配置: 16kHz, 单声道, 200ms buffer
- [ ] 实现 AudioCapture trait
  - `async fn start()`: 创建 cpal stream + 启动采集
  - `async fn stop()`: 停止 stream + 清理资源
- [ ] 编写测试用例

**验证命令**:
```bash
cargo run -p pl-audio --example capture_demo
# 预期: 显示 "Received 3200 samples (200ms)"
```

**完成标准**: ✓ 编译通过 ✓ 测试通过 ✓ example 显示 PCM 数据

---

### Day 3-4: ASR 云端转写

**文件**: `core/asr/src/openai.rs`

- [ ] 添加依赖到 `core/asr/Cargo.toml`
  ```toml
  reqwest = { version = "0.11", features = ["json", "multipart"] }
  ```
- [ ] 创建 OpenAIAsrStream 结构体
- [ ] 实现 AsrStream trait
  - PCM → WAV 格式封装
  - 调用 OpenAI Whisper API
  - 解析返回的 TranscriptDelta
- [ ] 添加批处理 (累积1-2秒再发送)

**验证命令**:
```bash
export OPENAI_API_KEY="sk-..."
cargo run -p pl-asr --example openai_demo
# 预期: "Received: 你好，这是测试" + "Latency: 487ms"
```

**完成标准**: ✓ API调用成功 ✓ 延迟 < 1s ✓ 错误处理完善

---

### Day 5: 连接到服务层

**文件**: `core/service/src/state.rs`, `core/service/src/lib.rs`

- [ ] 创建 AppState
  ```rust
  pub struct AppState {
      audio_capture: Arc<Mutex<Option<CpalAudioCapture>>>,
      asr_stream: Arc<Mutex<Option<OpenAIAsrStream>>>,
      transcript_tx: broadcast::Sender<TranscriptDelta>,
  }
  ```
- [ ] 修改 `/v1/record/start`
  - 创建 audio + asr 实例
  - 启动后台任务: audio → asr 管道
- [ ] 修改 `/v1/record/stop`
  - 停止采集 + 清理任务

**验证命令**:
```bash
cargo run -p pl-service &
curl -X POST http://localhost:48080/v1/record/start
# 对着麦克风说话，观察日志显示 ASR 文本
curl -X POST http://localhost:48080/v1/record/stop
```

**完成标准**: ✓ 录音启动成功 ✓ 日志显示ASR结果 ✓ 停止正常

---

### Day 6: WebSocket 实时推送

**文件**: `core/service/src/ws.rs`

- [ ] 添加 WebSocket 路由
  ```rust
  app.route("/v1/stream/events", get(ws_handler))
  ```
- [ ] 实现 ws_handler
  - HTTP → WebSocket 升级
  - 订阅 broadcast channel
  - 推送 TranscriptDelta JSON
- [ ] 在 ASR 管道中广播结果

**验证命令**:
```bash
# Terminal 1
cargo run -p pl-service

# Terminal 2
websocat ws://localhost:48080/v1/stream/events

# Terminal 3
curl -X POST http://localhost:48080/v1/record/start
# 对着麦克风说话

# Terminal 2 应显示:
# {"type":"transcript.delta","data":{"text":"你好","is_final":false}}
```

**完成标准**: ✓ WS连接成功 ✓ 实时接收字幕 ✓ 延迟 < 2s

---

### Day 7: 前端实时字幕

**文件**: 
- `apps/web-client/src/lib/useWebSocket.ts`
- `apps/web-client/src/components/TranscriptView.tsx`

- [ ] 创建 WebSocket hook
  - 连接 `ws://localhost:48080/v1/stream/events`
  - 自动重连机制
- [ ] 创建字幕显示组件
  - 滚动显示
  - 区分 is_final (灰色/黑色)
  - 显示时间戳
- [ ] 集成到 DesktopApp.tsx
  - 录音时连接 WS
  - 显示实时字幕
  - 添加"复制全文"按钮

**验证**:
```bash
cargo run -p pl-service &
cd apps/web-client && pnpm dev:desktop
# 浏览器: 点击"开始录音" → 说话 → 观察实时文字
```

**完成标准**: ✓ 实时显示 ✓ UI流畅 ✓ 可复制文本

---

### ✅ Week 1 交付

- [ ] 录制 Demo 视频 (2分钟)
  - 打开应用 → 开始录音 → 说话 → 显示文字 → 停止录音
- [ ] 保存为 `demos/week1-realtime-transcript.mp4`
- [ ] 测试报告: `docs/week1-test-report.md`
  - 延迟统计
  - 准确率测试 (10个样本)
  - 成本估算

---

## Week 2: 截图 + OCR + AI问答 (7天)

### Day 1-2: 优化截图功能

**文件**: `core/service/src/lib.rs`

- [ ] WebP 编码优化
  ```rust
  // 使用 webp crate, 质量75
  let encoder = webp::Encoder::from_rgba(&img, width, height);
  let encoded = encoder.encode(75.0);
  ```
- [ ] 添加限流 (tower::limit)
  - 每秒最多2次截图
- [ ] 自动清理
  - LRU Cache 限制50张
  - 或5分钟后自动删除
- [ ] 多显示器支持

**验证命令**:
```bash
curl -X POST http://localhost:48080/v1/capture/screenshot
curl http://localhost:48080/v1/image/img-xxx -o test.webp
ls -lh test.webp  # 应该 < 200KB
```

**完成标准**: ✓ WebP正常 ✓ 文件<200KB ✓ 限流生效

---

### Day 3-4: OCR 接入

**文件**: `core/ocr/src/provider.rs`

- [ ] 选择 OCR 方案
  - 推荐: 云端 OCR (百度/阿里云/Google Vision)
  - 备选: Tesseract (本地, 免费)
- [ ] 实现 OcrProvider trait
  ```rust
  pub trait OcrProvider {
      async fn extract_text(&self, image: &[u8]) -> Result<Vec<OcrBlock>>;
  }
  ```
- [ ] 新增 API: `POST /v1/capture/screenshot+ocr`
  - 返回 `{ image_id, ocr_blocks: [...] }`
- [ ] 添加 OCR 缓存

**验证命令**:
```bash
curl -X POST http://localhost:48080/v1/capture/screenshot+ocr
# 返回: {"image_id":"img-xxx", "ocr_blocks":[{"text":"Hello"}]}
```

**完成标准**: ✓ 准确率>90%(英文) ✓ 准确率>85%(中文) ✓ 延迟<2s

---

### Day 5-6: LLM AI 建议

**文件**: `core/service/src/llm.rs`

- [ ] 实现 LLM 调用
  ```rust
  async fn generate_suggestion(
      ocr_text: &str, 
      mode: SceneMode
  ) -> Result<Vec<AiSuggestion>>
  ```
- [ ] 面试模式 Prompt
  ```
  以下是面试问题: {ocr_text}
  请提供:
  1. 问题理解
  2. 简洁答案 (3-5句)
  3. 关键要点
  ```
- [ ] 集成到 screenshot+ocr API
  - 返回 `{ image_id, ocr_blocks, ai_suggestions }`

**验证命令**:
```bash
# 打开 LeetCode 面试题页面
curl -X POST http://localhost:48080/v1/capture/screenshot+ocr \
  -d '{"mode":"interview"}'
# 返回包含 ai_suggestions 字段
```

**完成标准**: ✓ LLM返回合理 ✓ 延迟<3s ✓ 成本<$0.01/次

---

### Day 7: 前端集成

**文件**: `apps/web-client/src/components/ScreenshotView.tsx`

- [ ] 创建截图展示组件
  - 显示图片
  - OCR 文本框标注
  - AI 建议卡片 (Markdown渲染)
- [ ] 添加"智能截图"按钮
- [ ] 实现历史截图列表 (左侧缩略图)

**验证**:
```bash
# 打开 LeetCode → 点击"智能截图" → 显示OCR+AI建议
```

**完成标准**: ✓ UI美观 ✓ OCR可见 ✓ AI建议可读

---

### ✅ Week 2 交付

- [ ] 录制 Demo 视频 (3分钟)
  - 打开面试题 → 智能截图 → 显示OCR → 显示AI答案 → 复制代码
- [ ] 保存为 `demos/week2-screenshot-ocr-ai.mp4`
- [ ] 测试报告: 10个面试题测试结果

---

## Week 3: 跨设备 + 完整场景 (7天)

### Day 1-2: mDNS 设备发现

**文件**: `core/service/src/discovery.rs`

- [ ] 实现 mDNS 广播
  - 服务名: `_promptlens._tcp.local.`
  - 包含: 设备名, IP, 端口
- [ ] 实现配对机制
  - 生成6位配对码
  - `POST /v1/pair { "pair_code": "123456" }`
- [ ] 生成二维码
  - `GET /v1/pair/qrcode` 返回 SVG

**验证命令**:
```bash
avahi-browse -r _promptlens._tcp
curl http://localhost:48080/v1/pair/qrcode > qr.svg
```

**完成标准**: ✓ mDNS正常 ✓ 二维码生成 ✓ 手机可连接

---

### Day 3-4: 场景模式系统

**文件**: `core/service/src/scenes.rs`, 前端场景切换

- [ ] 定义场景枚举
  ```rust
  pub enum SceneMode {
      Meeting,   // 会议: ASR + 翻译 + 摘要
      Interview, // 面试: OCR + 编程题
      Coding,    // 编程: 代码截图 + 建议
      Free,      // 自由模式
  }
  ```
- [ ] 前端场景标签页
  - 4个场景快速切换
- [ ] 每个场景独立配置
  - 启用/禁用 ASR, OCR, 翻译等

**完成标准**: ✓ 场景切换流畅 ✓ 配置生效

---

### Day 5-6: 会议管理功能

**文件**: `core/storage/src/schema.sql`

- [ ] 数据库 schema
  ```sql
  CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      scene_mode TEXT,
      start_time INTEGER,
      duration_seconds INTEGER,
      title TEXT
  );
  
  CREATE TABLE transcripts (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      timestamp INTEGER,
      text TEXT,
      lang TEXT
  );
  ```
- [ ] 会议历史 API
  - `GET /v1/sessions` 返回会议列表
  - `GET /v1/sessions/:id` 返回会议详情
- [ ] 前端时间轴组件
  - 左侧按日期分组
  - 点击加载历史

**完成标准**: ✓ 会议保存正常 ✓ 历史加载正常

---

### Day 7: 最终抛光

- [ ] UI 优化
  - 参考 Offerin AI 的设备管理界面
  - 添加延迟显示
  - 添加统计面板
- [ ] 导出功能
  - Markdown 导出
  - 带时间轴的字幕导出
- [ ] 错误处理优化
  - 友好的错误提示
  - 断线重连提示

---

### ✅ Week 3 交付

- [ ] 录制完整 Demo 视频 (5分钟)
  - 场景1: 会议模式 (实时字幕 + 翻译)
  - 场景2: 面试模式 (截图 + AI答题)
  - 场景3: 手机连接 (扫码 + 伴侣屏)
- [ ] 保存为 `demos/mvp-complete-demo.mp4`
- [ ] 撰写 README 和使用文档

---

## 🎯 每日验证 Checklist

每完成一个任务后运行:

```bash
# 1. 编译检查
cargo build --workspace
cargo clippy --workspace

# 2. 测试
cargo test --workspace

# 3. 运行服务
cargo run -p pl-service

# 4. 功能验证
# (根据具体任务执行对应的 curl/websocat 命令)

# 5. 前端验证
cd apps/web-client
pnpm dev:desktop
```

---

## 📊 进度追踪

- Week 1: [ ] Day1 [ ] Day2 [ ] Day3 [ ] Day4 [ ] Day5 [ ] Day6 [ ] Day7
- Week 2: [ ] Day1 [ ] Day2 [ ] Day3 [ ] Day4 [ ] Day5 [ ] Day6 [ ] Day7
- Week 3: [ ] Day1 [ ] Day2 [ ] Day3 [ ] Day4 [ ] Day5 [ ] Day6 [ ] Day7

---

## 🚀 启动 MVP 开发

**从 Week 1 Day 1 开始**:
```bash
cd /home/wulin/PromptLens
mkdir -p core/audio/src core/audio/examples
touch core/audio/src/capture.rs
touch core/audio/examples/capture_demo.rs
```

**Good Luck! 💪**
