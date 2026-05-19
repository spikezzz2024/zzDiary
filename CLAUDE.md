# CLAUDE.md — zzDiary 全局强制规则

> 本文件为 Claude Code 最高优先级行为约束，所有代码生成、修改、建议均须遵循。

---

## Always 最高优先级强制规则

### Always 1：编写任意代码前，必须完整通读 memory-bank 文档

```
执行顺序（强制）：
  1. 读取 memory-bank/ 目录下所有 .md 文件
  2. 确认理解项目架构、业务场景、技术栈约束
  3. 确认本次修改不违反任何已定义规则
  4. 方可开始编码
```

**目的：** 确保每次代码变更理解完整上下文，避免片段式修改破坏架构一致性。

### Always 2：全程强制采用模块化多文件拆分架构

```
严禁：
  ✗ 单个文件超过 300 行
  ✗ 单个组件包含 3+ 种职责
  ✗ 单体 utils.ts / helpers.ts 聚合文件
  ✗ 全局 Store 巨文件（所有状态放一个 store）
  ✗ 所有 Controller 写在一个 Java 文件中
  ✗ 所有 Service 逻辑堆在一个类中

必须：
  ✓ 前端按业务特征拆分：features/<module>/{Component, store, types}
  ✓ 通用逻辑抽取为独立 hook：hooks/useXxx.ts
  ✓ 常量按域拆分：lib/constants/<domain>.ts
  ✓ Java 后端按职责拆分：controller / service / repository / infrastructure
  ✓ 每个文件单一职责，职责边界清晰
```

**参考结构：**
```
src/                              # 前端
├── features/
│   ├── diary/                    # 导入：仅 diary 目录内文件可互相引用
│   │   ├── Editor.tsx
│   │   ├── GuidedChat.tsx
│   │   ├── diary.store.ts
│   │   └── types.ts
│   ├── emotion/                  # 模块间通过 lib/api.ts 通信，不直接引用
│   └── family/
├── components/ui/                # 纯 UI 原子组件，无业务逻辑
├── hooks/                        # 通用 hook，无 UI
├── lib/                          # 纯函数工具 + API 客户端
└── types/                        # 跨模块共享类型

zzdiary-server/                   # Java 后端 (Spring Boot)
└── src/main/java/com/zzdiary/
    ├── controller/               # REST 接口层
    │   ├── DiaryController.java
    │   ├── EmotionController.java
    │   ├── FamilyController.java
    │   └── SearchController.java
    ├── service/                  # 业务逻辑层
    │   ├── DiaryService.java
    │   ├── EmotionAnalysisService.java
    │   ├── FamilyInsightService.java
    │   └── AiService.java
    ├── repository/               # 数据访问层
    │   ├── DiaryRepository.java
    │   ├── EmotionRepository.java
    │   └── FamilyRepository.java
    ├── model/                    # 领域模型 / DTO
    │   ├── entity/               # 数据库实体
    │   └── dto/                  # 传输对象
    └── infrastructure/           # 基础设施
        ├── encryption/           # 加密服务
        ├── vector/               # JVector 检索
        └── ai/                   # AI 客户端
```

### Always 3：所有代码严格遵循 tech-stack.md 技术栈规范

```
技术栈红线（不可违反）：
  ├─ 桌面壳：Electron 33.x（不可降级到其他方案）
  ├─ 前端：React 18 + TypeScript 5.x + Vite 6.x
  ├─ 状态管理：Zustand 5.x（不可引入 Redux / MobX）
  ├─ 样式：Tailwind CSS 4.x（不可引入 MUI / Ant Design）
  ├─ 图表：Recharts 2.x（不可引入 ECharts）
  ├─ 后端语言：Java 21 LTS（不可降级到 Java 17 或引入 Kotlin/Scala）
  ├─ 后端框架：Spring Boot 3.4.x（不可换成 Quarkus / Micronaut）
  ├─ 构建：Gradle Kotlin DSL 8.x（不可用 Maven）
  ├─ 数据库：SQLite (JDBC)（不可换用 H2 / PostgreSQL）
  ├─ 向量检索：JVector（不可换用 LanceDB / Chroma / Pinecone）
  ├─ AI 调用：必须走 Spring Boot 后端（前端禁止直接 fetch AI API）
  ├─ 通信：前端 ↔ Spring Boot 通过 REST API over localhost
  ├─ 包管理：pnpm 9.x（不可混用 npm / yarn）
  └─ 所有依赖引入前必须对照 tech-stack.md 确认允许
```

