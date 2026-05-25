# zzDiary 开发日志

## 2026-05-25 — Electron 桌面壳集成

### 变更内容

- **Electron 桌面壳（新）**：集成 electron-vite，实现开发模式一键启动 + 生产打包流水线
  - 主进程 `src/main/index.ts`：BrowserWindow 管理、Spring Boot 进程守护、单实例锁、IPC
  - 进程管理 `src/main/backend.ts`：spawn JAR、健康检查轮询（500ms/30s）、优雅关闭、端口解析
  - 预加载脚本 `src/preload/index.ts`：contextBridge 暴露 `electronAPI`（端口、平台、环境检测）
  - 类型声明 `src/types/electron.d.ts`：`window.__ZZDIARY_PORT__` 和 `electronAPI` 全局类型
- **API 层适配**：`src/lib/api.ts` — 动态检测 Electron 环境，有 `__ZZDIARY_PORT__` 时构造绝对 URL，否则回退相对路径
- **Spring Boot SPA 路由**：新增 `WebMvcConfig.java`，非 `/api/*` 路径回退到 `index.html`，支持 React Router
- **Gradle 打包任务**：`build.gradle.kts` 新增 `copyFrontend` task，将前端构建输出嵌入 JAR
- **构建配置**：`electron.vite.config.ts` 三目标构建（main/preload/renderer），保留 Web 开发模式
- **标题修正**：`index.html` 标题 `zzdiary-frontend-tmp` → `zzDiary`

### 技术栈

- electron 33.4.11 + electron-vite 6.0.0-beta.1 + electron-builder 25.1.8
- 架构：生产模式 Spring Boot 同源托管前端 + API（单端口，零 CORS）；开发模式 Vite proxy + HMR

### 命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | Electron 开发模式（HMR + 自动启动后端） |
| `npm run dev:web` | 纯 Web 开发模式（浏览器） |
| `npm run build` | Electron 构建 |
| `npm run package` | 生产打包（electron-builder） |

### 文件清单

**新建（7）**：`src/main/index.ts`, `src/main/backend.ts`, `src/preload/index.ts`, `src/types/electron.d.ts`, `electron.vite.config.ts`, `zzdiary-server/.../config/WebMvcConfig.java`, `CHANGELOG.md`

**修改（6）**：`package.json`, `src/lib/api.ts`, `index.html`, `.gitignore`, `zzdiary-server/build.gradle.kts`, `pnpm-lock.yaml`
