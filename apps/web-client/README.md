# PromptLens Web Client

多设备 Web 客户端，支持通过浏览器与桌面应用程序进行交互。

## 技术栈

- ⚡ **Vite** - 现代前端构建工具
- ⚛️ **React 18** - UI 框架
- 🎨 **Tailwind CSS** - 原子化 CSS 框架
- 🧩 **shadcn/ui** - 高质量组件库
- 📱 **TypeScript** - 类型安全
- 📦 **Lucide React** - 图标库

## 功能特性

### 🎤 音频录制
- 支持多种采样率 (16kHz, 22.05kHz, 44.1kHz, 48kHz)
- 实时录制状态显示
- 录制时间计时器

### 📸 截图捕获
- 全屏截图
- 活动窗口截图
- 选定区域截图

### 🔗 设备配对
- 与桌面应用配对连接
- 设备信息显示
- 连接状态监控

### 📋 活动日志
- 实时操作记录
- 日志导出功能
- 清除历史记录

## 开发说明

### 安装依赖

```bash
cd apps/web-client
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 多端适配

### 📱 移动端优化
- 响应式设计
- 触摸友好的交互
- PWA 支持
- 安全区域适配

### 💻 桌面端优化
- 大屏幕布局优化
- 键盘快捷键支持
- 鼠标悬停效果

### 📱 平板端优化
- 中等屏幕适配
- 横竖屏切换支持

## API 交互

Web 客户端通过 HTTP API 与桌面应用程序通信：

- `GET /health` - 健康检查
- `GET /metrics` - 获取指标
- `POST /v1/record/start` - 开始录制
- `POST /v1/record/stop` - 停止录制
- `POST /v1/capture/screenshot` - 截图
- `POST /v1/pair` - 设备配对

## 自动连接

应用会自动检测并连接到桌面应用服务器：
- 优先连接当前域名的 48080 端口
- 支持局域网内自动发现
- 连接状态实时显示

## 目录结构

```
src/
├── components/
│   └── ui/          # shadcn/ui 组件
├── lib/
│   ├── api.ts       # API 客户端
│   └── utils.ts     # 工具函数
├── App.tsx          # 主应用组件
├── main.tsx         # 入口文件
└── globals.css      # 全局样式
```

## 使用方式

1. 确保桌面应用程序正在运行并启动了 HTTP 服务
2. 在同一局域网内的设备上打开浏览器
3. 访问桌面应用显示的地址（如 `http://192.168.1.100:48080`）
4. 即可开始使用多设备功能