### Always 4：核心功能 / 版本里程碑完成后，主动更新架构文档

```
触发条件（满足任一即触发）：
  - 新增一个 features/ 模块
  - 新增一张数据库表
  - 新增一个 REST API 端点
  - 引入新的外部依赖
  - 完成一个 MVP 阶段（参见设计文档路线图）

更新内容：
  1. memory-bank/architecture.md — 模块依赖图 / 数据流
  2. memory-bank/database-schema.md — 表结构变更
  3. memory-bank/api-endpoints.md — REST API 清单
```

---

## 代码质量标准

### 语言规范

**TypeScript：**
- 全量使用 TypeScript，禁止 `.js` / `.jsx` 文件
- React 组件 PascalCase，函数/变量 camelCase，常量 UPPER_SNAKE
- 所有函数显式标注返回类型

**Java：**
- 类 PascalCase，方法/变量 camelCase，常量 UPPER_SNAKE
- 所有 public 方法必须有 Javadoc（一行说明即可）
- 使用 `record` 定义 DTO，不可用 Lombok

### TypeScript 类型约束

```typescript
// 强制：所有函数显式标注返回类型
async function analyzeEntry(content: string): Promise<EmotionInsight> { ... }

// 强制：Zustand Store 显式标注接口
interface DiaryStore {
  entries: DiaryEntry[];
  addEntry: (entry: DiaryEntry) => void;
}

// 禁止：any 类型，必要时用 unknown + 类型守卫
```

### Java 代码约束

```java
// 强制：Controller 只做参数校验 + 路由，不写业务逻辑
@RestController
@RequestMapping("/api/diary")
public class DiaryController {

    private final DiaryService diaryService;

    public DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<EmotionInsight> analyze(@RequestBody @Valid AnalyzeRequest request) {
        return ResponseEntity.ok(diaryService.analyze(request.content()));
    }
}

// 强制：使用 record 定义 DTO，不可变 + 自动生成 getter
public record AnalyzeRequest(@NotBlank String content) {}

// 强制：Service 层包含所有业务逻辑
// 禁止：在 Controller 或 Repository 中写业务逻辑
// 禁止：使用 Lombok（val/var 遮蔽类型，@Data 易导致循环引用）
// 强制：构造器注入，不可使用 @Autowired 字段注入
```

### 组件编写约束

```typescript
// 强制：组件文件只包含一个默认导出组件
export default function DiaryEditor() { ... }

// 强制：业务组件放在 features/<module>/，不在 components/
// 强制：纯 UI 组件（Button/Input/Modal）放在 components/ui/
// 禁止：在 components/ui/ 中引入任何 features/ 或 store
```

---

## 安全红线（不可违反）

1. **AI API Key 绝不出现在前端代码中** — 存储在 Spring Boot `application.yml` 或环境变量
2. **日记内容发送 AI 前必须脱敏** — 正则移除人名、地名、数字串
3. **数据库加密密钥** — 由用户应用启动密码 PBKDF2 派生，不可硬编码
4. **前端禁止直接发起外部 HTTP 请求** — 所有外部网络通信走 Spring Boot 后端
5. **不收集、不上传任何用户数据** — 所有数据仅存本地
6. **Spring Boot 端口仅监听 127.0.0.1** — 禁止绑定 0.0.0.0，防止局域网暴露
7. **Actuator 仅暴露 /health** — 关闭 env / configprops / mappings 等敏感端点

---

## 禁止事项清单

| 禁止行为 | 说明 |
|----------|------|
| 跳过类型标注 | 任何 TS 函数必须显式返回类型 |
| 单文件超 300 行 | 超过即触发拆分 |
| 引入非白名单依赖 | 新建依赖前查阅 tech-stack.md |
| 前端直接 fetch 外部 API | 所有网络请求走 Spring Boot 后端 |
| Controller 写业务逻辑 | 业务逻辑放 Service 层 |
| 字段注入 @Autowired | 使用构造器注入 |
| 使用 Lombok | 用 Java record 替代 |
| 在 UI 组件中写业务逻辑 | 业务逻辑放 store/hook |
| 跨 features 直接导入组件 | 模块间通过 API 或公共类型通信 |
| 硬编码字符串 | 提取到 lib/constants/ 或 Java constants |
