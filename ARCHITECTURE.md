# PromptLens 架构 V2（简化版）

> 核心原则：**职责分离、单向数据流、消除特殊情况**

---

## 1. 设计理念

### 为什么重构？

V1 的问题：客户端与 Web 端功能耦合
- 客户端既要采集，又要 UI 交互，又要请求 AI
- Web 端职责模糊，与客户端功能重叠
- 复杂度过高，边界情况过多

V2 的解决：职责完全分离
- **Desktop Client**：只做采集 + 提供服务（不做 UI 交互）
- **Web Client**：只做用户交互 + 显示（不做采集）
- 数据单向流动，职责边界清晰

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Desktop Client (Tauri)                          │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      采集层 (Capture Layer)                  │   │
│   │                                                             │   │
│   │   ┌───────────┐   ┌───────────┐   ┌───────────┐             │   │
│   │   │  Audio    │   │  Screen   │   │ Clipboard │             │   │
│   │   │  Capture  │   │  Capture  │   │  Monitor  │             │   │
│   │   │           │   │           │   │           │             │   │
│   │   │ • 系统输入 │   │ • 按需截图 │   │ • 文本    │             │   │
│   │   │ • 系统输出 │   │ • 区域选择 │   │ • 图片    │             │   │
│   │   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘             │   │
│   │         │               │               │                   │   │
│   └─────────┼───────────────┼───────────────┼───────────────────┘   │
│             │               │               │                       │
│             └───────────────┼───────────────┘                       │
│                             ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      处理层 (Processing Layer)               │   │
│   │                                                             │   │
│   │   ┌───────────┐   ┌───────────┐                             │   │
│   │   │    ASR    │   │    OCR    │                             │   │
│   │   │  (语音转写) │   │ (图像识别) │                             │   │
│   │   └─────┬─────┘   └─────┬─────┘                             │   │
│   │         │               │                                   │   │
│   └─────────┼───────────────┼───────────────────────────────────┘   │
│             │               │                                       │
│             └───────────────┼───────────────                        │
│                             ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      服务层 (Service Layer)                  │   │
│   │                                                             │   │
│   │   ┌───────────────────────────────────────────────────────┐ │   │
│   │   │                   Local HTTP Server                   │ │   │
│   │   │                                                       │ │   │
│   │   │  • REST API     - 配对认证、状态查询、历史记录          │ │   │
│   │   │  • WebSocket    - 实时推送采集数据、AI 响应             │ │   │
│   │   │  • AI Proxy     - 代理 AI 请求，隐藏 API Key           │ │   │
│   │   │                                                       │ │   │
│   │   └───────────────────────────────────────────────────────┘ │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     │                     ▼
┌───────────────────┐           │          ┌───────────────────┐
│                   │           │          │                   │
│    Web Client     │◄──────────┘          │    AI Services    │
│    (Browser)      │                      │    (Cloud)        │
│                   │                      │                   │
│  ┌─────────────┐  │                      │  • OpenAI         │
│  │  显示层     │  │                      │  • Claude         │
│  │             │  │                      │  • Whisper API    │
│  │  • 转写文字  │  │                      │                   │
│  │  • 截图预览  │  │                      └───────────────────┘
│  │  • 剪贴板   │  │
│  │  • AI 回答  │  │
│  └─────────────┘  │
│                   │
│  ┌─────────────┐  │
│  │  交互层     │  │
│  │             │  │
│  │  • AI 请求  │  │
│  │  • 快捷键   │  │
│  │  • 上下文   │  │
│  └─────────────┘  │
│                   │
└───────────────────┘
```

---

## 3. 数据流

### 3.1 采集数据流（Desktop → Web）

```
Audio Capture → VAD 分段 → ASR 转写 → WebSocket Push → Web 显示
Screen Capture → 压缩编码 → WebSocket Push → Web 显示
Clipboard Monitor → 变更检测 → WebSocket Push → Web 显示
```

### 3.2 AI 请求流（Web → Desktop → AI → Web）

```
Web 用户点击/快捷键
       ↓
WebSocket 发送请求 { context, prompt }
       ↓
Desktop Server 接收
       ↓
组装 Prompt（转写 + 截图 OCR + 剪贴板）
       ↓
请求 AI 服务（OpenAI/Claude）
       ↓
流式返回
       ↓
WebSocket Push 到 Web
       ↓
Web 显示 AI 回答
```

---

## 4. 模块设计

### 4.1 Desktop Client

```
apps/desktop/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs              # 入口
│   │   ├── capture/             # 采集模块
│   │   ├── process/             # 处理模块
│   │   ├── server/              # 服务模块
│   │   └── storage/             # 存储模块
│   └── Cargo.toml
└── web/                         # 控制面板前端 (Standalone Vite + React)
    ├── src/
    │   ├── App.tsx              # 仪表盘 UI (Light Mode)
    │   ├── components/
    │   │   └── Visualizers.tsx  # 音频跳动、雷达扫描
    │   └── lib/
    ├── index.html
    └── package.json             # 独立依赖 (tailwindcss, lucide-react)
