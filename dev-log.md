# zzDiary 开发日志

## 2026-05-24 (下午) — 语义搜索 + 嵌入模型自动安装

### 新增文件 (10)

| 文件 | 说明 |
|------|------|
| `zzdiary-server/.../model/dto/SearchRequest.java` | 搜索请求 DTO，query @NotBlank |
| `zzdiary-server/.../model/dto/SearchResult.java` | 搜索结果 DTO（id, snippet, score, emotionTags, createdAt） |
| `zzdiary-server/.../model/entity/DiaryEmbedding.java` | 嵌入向量实体 record |
| `zzdiary-server/.../repository/DiaryEmbeddingRepository.java` | 嵌入 CRUD：upsert（save）、全量查询（findAll）、按 entryId 删除 |
| `zzdiary-server/.../service/EmbeddingService.java` | Ollama 嵌入生成 + BLOB 序列化 + 启动加载 + 模型可用性检查 |
| `zzdiary-server/.../service/VectorIndexManager.java` | 内存余弦相似度索引（ConcurrentHashMap + PriorityQueue Top-K） |
| `zzdiary-server/.../service/SearchService.java` | 搜索编排：查询嵌入 → 向量搜索 → 解密摘要 |
| `zzdiary-server/.../controller/SearchController.java` | `POST /api/search/semantic` + `GET /api/search/model-status` + `POST /api/search/pull-model` |
| `src/features/diary/SearchBar.tsx` | 搜索栏组件：5 种状态（骨架屏 / 模型引导 / 下载中 / Ollama 未运行 / 搜索框） |
| `src/features/diary/search.store.ts` | 搜索 Zustand store：查询/结果/模型状态/拉取 |

### 修改文件 (9)

| 文件 | 变更 |
|------|------|
| `schema.sql` | 新增 `diary_embeddings` 表（entry_id UNIQUE FK, embedding BLOB, model, dimension） |
| `OllamaClient.java` | 新增 `embed()`（调用 `/api/embeddings`）、`listModelNames()`、`isModelPulled()` |
| `DiaryService.java` | 注入 `EmbeddingService` / `VectorIndexManager`；`saveToday()` / `analyze()` / `analyzeExisting()` 后触发索引；`delete()` 清理嵌入 |
| `DatabaseInitializer.java` | 启动时从 `diary_embeddings` 表加载全部向量到内存索引 |
| `src/lib/api.ts` | 新增 `searchApi`（semantic / modelStatus / pullModel） |
| `src/types/shared.ts` | 新增 `SearchResult` 接口 |
| `src/features/diary/DiaryHistoryPage.tsx` | 集成 SearchBar，搜索时隐藏日历/列表 |
| `memory-bank/architecture.md` | 更新模块状态、数据流（语义搜索 + 索引流） |
| `memory-bank/api-endpoints.md` | 补充搜索端点详情 + 模型状态/拉取端点 |
| `memory-bank/database-schema.md` | 新增 `diary_embeddings` 表文档 |

### 设计决策

- **不用 JVector，用内存余弦相似度。** 零额外依赖，<10K 日记时 <10ms。设计为可替换——`VectorIndexManager` 对外接口不变，换成 JVector 只改这一个类。
- **嵌入模型 nomic-embed-text（768 维）**，唯一依赖 Ollama `/api/embeddings`。DeepSeek 无嵌入 API，仅做聊天。
- **保存时索引 + 启动时全量加载**。`diary_embeddings` 表是持久化源，`VectorIndexManager` 是内存镜像。
- **首次使用自动引导下载。** 搜索页检测模型状态，若 Ollama 已运行但模型未拉取，弹出引导卡片说明用途和大小（274MB），一键下载。
- **搜索栏放在日记本页面。** 搜索时隐藏日历视图，结果按相似度降序，点击跳转详情页。

---

## 2026-05-24 — 原生家庭背景功能

### 新增文件 (9)

