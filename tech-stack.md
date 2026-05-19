# zzDiary 专属技术栈规范

> 基于 `zzDiary-design-document.md` 业务场景分析，推荐最简最优技术组合。
> 选型原则：轻量易维护、生态成熟、部署便捷、严格分层。

---

## 1. 技术栈总览

| 分层 | 选型 | 版本 | 选型理由 |
|------|------|------|----------|
| 桌面壳 | Electron | 33.x | 生态最成熟，Node.js 与 Java 进程通信便捷 |
| 前端框架 | React + TypeScript | 19.x / 6.x | 生态最成熟，类型安全 |
| 构建工具 | Vite | 8.x | HMR < 100ms，Electron 热重载友好 |
| CSS 方案 | Tailwind CSS | 4.x | 原子化 CSS，零运行时开销 |
| 状态管理 | Zustand | 5.x | 1KB 体积，无 boilerplate，按需订阅 |
| 路由 | React Router | 7.x | 标准 SPA 路由，数据加载模式 |
| 图表 | Recharts | 3.x | React 原生组件，比 ECharts 轻 60% |
| 图标 | Lucide React | 最新 | 树摇友好，1500+ MIT 图标 |
| 后端语言 | Java | 25 LTS | 虚拟线程、记录类型、模式匹配 |
| 后端框架 | Spring Boot | 3.5.x | 生态最全，内嵌 Tomcat，自动配置 |
| 构建工具 | Gradle (Kotlin DSL) | 9.x | 现代化构建，比 Maven 简洁 |
| 数据库 | SQLite (JDBC) | 最新 | 嵌入式零配置，数据不外泄 |
| 数据库加密 | 应用层 AES-256-GCM | — | JCA 内建，无第三方依赖 |
| 向量检索 | JVector | 最新 | 纯 Java 嵌入式，无外部服务依赖 |
| HTTP 客户端 | RestClient (Spring 6) | 内建 | 同步/异步双模，替代 RestTemplate |
| AI 主模型 | DeepSeek Chat API | `deepseek-chat` | 中文 SOTA，成本极低，长上下文 |
| AI 备选 | Ollama (本地) | 最新 | 完全离线，`qwen2.5` 或 `deepseek-r1` |
| 序列化 | Jackson | 2.18.x | Spring Boot 默认，零配置 |
| 加密 / 密钥派生 | JCA + PBKDF2 | JDK 内建 | 标准 Java 加密体系，无第三方依赖 |
| 进程管理 | electron-builder + child_process | 最新 | 启动/守护 Spring Boot JAR |
| 打包 | electron-builder | 25.x | 生成 .exe / .dmg / .AppImage |
| 前端测试 | Vitest + Testing Library | 最新 | Vite 原生测试框架 |
| 后端测试 | JUnit 5 + Mockito | 最新 | 标准 Java 测试体系 |
| E2E 测试 | Playwright | 最新 | 跨平台桌面 UI 测试 |

---

## 2. 分层架构详解

### 2.1 桌面壳层 — Electron 33.x

```
┌─────────────────────────────────────────┐
│          Electron Main Process          │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ 窗口管理  │ │ 系统托盘  │ │ 自动更新 │ │
│  └──────────┘ └──────────┘ └─────────┘ │
│  ┌──────────────────────────────────┐   │
│  │     Spring Boot 进程守护         │   │
│  │   (child_process.spawn 启动 JAR)  │   │
│  │   - health check (GET /actuator)  │   │
│  │   - 崩溃自动重启                  │   │
│  │   - 优雅关闭 (SIGTERM)            │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │     IPC Bridge (ipcMain)          │   │
│  │     暴露安全 API 到渲染进程        │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
         │  HTTP (localhost:{port})
         ▼
┌─────────────────────────────────────────┐
│         Spring Boot 后端服务            │
│  ┌────────┐ ┌────────┐ ┌────────────┐ │
│  │ REST   │ │ AI     │ │ 加密       │ │
│  │ API    │ │ 代理    │ │ 服务       │ │
│  └────────┘ └────────┘ └────────────┘ │
│  ┌────────┐ ┌────────┐ ┌────────────┐ │
│  │ SQLite │ │ JVector│ │ 文件系统    │ │
│  │ 访问层  │ │ 检索   │ │ 管理       │ │
│  └────────┘ └────────┘ └────────────┘ │
└─────────────────────────────────────────┘
```

