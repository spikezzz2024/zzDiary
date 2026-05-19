# Agents.md — zzDiary 智能体行为规范

> 统一约束 AI 编码行为：代码分层、通信规范、业务解耦、目录结构、编码最佳实践。
> 本规范对所有 AI 编码助手（Claude Code 等）强制执行。

---

## 1. 代码分层架构（强制）

```
┌─────────────────────────────────────────┐
│              表现层 (UI)                 │
│  features/<module>/*.tsx                │
│  components/ui/*.tsx                    │
│  职责：纯视图渲染，不含业务逻辑           │
├─────────────────────────────────────────┤
│              状态层 (State)              │
│  features/<module>/*.store.ts           │
│  hooks/*.ts                             │
│  职责：状态管理 + 客户端逻辑             │
├─────────────────────────────────────────┤
│              通信层 (API Client)          │
│  lib/api.ts                             │
│  职责：封装 REST 调用，类型安全请求        │
│  ═══════════════════════════════════════ │
│       HTTP (localhost 仅 127.0.0.1)      │
│  ═══════════════════════════════════════ │
├─────────────────────────────────────────┤
│           控制层 (Controller)            │
│  zzdiary-server/.../controller/*.java   │
│  职责：接收 HTTP 请求，参数校验，路由     │
├─────────────────────────────────────────┤
│           业务层 (Service)               │
│  zzdiary-server/.../service/*.java      │
│  职责：核心业务逻辑、编排、事务管理       │
├─────────────────────────────────────────┤
│           持久层 (Repository)            │
│  zzdiary-server/.../repository/*.java   │
│  职责：数据库操作、向量检索              │
├─────────────────────────────────────────┤
│           基础设施层 (Infrastructure)     │
│  encryption/ vector/ ai/                │
│  职责：加密、向量、AI 等横切关注点        │
├─────────────────────────────────────────┤
│              数据层 (Data)               │
│  SQLite + JVector                        │
│  职责：持久化存储 + 向量检索              │
└─────────────────────────────────────────┘
```

### 分层规则（不可违反）

**规则 1：单向依赖**
```
表现层 → 状态层 → 通信层 → (HTTP) → 控制层 → 业务层 → 持久层 → 数据层
                                                ↘ 基础设施层 ↗ (横切)
```
每一层只能依赖其直接下层或基础设施层，不可跨层调用。

**规则 2：组件分类**
```typescript
// ✓ 正确：UI 组件不包含业务逻辑
function EmotionBadge({ type, intensity }: { type: string; intensity: number }) {
  return <span className={colorMap[type]}>{type} · {intensity}</span>;
}

// ✗ 错误：UI 组件直接调用 API
function EmotionBadge({ entryId }: { entryId: string }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`http://localhost:${port}/api/emotion/${entryId}`).then(...); // 业务逻辑不应在此
  }, [entryId]);
}
```

**规则 3：状态归属**
```typescript
// ✓ 正确：业务状态放 feature store
// features/diary/diary.store.ts
export const useDiaryStore = create<DiaryStore>((set) => ({
  entries: [],
  addEntry: (entry) => set((s) => ({ entries: [...s.entries, entry] })),
}));

// ✓ 正确：纯 UI 状态用本地 useState
function Modal({ open }: { open: boolean }) {
  const [animating, setAnimating] = useState(false); // UI 动画状态，本地即可
  ...
}

// ✗ 错误：跨 feature 直接读写其他 store
// features/emotion/EmotionChart.tsx
import { useDiaryStore } from '../diary/diary.store'; // 跨模块直接引用
```

---

## 2. 网络通信规范

### 2.1 前端通信规则

```
规则：前端禁止直接发起任何外部 HTTP 请求
     所有外部通信必须通过 Spring Boot 后端中转
     前端仅与 localhost Spring Boot 通信
