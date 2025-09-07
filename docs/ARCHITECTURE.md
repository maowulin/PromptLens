[README](/README.md) · [English](/docs/ARCHITECTURE.en.md) · [LICENSE](/LICENSE)

# 架构

本项目采用“桌面应用 + Rust 核心 + 本地 Web 服务 + 移动伴侣”的分层架构，突出本地优先与局域网安全控制。

## 总览
- Desktop（Tauri）：UI 壳，调用本地服务；显示字幕/翻译、截屏结果与建议卡片。
- Rust Core：
  - 音频采集 + VAD
  - ASR 适配（本地/云，可切换）
  - 屏幕截取 + 编码（按需）
  - OCR 流水线
  - NLU（翻译/摘要/关键词/建议）
  - 本地 Web 服务（REST/WS/TLS，自签证书 + 指纹固定）
  - 配对与鉴权（mDNS/二维码 + 短期 Token）
  - 存储（SQLite/SQLCipher）
- Mobile（Flutter）：伴侣屏与远程控制面板，触发截屏/查看结果。
- Shared：OpenAPI/Proto、UI tokens 等共享规范与资源。

```mermaid
flowchart LR
  subgraph Desktop[Tauri 桌面端]
    DUI[UI]
  end

  subgraph Core[Rust Core]
    AC[Audio+VAD] --> ASR[ASR Adapter]
    ASR --> NLU[Translate/Summarize]
    CAP[Screen Capture] --> OCR[OCR]
    SVC[Local Service (REST/WS/TLS)]
    AUTH[Pairing/Auth]
    DB[(SQLite/SQLCipher)]
    AC --> SVC
    NLU --> SVC
    CAP --> OCR --> SVC
    SVC <---> AUTH
    SVC <---> DB
  end

  subgraph Mobile[Flutter 伴侣]
    MUI[Companion UI]
  end

  DUI <-- IPC/HTTP/WS --> SVC
  MUI <-- WS/TLS --> SVC
```

## 数据与安全要点
- 默认本地处理；云模型为可选增强。
- 权限与指示：麦克风/屏幕权限显著可见，操作需用户主动触发。
- 连接安全：TLS（自签+指纹）、短期 Token、会话续期与限速。

## 待办清单（Todo）

- P0（MVP）
  - [ ] Rust Core：音频采集 + VAD 骨架；云 ASR 适配；字幕增量 WS 流
  - [ ] 本地服务：axum REST/WS；自签 TLS + 指纹固定；mDNS/二维码配对 + 短期 Token；限速与会话续期
  - [ ] 桌面端：Tauri 壳；字幕视图；权限引导（麦克风/屏幕）
  - [ ] 截屏 + OCR：`POST /v1/capture/screenshot[+ocr]` 最小闭环；建议卡片占位
  - [ ] 存储与导出：SQLite/SQLCipher；导出 Markdown
  - 工具链
    - [x] Just 任务：fmt / lint / test
    - [x] CI 缓存（Rust cargo 缓存）
    - [ ] CI 路径过滤（仅变更相关模块时触发）
- P1（增强）
  - [ ] 本地 Whisper（GPU 优先）模式切换；OCR 布局与代码题优化
  - [ ] 移动端伴侣屏：事件流显示 + 远程触发截屏 UI
  - [ ] 设置中心与日志/诊断；错误上报（可选、需用户同意）
  - [ ] 打包与分发：Win（MSIX）、macOS（Notarization）、Linux（AppImage/Snap）