**适用场景：**
- 桌面应用需要完整的 OS 集成（托盘、通知、快捷键）
- 需要 Java 生态丰富的库和框架支持
- Spring Boot 提供生产级 REST API、安全、监控能力

**关键决策：**
- **Electron 而非 Tauri** — 切换到 Java 后端后，Tauri 的 Rust 内核失去优势；Electron 的 Node.js 生态与 Java 进程通信更自然
- **Spring Boot 作为独立进程** — Electron Main 进程通过 `child_process` 启动 Spring Boot fat JAR，通过 HTTP 通信
- **打包体积** — Electron(~180MB) + JRE(~50MB bundled via jlink) ≈ 230MB，适合桌面应用

### 2.2 前端层 — React 18 + TypeScript

**目录结构规范：**

```
src/
├── components/          # 通用 UI 组件
│   ├── ui/              # 原子组件 (Button, Input, Modal)
│   └── layout/          # 布局组件
├── features/            # 功能模块（按业务拆分）
│   ├── diary/           # 日记书写模块
│   │   ├── Editor.tsx
│   │   ├── GuidedChat.tsx
│   │   └── diary.store.ts
│   ├── emotion/         # 情绪分析模块
│   │   ├── Dashboard.tsx
│   │   ├── TrendChart.tsx
│   │   └── emotion.store.ts
│   ├── family/          # 原生家庭模块
│   │   ├── BackgroundForm.tsx
│   │   ├── InsightPanel.tsx
│   │   └── family.store.ts
│   └── mindfulness/     # 正念练习模块
│       ├── ExercisePlayer.tsx
│       ├── GratitudeTemplate.tsx
│       └── mindfulness.store.ts
├── hooks/               # 自定义 Hooks
│   ├── useApi.ts        # REST API 调用封装
│   └── useDebounce.ts
├── lib/                 # 工具函数 & API 抽象
│   ├── api.ts           # 后端 API 客户端
│   └── constants.ts
├── types/               # TypeScript 类型定义
│   ├── diary.ts
│   ├── emotion.ts
│   └── family.ts
├── App.tsx
└── main.tsx
```

**关键决策：**
- **特征目录（features/）** 而非 `components/` + `pages/` — 高内聚，每个业务模块自包含组件 + Store
- **Zustand 而非 Redux** — 日记应用状态结构简单，不需要 Redux 的中间件和 action/reducer 样板
- **Tailwind CSS 而非组件库** — 避免重 UI 库（MUI/Ant Design）带来的包体积增长

### 2.3 状态管理 — Zustand

**原则：** 每个业务模块一个独立 Store，不创建全局 Store 巨文件。

```typescript
// 示例：features/diary/diary.store.ts
// 仅管理日记书写流程状态，不混入情绪/家庭状态
interface DiaryStore {
  entries: DiaryEntry[];
  currentMode: 'guided' | 'free';
  addEntry: (entry: DiaryEntry) => void;
}
```

**为什么不用 Redux / MobX / Jotai：**
- Redux：boilerplate 过多，学习曲线陡，不适合小型桌面应用
- MobX：装饰器依赖，与 Electron 生态兼容性差
- Jotai：原子化对日记场景过度拆分
- Zustand：最轻量，API 简单，支持 TypeScript 推导

### 2.4 图表方案 — Recharts

**为什么不用 ECharts：**
- ECharts 基于 Canvas，React 集成需要额外 wrapper，包体 1MB+
- Recharts 基于 SVG，原生 React 组件树，包体 ~300KB
- 日记应用图表需求简单（折线图、雷达图、热力图），Recharts 完全覆盖

**使用清单：**
- `<LineChart>` — 情绪趋势（周/月/年）
- `<RadarChart>` — 情绪分布雷达图
- `<PieChart>` — 情绪标签占比
- `<AreaChart>` — 情绪强度变化

### 2.5 后端服务 — Spring Boot 3.5

```
┌──────────────────────────────────────────┐
│           Spring Boot Application        │
│  ┌────────────────────────────────────┐  │
│  │         Controller 层              │  │
│  │  DiaryController                   │  │
│  │  EmotionController                 │  │
│  │  FamilyController                  │  │
│  │  MindfulnessController             │  │
│  │  SearchController                  │  │
│  ├────────────────────────────────────┤  │
│  │          Service 层                │  │
│  │  DiaryService                      │  │
│  │  EmotionAnalysisService            │  │
│  │  FamilyInsightService              │  │
│  │  MindfulnessService                │  │
│  ├────────────────────────────────────┤  │
│  │        Repository 层               │  │
│  │  DiaryRepository (SQLite JDBC)     │  │
│  │  EmotionRepository                 │  │
│  │  FamilyRepository                  │  │
│  │  VectorRepository (JVector)        │  │
│  ├────────────────────────────────────┤  │
│  │       Infrastructure 层            │  │
│  │  AiClient (DeepSeek / Ollama)      │  │
│  │  EncryptionService (AES-256-GCM)   │  │
│  │  SanitizationService (PII 脱敏)    │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**Spring Boot 关键配置：**

```yaml
# application.yml
server:
  port: 0                     # 随机端口，避免冲突