| 文件 | 说明 |
|------|------|
| `zzdiary-server/.../model/entity/FamilyBackground.java` | 家庭背景实体 record（含 skill_summary BLOB） |
| `zzdiary-server/.../model/dto/FamilyBackgroundRequest.java` | 保存背景请求 DTO，childhoodSummary / significantEvents @NotBlank |
| `zzdiary-server/.../model/dto/FamilyBackgroundResponse.java` | 解密后的背景响应 DTO，含 skillSummary |
| `zzdiary-server/.../repository/FamilyBackgroundRepository.java` | 单行表 upsert + updateSkillSummary 部分更新 |
| `zzdiary-server/.../service/FamilyService.java` | 背景 CRUD + AI 提炼 + 分析用技能获取 |
| `zzdiary-server/.../controller/FamilyController.java` | `GET/PUT /api/family/background` + `POST /api/family/distill` |
| `src/features/family/family.store.ts` | Zustand store：loading/saving/distilling/error 状态管理 |
| `src/features/family/FamilyPage.tsx` | 家庭背景页面：骨架屏/空引导/表单+提炼/技能卡片 全状态覆盖 |

### 修改文件 (6)

| 文件 | 变更 |
|------|------|
| `schema.sql` | `diary_entries` 之前新增 `family_background` 建表语句（childhood_summary BLOB / parental_relationship TEXT / significant_events BLOB / skill_summary BLOB） |
| `AiService.java` | 提取 `callAi()` 私有方法封装 DeepSeek/Ollama 切换；新增 `analyze(content, familySkill)` 重载方法（技能非空时追加到 system prompt）；新增 `distillFamilySkill()` 返回纯文本 |
| `DiaryService.java` | 注入 `FamilyService`；`analyze()` / `analyzeExisting()` 调用 `getSkillForAnalysis()` 获取技能注入 AI；保存日记时设置 `familyInsightId` |
| `DiaryRepository.java` | 新增 `updateFamilyInsightId()` 方法 |
| `src/types/shared.ts` | 新增 `FamilyBackground` 接口 |
| `src/lib/api.ts` | 新增 `familyApi`（getBackground / saveBackground / distill） |
| `src/App.tsx` | `/family` 路由 + 导航栏"家庭"入口（日记本与情绪之间） |

### 设计决策

- 家庭背景表单填写 → AI 提炼为约 200 字"技能摘要" → 摘要注入到每次日记分析 prompt 中（无条件，有则注入）
- `family_background` 采用单行表模式（upsert via DELETE + INSERT），与 `ai_settings` 一致
- `parentalRelationship` 存明文（短标签低敏感），其余字段 AES-256-GCM 加密
- 重载 `AiService.analyze()` 而非改签名，保持现有调用方向后兼容
- 分析日记时自动设置 `diary_entries.family_insight_id`，为将来"查询家庭相关日记"留基础

---

## 2026-05-23 (深夜) — 情绪可视化前端 + 移除本地规则引擎

### 删除本地规则引擎

- `AiService.java`：移除 `analyzeLocal()`、`fallbackAnalyze()` 及所有关键词检测方法（`detectEmotions` / `estimateIntensity` / `detectBiases` / `hasFamilyKeywords`）。AI 不可用时直接抛出异常，不再降级到本地猜测。
- `DiaryService.java`：`analyze()` / `analyzeExisting()` 现在将 AI 分析结果持久化到 `emotion_insights` 表（每情绪标签一行），同时更新 `diary_entries.emotion_tags` 和 `emotion_intensity`。
- `EmotionAnalysisService.java`：重写为从 `emotion_insights` 表读取已持久化的 AI 结果进行聚合，不再调用本地分析。
- `EmotionInsightRepository.java`：新增 `findAllByEntryIds()` / `deleteByEntryId()`，支持批量查询和覆盖更新。

### 新增文件 (1)

| 文件 | 说明 |
|------|------|
| `src/features/emotion/EmotionDashboard.tsx` | 情绪仪表盘：日期范围选择 + Recharts 趋势折线图（日期/主导情绪/强度） + 环形分布饼图（情绪类型/出现次数） + 骨架屏/空引导/错误重试全状态覆盖 |

