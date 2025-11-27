# PromptLens 重构 TODO

> 架构目标：客户端采集 + 服务，Web 端纯交互，职责完全分离

---

## Phase 1: 基础架构搭建

### 1.0 Desktop Client - 控制面板 UI
- [ ] 系统托盘图标 + 菜单
- [ ] 隐藏到后台运行
- [ ] 配对二维码显示窗口
- [ ] 已连接设备列表
- [ ] 采集状态开关（麦克风/截图/剪贴板）
- [ ] 权限状态显示（引导用户授权）
- [ ] 设置页（API Key、存储路径、端口）

### 1.1 Desktop Client - Server 层
- [ ] 搭建 axum HTTP/WebSocket 服务基础框架
- [ ] 实现 WebSocket 连接管理（多客户端支持）
- [ ] 实现 mDNS 服务发现（局域网自动发现）
- [ ] 实现二维码配对 + Token 认证
- [ ] 定义 API 协议（REST + WebSocket 事件）

### 1.2 Desktop Client - 采集层
- [ ] 系统音频采集（输入 + 输出）
  - [ ] Windows: WASAPI loopback
  - [ ] macOS: ScreenCaptureKit audio
  - [ ] Linux: PulseAudio/PipeWire
- [ ] 屏幕截图采集
  - [ ] Windows: Windows.Graphics.Capture
  - [ ] macOS: ScreenCaptureKit
  - [ ] Linux: X11/Wayland (best effort)
- [ ] 剪贴板监听
  - [ ] 文本内容监听
  - [ ] 图片内容监听

### 1.3 Desktop Client - ASR 转写
- [ ] 云端 ASR 接入（OpenAI Whisper API）
- [ ] 本地 ASR 可选（whisper.cpp，低优先）
- [ ] VAD 语音活动检测

---

## Phase 2: Web Client 开发

### 2.1 连接层
- [ ] WebSocket 客户端封装
- [ ] 自动重连机制
- [ ] 连接状态管理
- [ ] 配对流程 UI（二维码扫描/手动输入）

### 2.2 显示层
- [ ] 实时转写文字显示（流式更新）
- [ ] 截图预览显示
- [ ] 剪贴板内容显示
- [ ] 历史消息列表

### 2.3 交互层
- [ ] AI 请求触发（按钮 + 快捷键）
- [ ] 上下文选择（选择哪些内容发给 AI）
- [ ] AI 回答显示（Markdown 渲染）
- [ ] 快捷键绑定（全局或页面内）

---

## Phase 3: AI 集成

### 3.1 Desktop Server - AI 代理
- [ ] OpenAI API 集成
- [ ] Claude API 集成
- [ ] API Key 安全存储（OS Keychain）
- [ ] 请求限流与成本控制

### 3.2 Prompt 构建
- [ ] 上下文组装（转写 + 截图 OCR + 剪贴板）
- [ ] 可配置的 System Prompt
- [ ] 流式响应处理

---

## Phase 4: 完善与优化

### 4.1 权限与安全
- [ ] 系统权限引导（麦克风/屏幕录制）
- [ ] TLS 加密（自签证书）
- [ ] 会话管理与过期

### 4.2 用户体验
- [ ] 系统托盘图标与状态指示
- [ ] 采集状态可视化
- [ ] 错误处理与用户反馈

### 4.3 数据管理
- [ ] 本地存储（会话历史）
- [ ] 数据导出（Markdown）
- [ ] 隐私清理（一键删除）

---

## API 协议设计（草案）

### REST Endpoints

```
POST /v1/pair              # 配对认证
POST /v1/ai/request        # 发起 AI 请求
GET  /v1/history           # 获取历史
GET  /v1/status            # 服务状态
```

### WebSocket Events（Server → Client）

```json
{ "type": "transcript", "data": { "text": "...", "is_final": true } }
{ "type": "screenshot", "data": { "image_id": "...", "thumbnail": "base64..." } }
{ "type": "clipboard", "data": { "content_type": "text", "content": "..." } }
{ "type": "ai_response", "data": { "request_id": "...", "chunk": "...", "done": false } }
```

### WebSocket Events（Client → Server）

```json
{ "type": "ai_request", "data": { "context": [...], "prompt": "..." } }
{ "type": "capture_screenshot", "data": {} }
```

---

## 技术栈

### Desktop Client
- **框架**: Tauri (Rust + Web 前端)
- **服务**: axum + tokio
- **音频**: cpal + webrtc-vad
- **截图**: 平台原生 API
- **存储**: SQLite

### Web Client
- **框架**: React + TypeScript
- **样式**: TailwindCSS + shadcn/ui
- **状态**: Zustand
- **WebSocket**: 原生封装

---

## 里程碑

| 周次 | 目标 |
|------|------|
| W1 | Server 骨架 + WebSocket 通信 + Web 连接 |
| W2 | 音频采集 + ASR + 实时转写显示 |
| W3 | 截图 + 剪贴板 + 内容显示 |
| W4 | AI 代理 + 请求/响应流程 |
| W5 | 权限引导 + 安全 + 打包发布 |

---

## 职责边界

### Desktop Client UI（✅ 做 / ❌ 不做）
- ✅ 托盘图标 + 隐藏到后台
- ✅ 麦克风/截图监测状态开关
- ✅ Web 连接管理（配对二维码、已连接设备）
- ✅ 权限状态显示（麦克风/屏幕录制授权）
- ✅ 服务状态（端口、运行中/已停止）
- ✅ 设置（API Key 配置、存储路径等）
- ❌ 转写内容显示（Web 负责）
- ❌ AI 对话交互（Web 负责）
- ❌ 截图/剪贴板预览（Web 负责）

### 暂缓功能
- ❌ 移动端伴侣应用（Web 已覆盖场景）