```

```typescript
// lib/api.ts — 统一 REST API 客户端
const API_BASE = `http://127.0.0.1:${window.__ZZDIARY_PORT__}`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// 类型安全的 API 封装
export async function analyzeDiary(content: string): Promise<EmotionInsight> {
  return request<EmotionInsight>('/api/diary/analyze', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function searchDiary(query: string): Promise<DiaryEntry[]> {
  return request<DiaryEntry[]>('/api/search/semantic', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

// 前端只调用此文件导出的函数，不直接 fetch
```

### 2.2 端口传递机制

```typescript
// Electron Preload 脚本暴露端口
// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('__ZZDIARY_PORT__', {
  get: () => ipcRenderer.invoke('get-backend-port'),
});
```

### 2.3 Spring Boot 后端通信规则

```java
// Controller 层 — 仅做参数校验 + 路由
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

// 规则：Controller 不做业务逻辑，仅做参数校验 + 路由 + HTTP 状态码
// 规则：业务逻辑在 Service 层实现
// 规则：禁止在 Controller 中直接调用 Repository
```

### 2.4 Service 层业务编排

```java
@Service
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final EmotionAnalysisService emotionService;
    private final EncryptionService encryptionService;
    private final AiService aiService;

    // 构造器注入（不可 @Autowired 字段注入）
    public DiaryService(DiaryRepository diaryRepository,
                        EmotionAnalysisService emotionService,
                        EncryptionService encryptionService,
                        AiService aiService) {
        this.diaryRepository = diaryRepository;
        this.emotionService = emotionService;
        this.encryptionService = encryptionService;
        this.aiService = aiService;
    }

    @Transactional
    public EmotionInsight analyze(String rawContent) {
        // 1. 脱敏
        String sanitized = aiService.sanitizePii(rawContent);
        // 2. AI 分析
        EmotionInsight insight = aiService.analyzeEmotion(sanitized);
        // 3. 加密存储
        byte[] encrypted = encryptionService.encrypt(rawContent.getBytes(StandardCharsets.UTF_8));
        // 4. 持久化
        diaryRepository.save(new DiaryEntity(encrypted, insight.emotionTags(), insight.intensity()));
        return insight;
    }
}
```

### 2.5 AI 模型选择规则

```java
@Service
public class AiService {

    private final RestClient restClient;
    private final DeepSeekClient deepSeekClient;
    private final OllamaClient ollamaClient;

    public EmotionInsight analyzeEmotion(String content) {
        // 1. 优先检测 Ollama 本地是否可用
        if (ollamaClient.isAvailable()) {
            return ollamaClient.analyze(content);
        }
        // 2. 回退到 DeepSeek API
        if (deepSeekClient.isAvailable()) {
            return deepSeekClient.analyze(content);
        }
        // 3. 无网络且无本地模型 → 抛业务异常
        throw new AiUnavailableException("请连接网络或启动 Ollama 本地模型");
    }
}
```

---

## 3. 业务逻辑解耦原则

### 3.1 模块内聚

```
features/diary/         ← 日记书写相关全部代码
features/emotion/       ← 情绪分析相关全部代码
features/family/        ← 原生家庭相关全部代码
features/mindfulness/   ← 正念练习相关全部代码

每个 feature 目录自包含：
  ├── Component.tsx      # 视图
  ├── SubComponent.tsx   # 子组件（仅本 feature 使用）
  ├── feature.store.ts   # 状态
  └── types.ts           # 本 feature 类型定义
```

### 3.2 模块间通信

```
跨模块通信只能通过以下方式：
  1. lib/api.ts        — 通过 Spring Boot 后端通信
  2. types/shared.ts   — 共享类型定义
  3. 回调函数 props    — 父组件向子模块传递

严禁：
  ✗ 模块 A 直接 import 模块 B 的 Component
  ✗ 模块 A 直接读/写模块 B 的 Store
  ✗ 模块间通过全局变量通信
```

### 3.3 状态隔离

```typescript
// ✓ 正确：每个 feature 独立 store
// features/diary/diary.store.ts
export const useDiaryStore = create<DiaryStore>(...);

// features/emotion/emotion.store.ts
export const useEmotionStore = create<EmotionStore>(...);

// 跨模块数据流：
// Feature A → POST /api/xxx → Spring Boot Service → 返回数据 → Feature B
// 不直接通过 store 共享
```

### 3.4 后端模块解耦

```java
// ✓ 正确：Service 间通过接口依赖，不直接依赖实现
@Service
public class DiaryService {
    private final DiaryRepository diaryRepository;  // 接口依赖
    private final AiService aiService;               // 接口依赖
    ...
}

// ✗ 错误：Service 直接操作数据库连接
// ✗ 错误：Controller 直接调用 Repository
// ✗ 错误：跨模块 Service 循环依赖（A → B → A）
```

---

## 4. 项目目录规范（完整）

```
zzDiary/
├── src/                          # React 前端源码
│   ├── main.tsx                  # 入口
│   ├── App.tsx                   # 根组件 + 路由
│   ├── features/                 # 业务功能模块
│   │   ├── diary/                # 日记书写
│   │   │   ├── Editor.tsx
│   │   │   ├── GuidedChat.tsx
│   │   │   ├── diary.store.ts
│   │   │   └── types.ts
│   │   ├── emotion/              # 情绪分析
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   ├── emotion.store.ts
│   │   │   └── types.ts
│   │   ├── family/               # 原生家庭
│   │   │   ├── BackgroundForm.tsx
│   │   │   ├── InsightPanel.tsx
│   │   │   ├── family.store.ts
│   │   │   └── types.ts
│   │   └── mindfulness/          # 正念练习
│   │       ├── ExercisePlayer.tsx
│   │       ├── GratitudeTemplate.tsx
│   │       ├── mindfulness.store.ts
│   │       └── types.ts
│   ├── components/               # 通用 UI 组件
│   │   └── ui/                   # 原子组件
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx
│   │       └── Card.tsx
│   ├── hooks/                    # 通用 Hooks
│   │   ├── useApi.ts             # API 调用 hook
│   │   └── useDebounce.ts
│   ├── lib/                      # 工具函数
│   │   ├── api.ts                # REST API 客户端封装
│   │   └── constants/            # 常量
│   │       ├── emotions.ts
│   │       └── ui.ts
│   └── types/                    # 跨模块共享类型
│       └── shared.ts
├── zzdiary-server/               # Java Spring Boot 后端
│   ├── build.gradle.kts          # Gradle Kotlin DSL 构建
│   ├── settings.gradle.kts
│   └── src/
│       └── main/
│           ├── java/com/zzdiary/
│           │   ├── ZzDiaryApplication.java    # Spring Boot 入口
│           │   ├── controller/                # REST 控制层
│           │   │   ├── DiaryController.java
│           │   │   ├── EmotionController.java
│           │   │   ├── FamilyController.java
│           │   │   ├── MindfulnessController.java
│           │   │   └── SearchController.java
│           │   ├── service/                   # 业务逻辑层
│           │   │   ├── DiaryService.java
│           │   │   ├── EmotionAnalysisService.java
│           │   │   ├── FamilyInsightService.java
│           │   │   └── MindfulnessService.java
│           │   ├── repository/                # 数据访问层
│           │   │   ├── DiaryRepository.java
│           │   │   ├── EmotionRepository.java
│           │   │   ├── FamilyRepository.java
│           │   │   └── VectorRepository.java
│           │   ├── model/                     # 领域模型
│           │   │   ├── entity/                # 数据库实体
│           │   │   │   ├── DiaryEntity.java
│           │   │   │   ├── EmotionEntity.java
│           │   │   │   └── FamilyEntity.java
│           │   │   └── dto/                   # 传输对象 (record)
│           │   │       ├── AnalyzeRequest.java
│           │   │       ├── EmotionInsight.java
│           │   │       └── SearchResult.java
│           │   └── infrastructure/            # 基础设施
│           │       ├── encryption/
│           │       │   ├── EncryptionService.java
│           │       │   └── KeyDerivationService.java
│           │       ├── vector/
│           │       │   └── JVectorService.java
│           │       └── ai/
│           │           ├── AiService.java     # 统一 AI 入口
│           │           ├── DeepSeekClient.java
│           │           └── OllamaClient.java
│           └── resources/
│               ├── application.yml
│               └── db/migration/             # SQL 迁移脚本
├── electron/                     # Electron 主进程
│   ├── main.ts                   # 主进程入口
│   ├── preload.ts                # 预加载脚本
│   └── backend.ts                # Spring Boot 进程管理
├── memory-bank/                  # 项目文档（AI 上下文）
│   ├── architecture.md           # 系统架构
│   ├── database-schema.md        # 数据库表结构
│   └── api-endpoints.md          # REST API 清单
├── CLAUDE.md                     # Claude Code 全局规则
├── Agents.md                     # 本文件
├── tech-stack.md                 # 技术栈规范
├── zzDiary-design-document.md    # 产品设计文档
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── pnpm-lock.yaml
```

---

## 5. 通用编码最佳实践

### 5.1 文件大小限制

```
TypeScript / TSX：≤ 250 行
Java：≤ 300 行（per .java file，含 import）
CSS：Tailwind 原子类，无独立 CSS 文件
YAML 配置：≤ 50 行
```

### 5.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| React 组件 | PascalCase | `DiaryEditor` |
| TS 函数/方法 | camelCase | `analyzeEntry` |
| TS 变量 | camelCase | `currentEntry` |
| TS 常量 | UPPER_SNAKE | `MAX_DIARY_LENGTH` |
| TS 类型/接口 | PascalCase | `EmotionInsight` |
| TS 文件名(组件) | PascalCase | `Editor.tsx` |
| TS 文件名(工具) | camelCase | `useApi.ts` |
| Java 类 | PascalCase | `DiaryController` |
| Java 方法/变量 | camelCase | `analyzeEntry` |
| Java 常量 | UPPER_SNAKE | `MAX_CONTENT_LENGTH` |
| Java 包名 | 全小写 | `com.zzdiary.controller` |
| Java DTO | `record` 后缀 | `AnalyzeRequest`, `EmotionInsight` |

### 5.3 TypeScript 编码准则

```typescript
// DO：解构 props
function EmotionTag({ type, intensity }: { type: string; intensity: number }) { ... }

// DON'T：使用 any
// DO：使用 unknown + 类型守卫
function parseData(raw: unknown): DiaryEntry {
  if (!isDiaryEntry(raw)) throw new Error('Invalid shape');
  return raw;
}

// DO：async/await 而非 .then()
const insight = await analyzeDiary(content);

// DO：类型导入用 type 关键字
import type { EmotionInsight } from '../types/shared';

// DO：Zustand selector 精确订阅
const entries = useDiaryStore((s) => s.entries); // 仅订阅 entries

// DON'T：全量订阅
const store = useDiaryStore(); // 触发不必要的重渲染
```

### 5.4 Java 编码准则

```java
// DO：使用 record 定义 DTO（不可变，自动生成构造器/getter/equals/hashCode）
public record AnalyzeRequest(@NotBlank String content) {}
public record EmotionInsight(
    List<String> emotionTags,
    int intensity,
    List<String> cognitiveBiases,
    String suggestion
) {}

// DO：构造器注入（不可 @Autowired 字段注入）
@Service
public class DiaryService {
    private final DiaryRepository diaryRepository;
    private final AiService aiService;

    public DiaryService(DiaryRepository diaryRepository, AiService aiService) {
        this.diaryRepository = diaryRepository;
        this.aiService = aiService;
    }
}

// DO：使用 try-with-resources 管理资源
try (var conn = dataSource.getConnection()) {
    ...
}

// DO：使用 Optional 处理可能为空的返回值
public Optional<DiaryEntity> findById(long id) {
    ...
}

// DON'T：返回 null，用 Optional 替代
// DON'T：捕获 Exception 后吞掉异常
// DO：记录日志后重新抛出业务异常
catch (SQLException e) {
    log.error("Database error", e);
    throw new DiaryException("保存日记失败", e);
}

// DON'T：在循环中拼接字符串，用 StringBuilder
// DON'T：使用 System.out.println，用 SLF4J
@Slf4j
public class DiaryService {
    public void process(DiaryEntity entry) {
        log.info("Processing entry: {}", entry.id());
    }
}
```

### 5.5 Spring Boot 分层准则

```java
// Controller：只做参数校验 + HTTP 响应构建
@RestController
@RequestMapping("/api/emotion")
public class EmotionController {

    private final EmotionAnalysisService emotionService;

    public EmotionController(EmotionAnalysisService emotionService) {
        this.emotionService = emotionService;
    }

    @GetMapping("/trend")
    public ResponseEntity<List<TrendPoint>> getTrend(
            @RequestParam @DateTimeFormat(iso = ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(emotionService.getTrend(from, to));
    }
}

// Service：核心业务逻辑，事务边界
@Service
@Transactional
public class EmotionAnalysisService {
    ...
}

// Repository：纯数据访问，无业务逻辑
@Repository
public class EmotionRepository {
    private final JdbcTemplate jdbc;

    public EmotionRepository(DataSource dataSource) {
        this.jdbc = new JdbcTemplate(dataSource);
    }

    public List<EmotionEntity> findByDateRange(LocalDate from, LocalDate to) {
        return jdbc.query(
            "SELECT * FROM emotion_insights WHERE date BETWEEN ? AND ?",
            new BeanPropertyRowMapper<>(EmotionEntity.class), from, to
        );
    }
}
```

### 5.6 React 组件准则

```typescript
// DO：单一职责组件
export default function DiaryEditor({ onSave }: { onSave: (content: string) => void }) {
  const [content, setContent] = useState('');
  return <textarea value={content} onChange={(e) => setContent(e.target.value)} />;
}

// DON'T：多职责巨型组件
function DiaryPage() {
  // editor logic (50 lines)
  // emotion analysis logic (50 lines)
  // family insight logic (50 lines)
  // chart rendering (50 lines)
  // Total: 200+ lines, 4 responsibilities → 必须拆分
}

// DO：提取自定义 Hook
function useDiarySave() {
  const addEntry = useDiaryStore((s) => s.addEntry);
  return useCallback(async (content: string) => {
    const insight = await analyzeDiary(content);
    addEntry({ content, ...insight });
  }, [addEntry]);
}
```

### 5.7 错误处理准则

**前端：**
```typescript
// lib/api.ts — 统一错误处理
export async function analyzeDiary(content: string): Promise<EmotionInsight | null> {
  try {
    return await request<EmotionInsight>('/api/diary/analyze', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  } catch (e) {
    console.error('Analysis failed:', e);
    return null; // 静默降级，允许用户继续书写
  }
}
```

**后端：**
```java
// 全局异常处理
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AiUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleAiUnavailable(AiUnavailableException e) {
        return ResponseEntity.status(503).body(new ErrorResponse("AI_SERVICE_UNAVAILABLE", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception e) {
        log.error("Unexpected error", e);
        return ResponseEntity.status(500).body(new ErrorResponse("INTERNAL_ERROR", "服务内部异常"));
    }
}

public record ErrorResponse(String code, String message) {}
```

### 5.8 依赖导入规范

**TypeScript 导入顺序（自动排序）：**
```
1. 外部依赖 (react, zustand, recharts...)
2. 内部模块 (@/features/..., @/lib/...)
3. 相对路径 (./types, ../ui/Button)
4. 类型导入 (import type ...)
```

**组件内导入规则：**
```
✗ 禁止 features/diary 导入 features/emotion/Component.tsx
✓ 允许 features/diary 导入 components/ui/Button.tsx
✓ 允许 features/diary 导入 lib/api.ts
✓ 允许 features/diary 导入 types/shared.ts
```

**Java 导入规则：**
```
✗ 禁止 Controller 直接导入 Repository
✗ 禁止 Service 层出现 @RequestBody / HttpServletRequest 等 Web 类型
✓ 允许 Service 导入 Repository
✓ 允许 Service 导入 infrastructure 组件
```

---

## 6. 增量开发流程（AI 必须遵循）

```
接收到编码任务时，按以下流程执行：

第 1 步 ─ 读取上下文
  ├─ 若存在 memory-bank/，读取全部 .md 文件
  ├─ 确认当前任务归属的 feature 模块（前端）或分层（后端）
  └─ 确认是否需要新增文件

第 2 步 ─ 规划变更
  ├─ 新建文件：确认目录位置符合本规范
  ├─ 修改文件：确认修改后不超过行数限制
  ├─ 新增依赖：对照 tech-stack.md 确认允许
  └─ 跨模块影响：确认不违反模块隔离规则

第 3 步 ─ 编码
  ├─ 遵循本文件所有编码规范
  ├─ 所有函数显式标注返回类型（TS）/ 方法签名清晰（Java）
  ├─ 不在 UI 组件中写业务逻辑
  └─ 不在 Controller 中写业务逻辑

第 4 步 ─ 自检
  ├─ 文件行数 ≤ 250 (TS) / ≤ 300 (Java)？
  ├─ 无 any 类型？
  ├─ 无 @Autowired 字段注入？
  ├─ 未使用 Lombok？
  ├─ Controller 无业务逻辑？
  ├─ 无跨 feature 直接引用？
  ├─ 前端未直接 fetch 外部 API？
  └─ 命名符合规范？

第 5 步 ─ 更新文档
  └─ 若属于 Always 4 触发条件，主动更新 memory-bank/
```

---

## 7. 禁止模式清单

| 模式 | 说明 | 替代方案 |
|------|------|----------|
| `any` 类型 (TS) | 破坏类型安全 | `unknown` + 类型守卫 |
| `@Autowired` 字段注入 | 不可测试，隐藏依赖 | 构造器注入 |
| Lombok | 遮蔽类型，循环引用风险 | Java `record` |
| `System.out.println` | 不可控输出 | SLF4J `log.info/error` |
| 抛异常后吞掉 | 丢失错误上下文 | 记录日志 + 业务异常 |
| 返回 null (Java) | NPE 风险 | `Optional<T>` |
| 巨人文件 | 超 250/300 行难维护 | 按职责拆分 |
| 全局 Store | 状态混杂 | 按 feature 拆分 store |
| 跨 feature 引用 | 模块耦合 | API 通信 / 共享类型 |
| 前端 fetch 外部 | 安全风险 | Spring Boot 后端中转 |
| Controller 写业务逻辑 | 分层混乱 | Service 层 |
| 硬编码字符串 | 散落难维护 | 常量类 / constants/ |
| 组件内业务逻辑 | 视图臃肿 | 提取到 hook/store |
