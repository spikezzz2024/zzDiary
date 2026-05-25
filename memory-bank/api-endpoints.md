# zzDiary REST API 清单

> 所有接口以 `/api` 为前缀，Spring Boot 仅监听 127.0.0.1，随机端口。
> 前端通过 `lib/api.ts` 调用，禁止直接 fetch。

---

## 端点总览

| 方法 | 路径 | 说明 | 所属 Controller |
|------|------|------|-----------------|
| POST | `/api/diary/save` | 保存/更新今日日记草稿（同一天覆盖） | DiaryController |
| POST | `/api/diary/analyze` | 保存日记并返回 AI 分析（结果持久化到 emotion_insights） | DiaryController |
| GET | `/api/diary/list` | 获取日记列表（分页） | DiaryController |
| GET | `/api/diary/dates` | 获取有日记的所有日期 | DiaryController |
| GET | `/api/diary/by-date` | 按日期查询日记（?date=YYYY-MM-DD） | DiaryController |
| GET | `/api/diary/{id}` | 获取单篇日记 | DiaryController |
| DELETE | `/api/diary/{id}` | 删除日记 | DiaryController |
| POST | `/api/diary/{id}/analyze` | 对已有日记执行 AI 分析（结果持久化到 emotion_insights） | DiaryController |
| GET | `/api/settings/ai` | 获取 AI 配置 | SettingsController |
| PUT | `/api/settings/ai` | 更新 AI 配置 | SettingsController |
| GET | `/api/settings/ollama/status` | Ollama 连接状态 | SettingsController |
| GET | `/api/emotion/trend` | ✅ 情绪趋势数据 | EmotionController |
| GET | `/api/emotion/distribution` | ✅ 情绪分布统计 | EmotionController |
| GET | `/api/emotion/{entryId}` | ✅ 获取单条情绪分析 | EmotionController |
| POST | `/api/family/background` | 录入/更新家庭背景 | FamilyController |
| GET | `/api/family/background` | 获取家庭背景 | FamilyController |
| GET | `/api/family/insights` | 获取家庭关联分析 | FamilyController |
| POST | `/api/mindfulness/recommend` | ✅ 生成正念推荐 | MindfulnessController |
| POST | `/api/mindfulness/log` | ✅ 记录正念练习完成 | MindfulnessController |
| GET | `/api/mindfulness/progress` | ✅ 获取正念进度统计 | MindfulnessController |
| POST | `/api/search/semantic` | ✅ 语义搜索历史日记（Ollama 嵌入 + 余弦相似度） | SearchController |
| GET | `/api/search/model-status` | ✅ 检查嵌入模型下载状态 | SearchController |
| POST | `/api/search/pull-model` | ✅ 拉取嵌入模型（nomic-embed-text, ~274MB） | SearchController |
| GET | `/api/stats/overview` | ✅ 书写统计概览（总篇数/字数/连续天数） | StatsController |
| GET | `/api/stats/heatmap` | ✅ 日历热力图数据 | StatsController |
| GET | `/api/stats/time-distribution` | ✅ 书写时段分布 | StatsController |
| GET | `/api/export/diaries` | ✅ 导出日记为 Markdown/JSON 文件下载 | ExportController |
| GET | `/actuator/health` | 健康检查 | Actuator |

---

## 详细定义

### POST /api/diary/analyze

```
Request:  { "content": string }
Response: {
  "emotionTags": ["焦虑", "愤怒"],
  "intensity": 7,
  "cognitiveBiases": ["灾难化"],
  "possibleRootCause": "...",
  "familyConnection": true,
  "mindfulnessSuggestion": "..."
}
```

### GET /api/emotion/trend

> 读取 emotion_insights 表中已持久化的 AI 分析结果进行聚合，仅包含已执行 AI 分析的日记。

```
Query:    from=2026-01-01&to=2026-05-19
Response: [{ "date": "2026-01-01", "dominantEmotion": "焦虑", "avgIntensity": 6.5 }]
```

### GET /api/emotion/distribution

> 统计所有已分析日记中各类情绪的出现次数。

```
Response: [{ "emotion": "焦虑", "count": 12 }]
```