### 修改文件 (6)

| 文件 | 变更 |
|------|------|
| `src/App.tsx` | 新增 `/emotion` 路由 + 导航栏"情绪"入口 |
| `src/lib/api.ts` | 新增 `emotionApi`（getTrend / getDistribution / getByEntry） |
| `src/types/shared.ts` | 新增 `EmotionDistribution` 类型 |
| `memory-bank/architecture.md` | 更新情绪模块状态 + 数据流描述（分析持久化 → 趋势聚合链） |
| `memory-bank/api-endpoints.md` | 更新分析端点说明 + emotion 端点补充详细文档 |

### 设计决策

- 情绪趋势/分布**仅反映 AI 分析过的日记**，未分析的日记不出现在统计中
- 空数据时展示引导文案，指向书写页执行 AI 分析
- 趋势图需要至少 2 天数据才渲染折线，避免单点无意义图表
- 饼图颜色优先使用情绪常量映射色，回退到预设调色板

---

## 2026-05-23 (晚间) — 情绪趋势后端 API

### 新增文件 (4)

| 文件 | 说明 |
|------|------|
| `zzdiary-server/.../controller/EmotionController.java` | 情绪 REST 接口：趋势、分布、单条查询 |
| `zzdiary-server/.../service/EmotionAnalysisService.java` | 情绪趋势分析业务逻辑：按日期聚合、情绪分布统计、单条目分析 |
| `zzdiary-server/.../model/dto/TrendPoint.java` | 趋势数据点 DTO（日期、主导情绪、平均强度） |
| `zzdiary-server/.../model/dto/EmotionDistribution.java` | 情绪分布 DTO（情绪类型、出现次数） |

### 修改文件 (2)

| 文件 | 变更 |
|------|------|
| `zzdiary-server/.../repository/DiaryRepository.java` | 新增 `findByDateRange()` 方法，支持日期范围查询 |
| `zzdiary-server/.../service/AiService.java` | 提取 `analyzeLocal()` 公开方法：纯规则引擎分析，不调用 AI，供趋势聚合批量使用；`fallbackAnalyze` 改为调用 `analyzeLocal` 后追加降级说明 |

### 设计决策

- 趋势/分布分析全部使用本地规则引擎（`analyzeLocal`），不调用 AI，确保批量查询性能
- 分析结果不入库，每次请求实时计算，保证与最新日记内容一致
- 日期聚合按 `created_at` 自然日分组，同一天多篇日记取情绪标签众数 + 强度均值
- `GET /api/emotion/{entryId}` 复用 `analyzeLocal`，返回与 `/api/diary/{id}/analyze` 相同结构（但不调用 AI）

---

## 2026-05-23 (下午 2) — 日记自动保存草稿

### 新增文件 (1)

| 文件 | 说明 |
|------|------|
| `zzdiary-server/.../model/dto/SaveRequest.java` | 保存日记请求 DTO |

### 修改文件 (4)

| 文件 | 变更 |
|------|------|
| `zzdiary-server/.../controller/DiaryController.java` | 新增 `POST /api/diary/save` 端点 |
| `zzdiary-server/.../service/DiaryService.java` | 新增 `saveToday()`：同一天仅保留一份日记，再次保存覆盖更新 |
| `zzdiary-server/.../repository/DiaryRepository.java` | 新增 `findTodayEntry()` / `updateContent()` |
| `src/features/diary/diary.store.ts` | 新增 `saveDraft()` / `loadTodayDraft()` / `draftId`；`analyze()` 改为先保存再通过 `analyzeEntry(id)` 分析 |
| `src/features/diary/DiaryPage.tsx` | 页面挂载时加载今日草稿；输入停止 2 秒后自动保存；关闭标签页/窗口前通过 `sendBeacon` 保存；工具栏显示"保存中..."状态 |
| `src/lib/api.ts` | 新增 `saveToday()` API 方法 |

### 设计决策

