[English](/README.md) · [中文](/README.zh-CN.md) · [架构](/docs/ARCHITECTURE.md)· [LICENSE](/LICENSE)

# PromptLens

一个专注“本地优先 + 局域网伴侣屏”的开放项目：
- 桌面端（Tauri）提供实时字幕、翻译、按需截屏 + OCR + 建议卡片
- Rust Core 负责音频采集/VAD、ASR 适配、本地 Web 服务（REST/WS/TLS）
- 移动端（Flutter）作为伴侣屏与远程控制面板

> 目标：隐私与合规优先，默认本地运行，可选连接云端模型。

## 功能
- 实时字幕与翻译（本地/云 ASR 可切换）
- 按需截屏 → OCR → 建议卡片（从第二设备远程触发）
- 局域网配对（mDNS/二维码 + 短期 Token，TLS 指纹固定）
- 本地数据存储（SQLite/SQLCipher，可导出 Markdown/PDF）

## 快速开始
要求：Rust、Node.js + pnpm、（可选）Flutter

常用命令（根目录运行）：
- 构建：`just build` 或 `just build-core`/`just build-desktop`
- 开发（本地服务 + Web 客户端）：`just dev`
- 测试：`just test`
- 格式化：`just fmt`
- 静态检查：`just lint`

如无法使用 just，可运行 scripts/ 目录中的等价脚本。

## 本地 HTTP API（预览）
- POST /v1/record/start | /v1/record/stop
- WS  /v1/stream/events（字幕/事件）
- POST /v1/capture/screenshot[+ocr]
- GET  /v1/image/{image_id}

## 贡献
请先阅读 CONTRIBUTING.md 与 CODEOWNERS；提交前运行 `just fmt && just lint && just test`。

## 许可
MIT License，详见 LICENSE。