```

### 4.2 Web Client

```
apps/web-client/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── lib/
│   │   ├── websocket.ts         # WebSocket 客户端
│   │   └── api.ts               # REST API 客户端
│   ├── stores/
│   │   ├── connection.ts        # 连接状态
│   │   ├── transcript.ts        # 转写内容
│   │   ├── captures.ts          # 截图/剪贴板
│   │   └── ai.ts                # AI 对话
│   ├── components/
│   │   ├── ConnectionPanel/     # 配对连接
│   │   ├── TranscriptView/      # 转写显示
│   │   ├── CaptureView/         # 截图/剪贴板显示
│   │   ├── AIPanel/             # AI 交互
│   │   └── StatusBar/           # 状态栏
│   └── hooks/
│       ├── useWebSocket.ts
│       └── useHotkeys.ts
└── package.json
```

---

## 5. API 协议

### 5.1 REST API

| Method | Endpoint | 描述 |
|--------|----------|------|
| POST | `/v1/pair` | 配对认证 |
| POST | `/v1/pair/verify` | 验证 Token |
| GET | `/v1/status` | 服务状态 |
| GET | `/v1/history` | 历史记录 |
| POST | `/v1/capture/screenshot` | 手动触发截图 |

### 5.2 WebSocket Protocol

**连接**：`ws://<host>:8765/v1/ws?token=<session_token>`

**Server → Client Events**

```typescript
// 转写增量
{
  type: "transcript",
  data: {
    id: string,
    text: string,
    language: string,
    is_final: boolean,
    timestamp: number
  }
}

// 截图
{
  type: "screenshot",
  data: {
    id: string,
    thumbnail: string,    // base64 JPEG
    ocr_text?: string,    // OCR 结果
    timestamp: number
  }
}

// 剪贴板
{
  type: "clipboard",
  data: {
    content_type: "text" | "image",
    content: string,      // 文本或 base64
    timestamp: number
  }
}

// AI 响应
{
  type: "ai_response",
  data: {
    request_id: string,
    chunk: string,        // 增量文本
    done: boolean
  }
}
```

**Client → Server Events**

```typescript
// 请求 AI
{
  type: "ai_request",
  data: {
    request_id: string,
    context: string[],    // 选中的上下文 ID
    prompt: string
  }
}

// 触发截图
{
  type: "capture_screenshot"
}
```

---

## 6. 安全设计

### 6.1 配对流程

```
1. Desktop 启动时生成一次性配对码（6位数字或二维码）
2. Web 输入配对码
3. Desktop 验证后返回 Session Token
4. 后续请求携带 Token
5. Token 有效期 24h，可续期
```

### 6.2 通信安全

- **局域网**: HTTP/WebSocket（简化开发）
- **生产环境**: 可选 TLS（自签证书 + 指纹固定）
- **API Key**: 存储在 Desktop 端 OS Keychain，不暴露给 Web

---

## 7. 技术选型

| 组件 | 技术 | 理由 |
|------|------|------|
| Desktop 框架 | Tauri 2.0 | Rust 核心，跨平台，体积小 |
| Desktop UI | React + Vite | 独立 Web 视图，Light Mode 风格 |
| HTTP Server | axum | Rust 生态，async，性能好 |
| WebSocket | tokio-tungstenite | 与 axum 配合 |
| 音频采集 | cpal | Rust 跨平台音频 |
| 截图 | 平台原生 API | 最佳兼容性 |
| ASR | OpenAI Whisper API | 快速启动，质量好 |
| Web 框架 | React + TypeScript | 生态成熟 |
| 样式 | TailwindCSS + shadcn/ui | 快速开发，美观 |
| 状态管理 | Zustand | 轻量，简单 |

---

## 8. 与 V1 的对比

| 层级 | 职责 | 不做 |
|------|------|------|
| **Desktop Client** | 采集、ASR、Server、AI 代理、**自身功能控制 UI** | 不做业务内容交互 |
| **Web Client** | 显示采集数据、用户交互、发起 AI 请求 | 不做采集、不直接请求 AI |

### Desktop Client UI 范围（仅限自身功能管理）

- ✅ 托盘图标 + 隐藏到后台
- ✅ 麦克风/截图监测状态开关
- ✅ Web 连接管理（配对二维码、已连接设备）
- ✅ 权限状态显示（麦克风/屏幕录制授权）
- ✅ 服务状态（端口、运行中/已停止）
- ✅ 设置（API Key 配置、存储路径等）
- ❌ 转写内容显示（Web 负责）
- ❌ AI 对话交互（Web 负责）
- ❌ 截图/剪贴板预览（Web 负责）

---

## 9. 里程碑

| 阶段 | 时间 | 交付物 |
|------|------|--------|
| **M1** | 1 周 | Server 骨架 + WebSocket 通信 + Web 连接 |
| **M2** | 1 周 | 音频采集 + ASR + 实时转写显示 |
| **M3** | 1 周 | 截图 + 剪贴板 + 内容显示 |
| **M4** | 1 周 | AI 代理 + 请求/响应流程 |
| **M5** | 1 周 | 权限引导 + 安全 + 打包发布 |

---

## 10. 文件变更计划

### 保留
- `core/` - Rust 核心模块（需重构整合）
- `apps/web-client/` - Web 客户端（需重构）

### 重构
- `apps/desktop/tauri-app/` - 简化为采集 + 服务
- `apps/web-client/src/` - 重构为纯交互层

### 删除
- 移动端相关代码（暂缓）
- 客户端 UI 交互逻辑（移至 Web）