- 自动保存防抖 2 秒，避免频繁写入
- `beforeunload` 使用 `navigator.sendBeacon` 发送，确保页面关闭前数据发出
- 同一个自然日只保留一份日记条目，后续保存覆盖之前内容
- 分析流程：先 `saveToday` 保存最新内容 → 再 `analyzeEntry(id)` 执行 AI 分析

---

## 2026-05-23 (下午) — 历史日历查询 + AI 分析不持久化

### 新增文件 (1)

| 文件 | 说明 |
|------|------|
| `src/features/diary/Calendar.tsx` | 纸张风格月历组件：点击日期查询当天日记，有日记的日期显示小圆点标记，今天/选中日期高亮，月份切换 |

### 修改文件 (7)

| 文件 | 变更 |
|------|------|
| `zzdiary-server/.../controller/DiaryController.java` | 新增 `GET /api/diary/dates`（有日记的日期列表）、`GET /api/diary/by-date?date=`（按日期查询）、`POST /api/diary/{id}/analyze`（对已有日记执行分析） |
| `zzdiary-server/.../service/DiaryService.java` | `analyze()` 不再持久化 emotion_insights；新增 `analyzeExisting()` 供历史日记分析；新增 `findByDate()` / `getDatesWithEntries()`；移除 `EmotionInsightRepository` 依赖 |
| `zzdiary-server/.../repository/DiaryRepository.java` | 新增 `findByDate()` / `findDistinctDates()` 查询方法 |
| `src/lib/api.ts` | 新增 `analyzeEntry()` / `getByDate()` / `getDates()` API 方法 |
| `src/features/diary/diaryHistory.store.ts` | 新增日历相关状态（datesWithEntries、selectedDate）、`fetchByDate()` / `fetchDates()` / `analyzeEntry()` / `clearAnalysis()` |
| `src/features/diary/DiaryHistoryPage.tsx` | 重构：日历选日 + 当天日记列表替代分页列表，移除模式标签 |
| `src/features/diary/DiaryDetailPage.tsx` | 新增"分析情绪"按钮，手动触发 AI 分析并展示结果；移除模式标签、旧版情绪分析面板 |

### 删除文件 (1)

| 文件 | 说明 |
|------|------|
| `src/features/emotion/EmotionResult.tsx` | 已被 AnalysisSidebar 替代，死代码清理 |

### 设计决策

- AI 分析结果不再持久化到 emotion_insights 表，仅在当前会话展示
- 历史日记不再展示旧版情绪数据（仍存在于旧条目的 DB 中，但前端不读取）
- 日历完全 CSS 实现，无第三方日期库依赖
- 日历视觉风格匹配纸张主题（CSS 变量），楷体字月标题，圆点标记有日记的日期

---

## 2026-05-23 — 前端美化：作文纸编辑器 + 侧边栏分析 + 纸张风格切换

### 新增文件 (4)

| 文件 | 说明 |
|------|------|
| `src/features/diary/paper.store.ts` | 纸张偏好 Zustand store：材质（方格/横线/素白）+ 颜色主题（经典米黄/宣纸素白/暗夜暖灯/护眼青绿），localStorage 持久化 |
| `src/features/diary/PaperEditor.tsx` | 作文纸风格编辑器：CSS 网格/横线背景、红色边线、楷体字、纸张纹理叠加、字数统计、分析触发按钮 |
| `src/features/diary/AnalysisSidebar.tsx` | 侧边栏分析面板：柔和语言呈现情绪标签、强度条、认知偏差、根本原因、正念建议，替代原有对话框式结果卡片 |
| `src/features/diary/PaperStylePicker.tsx` | 纸张风格下拉选择器：材质三选一（含迷你预览）、颜色四选一（色块），点击外部自动关闭 |

### 修改文件 (4)