spring:
  datasource:
    url: jdbc:sqlite:${user.home}/.zzdiary/data.db
    driver-class-name: org.sqlite.JDBC
  threads:
    virtual:
      enabled: true           # 启用虚拟线程 (Java 21+)
```

**为什么用 Spring Boot 而非 Quarkus / Micronaut：**
- Spring Boot 生态最成熟，开发者基数最大
- SQLite JDBC 支持最好，第三方库兼容性最广
- Java 25 虚拟线程弥补了传统 Servlet 的并发短板

### 2.6 数据库 — SQLite (JDBC) + 应用层加密

```
┌──────────────────────────────┐
│   应用层 AES-256-GCM 加密     │
│   (EncryptionService)        │
│  ┌──────────────────────────┐│
│  │   SQLite (JDBC)          ││
│  │  ┌────────┬────────────┐ ││
│  │  │ diary   │ emotion_   │ ││
│  │  │ _entries│ insights   │ ││
│  │  ├────────┼────────────┤ ││
│  │  │ family_ │ mindfulness│ ││
│  │  │ bg      │ _exercises │ ││
│  │  └────────┴────────────┘ ││
│  └──────────────────────────┘│
└──────────────────────────────┘
```

**加密策略：**
- 敏感字段（日记正文、家庭背景）在写入前通过 `EncryptionService.encrypt()` 加密，读取时解密
- 加密密钥由用户应用启动密码通过 PBKDF2 派生
- 非敏感字段（时间戳、情绪标签）明文存储以支持 SQL 查询

**为什么用应用层加密而非 SQLCipher：**
- Java 版 SQLCipher 维护不活跃，依赖原生库复杂
- JCA 内建 AES-256-GCM，零额外依赖
- 字段级加密粒度更细（情绪标签可明文以支持查询），更灵活

**表设计原则：**
- 每表不超过 12 字段
- TEXT / BLOB 存密文，VARCHAR 存明文标签
- `created_at` / `updated_at` 时间戳必带
- 敏感字段（日记正文、家庭背景）列为 BLOB 加密存储

### 2.7 向量检索 — JVector

```
┌─────────────────────────────────┐
│      JVector (嵌入式, 纯 Java)   │
│  ┌──────────────────────────┐   │
│  │  历史日记语义索引          │   │
│  │  - 情绪相似日记检索        │   │
│  │  - 原生家庭关联回忆        │   │
│  │  - 正念练习推荐匹配        │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

**为什么不用 LanceDB / Chroma / Pinecone：**
- LanceDB：Rust 原生，Java 绑定不成熟
- Chroma：Python 原生，Java 需 HTTP 桥接
- Pinecone：云端服务，违反本地优先原则
- JVector：纯 Java 嵌入式，基于 DiskANN 算法，零配置，与 Spring Boot 完美集成

### 2.8 AI 模型方案

```
┌─────────────────────────────────┐
│          AI 分析引擎             │
│  ┌──────────────────────────┐   │
│  │  默认：DeepSeek Chat API  │   │
│  │  - deepseek-chat 模型     │   │
│  │  - 中文情绪分析 SOTA      │   │
│  │  - 成本 ~¥0.001/千 token  │   │
│  ├──────────────────────────┤   │
│  │  备选：Ollama 本地        │   │
│  │  - qwen2.5:7b             │   │
│  │  - 完全离线，零延迟       │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

**调用架构：**

```
React 前端
  │  POST /api/analyze { content }
  ▼
Spring Boot (AiService)
  │  ├─ 检测网络 → 使用 DeepSeek API (RestClient)
  │  └─ 无网络 → 使用 Ollama 本地 (RestClient → localhost:11434)
  │  ├─ 脱敏处理（移除人名/地名）
  │  └─ 返回结构化 JSON
  ▼
React 前端
  │  渲染分析结果
