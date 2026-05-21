# zzDiary 开发日志

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