| 文件 | 变更 |
|------|------|
| `src/features/diary/DiaryPage.tsx` | 重构为左右分栏布局：作文纸编辑器占主体，分析结果从右侧滑入侧边栏。移除自由/引导模式切换，统一为自由书写。顶部工具栏含纸张风格选择器。加载骨架屏移至侧边栏区域。 |
| `src/features/diary/diary.store.ts` | 精简：移除 chatMessages / mode / addChatMessage / clearChat / setMode，仅保留 free writing + analyze 流程 |
| `src/App.tsx` | 最大宽度扩至 1280px 容纳分栏布局，header 改为暖色调（米色系），导航文案调整（"日记"→"书写"，"历史"→"日记本"） |
| `src/index.css` | 新增 4 套纸张颜色主题 CSS 变量（classic/rice/dark/blue），3 种纸张材质背景图案（grid/lined/blank），纸张纹理伪元素叠加层，`:root` 默认主题回退 |

### 删除文件 (3)

| 文件 | 说明 |
|------|------|
| `src/features/diary/Editor.tsx` | 被 PaperEditor 替代 |
| `src/features/diary/GuidedChat.tsx` | 对话框式引导被侧边栏分析替代 |
| `src/features/diary/types.ts` | WriteMode / ChatMessage 类型不再需要 |

### 设计决策

- AI 分析结果从卡片式底部展示改为侧边栏平铺，语言从临床标签改为柔和叙述（"感受到的情绪" / "可能的缘由" / "思维习惯"），避免诘问感
- 纸张材质完全用 CSS `repeating-linear-gradient` 实现，无图片依赖；方格对齐行高 32px，横线对齐行高 29px
- 红色边线仅 grid/lined 模式显示，blank 模式隐藏，还原真实作文纸特征
- 纸张偏好通过 Zustand + localStorage 持久化，跨会话保留

---

## 2026-05-22 — 移除账号登录注册功能

### 删除文件 (9)

| 文件 | 说明 |
|------|------|
| `src/features/auth/auth.store.ts` | 前端认证状态管理 |
| `src/features/auth/SetupScreen.tsx` | 首次创建账户页面 |
| `src/features/auth/UnlockScreen.tsx` | 密码解锁页面 |
| `zzdiary-server/.../controller/AuthController.java` | 认证 REST 接口 |
| `zzdiary-server/.../service/AuthService.java` | 认证业务逻辑 |
| `zzdiary-server/.../repository/UserRepository.java` | 用户数据访问 |
| `zzdiary-server/.../model/entity/AppUser.java` | 用户实体 |
| `zzdiary-server/.../model/dto/SetupRequest.java` | 注册请求 DTO |
| `zzdiary-server/.../model/dto/UnlockRequest.java` | 解锁请求 DTO |

### 修改文件 (7)

| 文件 | 变更 |
|------|------|
| `src/App.tsx` | 移除 AuthGate 包装、SetupScreen/UnlockScreen 引用、header 中的 email/锁定按钮 |
| `src/lib/api.ts` | 移除 authApi 全部方法 |
| `src/types/shared.ts` | 移除 AuthStatus 接口 |
| `KeyManager.java` | 重写：移除密码派生逻辑，改为首次启动自动生成随机 AES-256 密钥持久化到 `~/.zzdiary/encryption.key` |
| `schema.sql` | 移除 app_users 建表语句 |
| `memory-bank/` 3 个文档 | 同步移除 auth 相关描述 |

### 技术决策

- 本地应用无需账号体系，加密密钥改为随机生成 + 磁盘持久化，无需用户记忆密码
- 加密层（AES-256-GCM）保留，仅密钥来源从 PBKDF2(password) 变为 SecureRandom 生成
- 用户直接进入日记页面，无登录/解锁门槛

---

## 2026-05-22 — 日记历史列表 + 单篇详情页

### 新增文件 (3)

| 文件 | 说明 |
|------|------|
| `src/features/diary/diaryHistory.store.ts` | 日记历史 Zustand store：分页列表、单篇获取、删除 |
| `src/features/diary/DiaryHistoryPage.tsx` | 历史列表页：日期卡片、情绪标签、强度预览、分页加载更多、空状态 |
| `src/features/diary/DiaryDetailPage.tsx` | 日记详情页：全文展示、情绪分析面板（复用 Badge + 强度组件）、删除、返回 |

### 修改文件 (1)

