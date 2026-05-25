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
│   SQLite (JDBC) + 内存向量索引          │
└─────────────────────────────────────────┘
```

## 前端分层

```
src/
├── features/          # 业务模块（按业务拆分）
│   ├── diary/         # ✅ 日记书写 + 语义搜索（DiaryPage, PaperEditor, Calendar, SearchBar, store, types）
│   ├── emotion/       # ✅ 情绪仪表盘（Dashboard 趋势图/分布饼图, store, types, 后端 API）
│   ├── family/        # ✅ 原生家庭（FamilyPage 背景表单/AI提炼/技能卡片, store, types, 后端 API）
│   ├── mindfulness/   # ✅ 正念练习（BreathingExercise, GratitudeJournal, EmotionAwareness, store, types, 后端 API）
│   ├── stats/         # ✅ 书写统计（StatsPage 热力图/时段分布/概览卡片, store, types, 后端 API）
│   └── settings/      # ✅ 应用设置（AiSettingsPage, ExportSection, settings.store）
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
├── controller/           # REST 接口层（参数校验 + 路由）
├── service/              # 业务逻辑层（编排 + 事务）
├── repository/           # 数据访问层（JDBC）
├── model/entity/         # 数据库实体
├── model/dto/            # 传输对象（Java record）
└── infrastructure/       # 横切关注点
    ├── encryption/       # AES-256-GCM 加密服务
    ├── vector/           # 语义搜索：EmbeddingService + VectorIndexManager（余弦相似度，可升级 JVector）
    └── ai/               # AI 客户端（DeepSeek / Ollama）
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
    → SanitizationService (PII 脱敏) → AiService (情绪分析，必须 AI 可用)
    → EncryptionService (加密日记原文) → DiaryRepository (SQLite 存储)
    → 分析结果持久化到 emotion_insights 表（每情绪标签一行）
    → EmbeddingService.embedAndPersist() → Ollama /api/embeddings → 写入 diary_embeddings
    → VectorIndexManager.add() → 内存索引追加
  ← AnalyzeResponse (JSON)
  ← React 渲染分析结果（侧边栏，会话内有效）

情绪趋势/分布查询
  → GET /api/emotion/trend?from=&to=
  → EmotionAnalysisService
    → 读取 emotion_insights（仅 AI 分析过的条目有数据）
  ← TrendPoint[] / EmotionDistribution[]
  ← EmotionDashboard 页面展示 Recharts 图表

语义搜索
  → POST /api/search/semantic { query }
  → SearchService
    → EmbeddingService.generateEmbedding(query) → OllamaClient.embed() → Ollama /api/embeddings
    → VectorIndexManager.search(queryEmbedding, topK) → 内存余弦相似度 Top-K
    → 查 diary_entries 解密摘要 → 返回 SearchResult[]
  ← SearchResult[] (id, snippet, score, emotionTags, createdAt)
  ← SearchBar 组件展示结果（日期/相似度/摘要），点击跳转日记详情

正念练习推荐/记录
  → POST /api/mindfulness/recommend { "exerciseType": "breathing" }
  → MindfulnessService
    → 读取 emotion_insights 汇总近期情绪
    → AiService.generateMindfulnessRecommendation() 生成个性化练习
    → 持久化到 mindfulness_exercises 表
  ← MindfulnessRecommendResponse
  ← MindfulnessPage 渲染 BreathingExercise / GratitudeJournal / EmotionAwareness

  → POST /api/mindfulness/log (用户完成练习后)
  → MindfulnessService
    → 更新 mindfulness_exercises.completed = 1
  ← ProgressStats 更新
```

书写统计
	  → GET /api/stats/overview /heatmap /time-distribution
	  → StatsService
	    → DiaryRepository.findAllEntries() → 解密每篇后统计非空白字符数
	    → DiaryRepository.countByDateRange() → 按天聚合篇数
	    → DiaryRepository.getHourDistribution() → 按小时聚合篇数
	    → computeStreaks() → 从日期列表计算连续天数
	  ← StatsOverview / HeatmapPoint[] / TimeDistributionPoint[]
	  ← StatsPage 页面展示概览卡片 + 日历热力图 + Recharts 时段柱状图

数据导出
	  → GET /api/export/diaries?format=markdown|json&from=&to=
	  → ExportService
	    → DiaryRepository.findByDateRange() → 解密每篇日记正文
	    → EmotionInsightRepository.findAllByEntryIds() → 附加情绪洞察
	    → 格式化 Markdown（日期/情绪/强度/根因/正文）或 JSON 数组
	  ← 文件下载 (Content-Disposition: attachment)
	  ← 设置页 ExportSection 触发下载（日期范围/格式选择）

## 外部通信

- 前端 ↔ Spring Boot：HTTP REST over localhost（随机端口，Electron IPC 传递）
- Spring Boot ↔ DeepSeek API：HTTPS (api.deepseek.com)
- Spring Boot ↔ Ollama：HTTP (localhost:11434)
- 前端禁止直接发起外部 HTTP 请求（安全红线）
