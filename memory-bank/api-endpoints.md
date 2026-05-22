# zzDiary REST API 清单

> 所有接口以 `/api` 为前缀，Spring Boot 仅监听 127.0.0.1，随机端口。
> 前端通过 `lib/api.ts` 调用，禁止直接 fetch。

---

## 端点总览

| 方法 | 路径 | 说明 | 所属 Controller |
|------|------|------|-----------------|
| POST | `/api/diary/analyze` | AI 分析日记内容 | DiaryController |
| GET | `/api/diary/list` | 获取日记列表（分页） | DiaryController |
| GET | `/api/diary/{id}` | 获取单篇日记 | DiaryController |
| DELETE | `/api/diary/{id}` | 删除日记 | DiaryController |
| GET | `/api/settings/ai` | 获取 AI 配置 | SettingsController |
| PUT | `/api/settings/ai` | 更新 AI 配置 | SettingsController |
| GET | `/api/settings/ollama/status` | Ollama 连接状态 | SettingsController |
| GET | `/api/emotion/trend` | 情绪趋势数据 | EmotionController |
| GET | `/api/emotion/distribution` | 情绪分布统计 | EmotionController |
| GET | `/api/emotion/{entryId}` | 获取单条情绪分析 | EmotionController |
| POST | `/api/family/background` | 录入/更新家庭背景 | FamilyController |
| GET | `/api/family/background` | 获取家庭背景 | FamilyController |
| GET | `/api/family/insights` | 获取家庭关联分析 | FamilyController |
| GET | `/api/mindfulness/recommend` | 获取正念推荐 | MindfulnessController |
| POST | `/api/search/semantic` | 语义搜索历史日记 | SearchController |
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

```
Query:    from=2026-01-01&to=2026-05-19
Response: [{ "date": "2026-01-01", "dominantEmotion": "焦虑", "avgIntensity": 6.5 }]
```

### POST /api/search/semantic

```
Request:  { "query": "和妈妈吵架的那次" }
Response: [{ "id": 1, "content": "...", "emotionTags": [...], "score": 0.92 }]
```

---

## 错误响应格式

```json
{
  "code": "AI_SERVICE_UNAVAILABLE",
  "message": "请连接网络或启动 Ollama 本地模型"
}
```

HTTP 状态码：400 参数错误 / 404 资源不存在 / 500 内部异常 / 503 AI 不可用