| 文件 | 变更 |
|------|------|
| `src/App.tsx` | 新增 `/history` 和 `/diary/:id` 路由，主菜单添加"历史"导航链接 |

### 核心功能

- **历史列表** → 卡片式展示，按时间倒序，每张卡片包含日期、书写模式、内容预览(120字截断)、情绪标签 Badge、强度进度条
- **分页加载** → 每页 20 条，底部"加载更多"按钮，自动合并新旧数据
- **单篇详情** → URL 参数路由 `/diary/:id`，显示完整日记正文 + 情绪分析面板
- **删除功能** → 列表卡片 hover 删除按钮 + 详情页删除按钮，双重 `window.confirm` 确认
- **边界状态覆盖** → 加载骨架屏、空状态插画+引导入口、错误提示、404 未找到

### 技术决策

- 历史浏览与书写编辑拆分为独立 Zustand store（diaryHistory.store / diary.store），职责清晰
- 详情页复用情绪颜色常量和大情绪标签组件，保持与书写页一致的视觉语言
- 列表页未引入虚拟滚动（条目量级小），保持轻量实现

---

## 2026-05-21 — MVP 收尾：前端日记书写 + 情绪分析结果展示 + AI 降级

### 新增文件 (11)

| 文件 | 说明 |
|------|------|
| `src/features/diary/types.ts` | 日记模块类型定义（WriteMode, ChatMessage） |
| `src/features/diary/diary.store.ts` | 日记 Zustand store：内容管理、模式切换、API 调用 |
| `src/features/diary/Editor.tsx` | 自由书写编辑器：文本框 + 字数统计 + 分析按钮 |
| `src/features/diary/GuidedChat.tsx` | AI 引导对话界面：规则匹配引导 + 完整分析 |
| `src/features/diary/DiaryPage.tsx` | 日记主页：自由/引导模式切换 + 结果展示编排 |
| `src/features/emotion/types.ts` | 情绪模块类型（EmotionTagMeta, TrendPoint） |
| `src/features/emotion/emotion.store.ts` | 情绪分析历史 Zustand store |
| `src/features/emotion/EmotionResult.tsx` | 分析结果卡片：情绪标签、强度条、认知偏差、正念建议 |
| `src/components/ui/Badge.tsx` | 通用标签 UI 组件 |
| `src/lib/constants/emotions.ts` | 12 种情绪的颜色映射配置 |

### 修改文件 (4)

| 文件 | 变更 |
|------|------|
| `src/App.tsx` | 首页路由替换为 `<DiaryPage />`，移除占位文字 |
| `memory-bank/architecture.md` | 更新前端模块完成状态标记 |
| `DatabaseInitializer.java` | 启动时自动创建 `~/.zzdiary/` 目录 |
| `AiService.java` | 新增规则引擎降级分析（关键词匹配），AI 不可用时返回本地分析结果 |

### 核心功能

- **自由书写** → 点击"分析情绪" → 调用 Spring Boot → AI/规则分析 → 展示结果卡片
- **AI 引导对话** → 规则引擎模拟引导提问 → 点击"完成分析" → 展示结果
- **分析结果卡**：情绪标签（Badge）、强度进度条、认知偏差、根本原因、正念建议
- **AI 降级**：Ollama 不可用且 DeepSeek API Key 未配置时，使用本地关键词规则引擎（检测 11 种情绪 + 6 种认知偏差），确保无 AI 环境也能完整体验

### Bug 修复

- **SQLite 目录不存在**：`DatabaseInitializer` 现在在初始化数据库前自动创建 `.zzdiary` 目录
- **AI 不可用时崩溃**：`AiService` 改为异常捕获 + fallback 降级，不再抛异常

### 技术决策

- MVP 阶段先实现自由书写完整闭环，引导对话使用规则引擎模拟（后续接入真实 AI）
- 分析结果和日记书写状态通过两个独立 store 管理（diary.store / emotion.store），符合模块解耦原则
- 所有新增文件均 ≤ 100 行，符合 CLAUDE.md 规范
