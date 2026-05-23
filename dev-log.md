# zzDiary 开发日志

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
