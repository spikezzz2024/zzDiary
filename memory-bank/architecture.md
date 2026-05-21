# zzDiary 系统架构

> 模块依赖图、数据流、分层架构。随项目演进持续更新。

---

## 整体架构

```
┌─────────────────────────────────────────┐
│          Electron Main Process          │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ 窗口管理  │ │ 系统托盘  │ │ 自动更新 │ │
│  └──────────┘ └──────────┘ └─────────┘ │
│  ┌──────────────────────────────────┐   │
│  │  Spring Boot 进程守护 (child_process) │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  IPC Bridge (ipcMain → preload)   │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
         │  HTTP REST (127.0.0.1:{port})
         ▼
┌─────────────────────────────────────────┐
│         Spring Boot 后端服务            │
│  Controller → Service → Repository      │
│  Infrastructure: encryption/vector/ai   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   SQLite (JDBC) + JVector (向量检索)     │
└─────────────────────────────────────────┘
```

## 前端分层

```
src/
├── features/          # 业务模块（按业务拆分）
│   ├── auth/          # ✅ 账户管理（SetupScreen, UnlockScreen, auth.store）
│   ├── diary/         # ✅ 日记书写（DiaryPage, Editor, GuidedChat, store, types）
│   ├── emotion/       # ✅ 情绪分析结果展示（EmotionResult, store, types）
│   ├── family/        # ⬜ 原生家庭（BackgroundForm, InsightPanel, store, types）
│   ├── mindfulness/   # ⬜ 正念练习（ExercisePlayer, GratitudeTemplate, store, types）
│   └── settings/      # ✅ 应用设置（AiSettingsPage, settings.store）
├── components/ui/     # 纯 UI 原子组件（Button, Input, Card, Badge）
├── hooks/             # 通用 Hooks（useApi）
├── lib/               # API 客户端 + 常量
│   ├── api.ts         # REST API 封装
│   └── constants/     # 常量（emotions.ts, ui.ts）
└── types/             # 跨模块共享类型（shared.ts）
```

### 模块依赖规则

- 单向依赖：表现层 → 状态层 → 通信层 → (HTTP) → Spring Boot
- 跨模块通信只能通过：lib/api.ts / types/shared.ts / 回调 props
- 严禁：跨 features 直接 import 组件、跨 features 直接读写 Store

## 后端分层

```
zzdiary-server/src/main/java/com/zzdiary/
├── controller/        # REST 接口层（参数校验 + 路由）
├── service/           # 业务逻辑层（编排 + 事务）
├── repository/        # 数据访问层（JDBC / JVector）
├── model/entity/      # 数据库实体
├── model/dto/         # 传输对象（Java record）
└── infrastructure/    # 横切关注点
    ├── encryption/    # AES-256-GCM + PBKDF2 密钥派生
    ├── vector/        # JVector 语义检索
    └── ai/            # AI 客户端（DeepSeek / Ollama）
```

### 后端依赖规则

- Controller → Service → Repository（单向，不可跨层）
- Controller 禁止直接调用 Repository
- Service 禁止导入 Web 层类型（HttpServletRequest 等）
- 构造器注入，禁用 @Autowired 字段注入
- 使用 Java record 定义 DTO，禁用 Lombok

## 数据流

```
用户输入日记
  → React Editor 组件
  → lib/api.ts (POST /api/diary/analyze)
  → DiaryController (参数校验)
  → DiaryService (编排)
    → SanitizationService (PII 脱敏)
    → AiService (DeepSeek/Ollama 情绪分析)
    → EncryptionService (AES-256-GCM 加密)
    → DiaryRepository (SQLite 存储)
  ← EmotionInsight (JSON)
  ← React 渲染分析结果
```

## 外部通信

- 前端 ↔ Spring Boot：HTTP REST over localhost（随机端口，Electron IPC 传递）
- Spring Boot ↔ DeepSeek API：HTTPS (api.deepseek.com)
- Spring Boot ↔ Ollama：HTTP (localhost:11434)
- 前端禁止直接发起外部 HTTP 请求（安全红线）