### GET /api/emotion/{entryId}

> 获取单篇日记的 AI 分析结果（从 emotion_insights 读取）。

```
Response: { "entryId": 1, "emotionTags": ["焦虑"], "intensity": 6, ... }
```

### POST /api/search/semantic

> 使用 Ollama 嵌入模型 (nomic-embed-text) 将查询文本转为向量，与日记索引进行余弦相似度匹配，返回 Top-20 结果。

```
Request:  { "query": "和妈妈吵架的那次" }
Response: [
  {
    "id": 1,
    "snippet": "今天和妈妈因为工作的事情...",
    "score": 0.92,
    "emotionTags": ["愤怒", "内疚"],
    "createdAt": "2026-05-24T10:30:00Z"
  }
]
```

**前置条件：** 首次使用时会引导下载嵌入模型（nomic-embed-text, ~274MB），仅需下载一次。

**索引时机：** 日记保存时自动生成嵌入并加入索引；应用启动时从 `diary_embeddings` 表加载全部向量到内存。

### GET /api/search/model-status

> 检查嵌入模型是否可用，以及索引状态。

```
Response: {
  "modelName": "nomic-embed-text",
  "modelSizeMB": 274,
  "ollamaAvailable": true,
  "modelPulled": true,
  "indexedCount": 42
}
```

### POST /api/search/pull-model

> 从 Ollama 拉取嵌入模型（阻塞调用，可能耗时数分钟）。

```
Response: { "status": "ok" }  // 或 { "status": "error", "message": "..." }
```

### POST /api/mindfulness/recommend

> AI 根据近期情绪状态生成个性化正念推荐，结果持久化到 mindfulness_exercises 表。

```
Request:  { "exerciseType": null }  // 或 "breathing"|"gratitude"|"emotion_awareness"
Response: { "id": 1, "exerciseType": "breathing", "recommendationText": "...", "createdAt": "..." }
```

### POST /api/mindfulness/log

> 记录用户完成了一次正念练习。

```
Request:  { "exerciseId": 1, "durationSeconds": 120, "userContent": "..." }
Response: { "logged": true }
```

### GET /api/mindfulness/progress

> 获取正念练习进度统计。

```
Response: {
  "totalCompleted": 15,
  "currentStreak": 3,
  "totalDurationSeconds": 1800,
  "breathingCount": 5,
  "gratitudeCount": 7,
  "awarenessCount": 3
}
```

### GET /api/stats/overview

> 返回书写统计概览数据。字数通过服务端解密日记正文后统计非空白字符数得出。

```
Response: {
  "totalEntries": 42,
  "totalChars": 12500,
  "avgCharsPerEntry": 297,
  "activeDays": 30,
  "currentStreak": 5,
  "longestStreak": 12
}
```

### GET /api/stats/heatmap

> 返回每日日记篇数，用于日历热力图。可选 from/to 过滤日期范围。

```
Query:    from=2026-01-01&to=2026-05-25
Response: [{ "date": "2026-01-01", "count": 2 }]
```

### GET /api/stats/time-distribution

> 返回 24 小时各时段日记篇数分布。

```
Response: [{ "hour": 21, "count": 15 }, { "hour": 8, "count": 3 }]
```

---

### GET /api/export/diaries

> 导出日记数据为文件下载。支持 Markdown（含情绪标签/强度/根因/正念建议）和 JSON 两种格式，可选日期范围过滤。

```
Query:    format=markdown|json&from=2026-01-01&to=2026-05-25
Response: 文件下载 (Content-Disposition: attachment; filename="zzdiary-export-2026-05-25.md")
```

Markdown 格式每篇日记为一个二级标题区块，包含日期、情绪标签、强度、正念建议和正文。
JSON 格式为日记对象数组，包含 id、createdAt、content、emotionTags、emotionIntensity、possibleRootCause、mindfulnessSuggestion。

---

## 错误响应格式

```json
{
  "code": "AI_SERVICE_UNAVAILABLE",
  "message": "请连接网络或启动 Ollama 本地模型"
}
```

HTTP 状态码：400 参数错误 / 404 资源不存在 / 500 内部异常 / 503 AI 不可用