```

**关键决策：**
- 所有 AI 调用走 Spring Boot 后端（API Key 存储在服务端配置，不暴露到前端）
- 离线优先：优先检测 Ollama 本地可用性，再回退到云端 API
- 发送前脱敏：正则替换人名、地名、数字串
- RestClient 超时 30s，支持虚拟线程异步调用

### 2.9 构建 & 打包

| 工具 | 用途 |
|------|------|
| Vite | 前端热构建 / HMR |
| Gradle | Spring Boot fat JAR 构建 |
| jlink + jpackage | 裁剪 JRE，嵌入应用 |
| electron-builder | 打包桌面安装包 |
| GitHub Actions | CI/CD 自动发布 |

**构建流程：**
```
1. Vite build → React 静态资源
2. Gradle bootJar → Spring Boot fat JAR
3. jlink → 裁剪 JRE (~40MB，仅含 java.base / java.sql / java.naming)
4. electron-builder → 将 JAR + JRE + Electron 打包为安装包
```

**构建目标：**
- Windows: `.exe` 安装包（~250MB，含裁剪 JRE）
- macOS: `.dmg` 镜像（~260MB，含裁剪 JRE）
- Linux: `.AppImage` 单文件（~255MB，含裁剪 JRE）

---

## 3. 通信方案

### 3.1 前端 ↔ Spring Boot 后端

```
React ── HTTP REST ──▶ Spring Boot (localhost:{random_port})
React ◄──── JSON ──── Spring Boot (localhost:{random_port})
```

- 使用 `fetch` API 或 `axios`（轻量封装）
- 所有数据交换为 JSON 格式
- Electron Main Process 通过 IPC 将动态端口传递给渲染进程
- 禁止前端直接调用外部 API（DeepSeek 等）

### 3.2 Electron Main ↔ Spring Boot 进程

```
Electron Main
  │  child_process.spawn('java', ['-jar', 'zzdiary-backend.jar', '--server.port=0'])
  │  监听 stdout → 解析实际端口
  │  健康检查 GET /actuator/health
  │  关闭时 SIGTERM → 优雅关闭
  ▼
Spring Boot JAR
```

### 3.3 Spring Boot ↔ AI 服务

```
Spring Boot ──HTTPS──▶ DeepSeek API (api.deepseek.com)
Spring Boot ──HTTP───▶ Ollama (localhost:11434)
```

- 使用 Spring `RestClient`（基于 Java 25 虚拟线程）
- API Key 通过 `application.yml` 或环境变量注入
- 请求超时 30s，失败自动降级

---

## 4. 安全架构

| 层级 | 方案 | 说明 |
|------|------|------|
| 传输 | 无外部网络传输 | 默认数据不出本机 |
| 存储 | AES-256-GCM 字段加密 | JCA 内建，零依赖 |
| 密钥 | 用户密码 PBKDF2 | 应用启动密码派生加密密钥 |
| 脱敏 | 正则过滤 | AI 发送前移除 PII |
| API 隔离 | Electron IPC + CSP | 渲染进程禁止外部网络请求 |
| 端口安全 | localhost-only | Spring Boot 仅监听 127.0.0.1 |
| Actuator | 关闭敏感端点 | 仅暴露 `/actuator/health` |

---

## 5. 环境要求

| 项目 | 最低版本 |
|------|----------|
| Node.js | 20 LTS |
| Java JDK | 25 LTS (含 jlink) |
| pnpm | 9.x（前端包管理） |
| Gradle | 9.x（或使用 Gradle Wrapper） |
| Electron | 33.x |
| Ollama | 最新（可选，离线模式需要） |

---

## 6. 不选择的技术清单（明确排除）

| 排除技术 | 原因 |
|----------|------|
| Tauri | Rust 内核，与 Java 后端有语言壁垒 |
| JavaFX / Swing | UI 开发效率低，无法复用 Web 生态 |
| Maven | XML 配置冗长，Gradle Kotlin DSL 更简洁 |
| Quarkus | 生态不如 Spring Boot 成熟，SQLite 支持弱 |
| Redux | 状态简单，Zustand 足够 |
| ECharts | 过重，Recharts 覆盖全部需求 |
| MUI / Ant Design | 包体积大，定制成本高 |
| SQLCipher for Java | 维护不活跃，JCA 内建方案更可靠 |
| LanceDB / Chroma | Rust/Python 原生，Java 集成差 |
| Pinecone | 云端服务，违反本地优先 |
| GraphQL | 无多客户端场景，REST 更简洁 |
| Docker | 桌面应用不需要容器化 |
