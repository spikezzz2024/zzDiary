# zzDiary 项目文件架构说明

> 记录每个文件与目录的作用，帮助开发者快速了解项目结构。

---

## 根目录文件

| 文件 | 作用 |
|------|------|
| `CLAUDE.md` | Claude Code 全局强制规则。定义代码生成必须遵守的最高优先级行为约束，包括模块化拆分、技术栈红线、安全红线、禁止事项清单。所有代码修改前必须先查阅此文件。 |
| `tech-stack.md` | 技术栈规范文档。定义每一层（桌面壳、前端、后端、数据库、AI、打包）的选定技术及版本，以及明确排除的技术和排除原因。所有技术选型必须以本文档为准。 |
| `zzDiary-design-document.md` | 软件设计文档。包含产品概述、核心功能描述、系统架构图、核心数据结构、AI 引导策略、隐私安全方案、开发路线图。是理解项目业务需求的入口文档。（已与 tech-stack.md 同步） |
| `zzDiary-implementation-plan.md` | AI 开发者标准化分步实施计划。聚焦基础开发环境搭建，每步附有验证方法。标注了已完成步骤的状态。 |
| `progress.md` | 实施进度记录。跟踪每项步骤的完成状态和时间，支持随时恢复工作上下文。 |
| `architecture.md` | 本文件。记录项目中每个文件和目录的用途说明。 |
| `Agents.md` | AI 编码行为规范。统一约束代码分层、通信规范、业务解耦、目录结构、编码最佳实践。对所有 AI 编码助手强制执行。 |
| `.gitignore` | Git 忽略规则文件。定义哪些文件和目录不纳入版本控制。 |
| `desktop.ini` | Windows 系统文件，用于自定义文件夹显示。已在 .gitignore 中排除。 |
| `package.json` | 前端项目配置。包含依赖声明（React 19, Zustand, React Router, Recharts, Tailwind CSS 4 等）和脚本（dev/build/lint）。 |
| `pnpm-lock.yaml` | pnpm 依赖锁定文件。确保依赖版本一致性。 |
| `tsconfig.json` | TypeScript 根配置。引用 tsconfig.app.json 和 tsconfig.node.json。 |
| `tsconfig.app.json` | 应用代码 TypeScript 配置（React JSX, strict mode 等）。 |
| `tsconfig.node.json` | Node/Vite 配置文件的 TypeScript 配置。 |
| `vite.config.ts` | Vite 构建配置。包含 React 插件、Tailwind CSS 4 插件、路径别名 `@/`。 |
| `eslint.config.js` | ESLint 代码检查配置。 |
| `index.html` | 前端入口 HTML。Vite 构建时以此为模板。 |

---

## 目录

| 目录 | 作用 |
|------|------|
| `.git/` | Git 版本控制数据目录。存储所有提交历史、分支信息、远程仓库配置。由 Git 自动管理，不可手动修改。 |
| `.claude/` | Claude Code 配置目录。存放 Claude Code 在本项目的本地设置（settings.local.json 等）。 |
| `memory-bank/` | 项目记忆库目录。存放架构文档、数据库表结构、API 端点清单等持续更新的项目文档。CLAUDE.md 强制规则要求编码前必须通读此目录。 |
| `memory-bank/architecture.md` | 系统架构文档。包含整体架构图、前后端分层、模块依赖规则、数据流、外部通信方案。 |
| `memory-bank/database-schema.md` | 数据库表结构文档。定义 SQLite 各表的字段、类型、约束、加密策略。 |
| `memory-bank/api-endpoints.md` | REST API 清单。列出所有端点的方法、路径、请求/响应格式、错误码。 |
| `src/` | 前端源代码根目录。包含 React 组件、状态管理、样式、工具函数等。 |
| `src/main.tsx` | 前端入口文件。渲染根组件到 DOM。 |
| `src/App.tsx` | 根组件。包含 React Router 路由配置和全局布局。 |
| `src/index.css` | 全局样式。使用 Tailwind CSS 4 的 `@import "tailwindcss"` 指令。 |
| `src/vite-env.d.ts` | Vite 类型声明文件。扩展 TypeScript 类型以支持 Vite 特有功能。 |
| `src/features/` | 业务功能模块目录。按 diary / emotion / family / mindfulness 拆分，每个模块自包含组件、store、types。 |
| `src/features/diary/` | 日记书写模块（Editor, GuidedChat, diary.store, types）。 |
| `src/features/emotion/` | 情绪分析模块（Dashboard, TrendChart, emotion.store, types）。 |
| `src/features/family/` | 原生家庭模块（BackgroundForm, InsightPanel, family.store, types）。 |
| `src/features/mindfulness/` | 正念练习模块（ExercisePlayer, GratitudeTemplate, mindfulness.store, types）。 |
| `src/components/ui/` | 纯 UI 原子组件（Button, Input, Modal, Badge, Card）。不包含业务逻辑，不引用 features/ 或 store。 |
| `src/hooks/` | 通用自定义 Hooks（useApi, useDebounce）。无 UI，可被任何模块引用。 |
| `src/lib/` | 工具函数和 API 客户端。`api.ts` 为后端 REST API 封装，`constants/` 存放常量。 |
| `src/types/` | 跨模块共享 TypeScript 类型定义。 |
| `public/` | 前端静态资源目录。存放不经过构建处理的静态文件。 |
| `zzdiary-server/` | Java Spring Boot 后端源代码根目录。按 controller / service / repository / model / infrastructure 分层。 |
| `zzdiary-server/build.gradle.kts` | Gradle Kotlin DSL 构建脚本。定义 Java 25 工具链、Spring Boot 3.5.x、SQLite JDBC 等依赖。 |
| `zzdiary-server/settings.gradle.kts` | Gradle 项目设置。 |
| `zzdiary-server/gradle/` | Gradle Wrapper 文件。包含 wrapper jar 和 properties，确保构建环境一致性。 |
| `zzdiary-server/src/main/java/com/zzdiary/` | Java 源码根包。 |
| `zzdiary-server/src/main/java/com/zzdiary/controller/` | REST 控制层。只做参数校验和路由，不写业务逻辑。 |
| `zzdiary-server/src/main/java/com/zzdiary/service/` | 业务逻辑层。核心业务编排、事务管理。 |
| `zzdiary-server/src/main/java/com/zzdiary/repository/` | 数据访问层。封装 JDBC 操作和 JVector 检索。 |
| `zzdiary-server/src/main/java/com/zzdiary/model/entity/` | 数据库实体类。 |
| `zzdiary-server/src/main/java/com/zzdiary/model/dto/` | 传输对象（Java record）。不可变，自动生成 getter/equals/hashCode。 |
| `zzdiary-server/src/main/java/com/zzdiary/infrastructure/` | 基础设施层。encryption/（AES-256-GCM + PBKDF2）、vector/（JVector）、ai/（DeepSeek + Ollama 客户端）。 |
| `zzdiary-server/src/main/resources/application.yml` | Spring Boot 配置。随机端口、127.0.0.1 绑定、SQLite 数据源、Actuator 仅暴露 health。 |

---

> 更新方式：每新增一个文件或目录，在此文档中追加对应说明行。
