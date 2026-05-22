# zzDiary 数据库表结构

> SQLite 表设计。敏感字段应用层 AES-256-GCM 加密存储（BLOB），非敏感字段明文存储（支持 SQL 查询）。
> 每表不超过 12 字段，created_at / updated_at 必带。

---

## 表清单

| 表名 | 说明 | 加密字段 |
|------|------|----------|
| ai_settings | AI 引擎配置 | deepseek_api_key |
| diary_entries | 日记条目 | content（日记正文） |
| emotion_insights | 情绪分析结果 | possible_root_cause |
| family_background | 原生家庭背景 | childhood_summary, significant_events |
| cognitive_biases | 认知偏差记录 | 无 |
| mindfulness_exercises | 正念练习记录 | 无 |

---

## diary_entries

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK AUTOINCREMENT | 主键 |
| content | BLOB | NOT NULL | 加密的日记正文 |
| mode | TEXT | NOT NULL | "guided" / "free" |
| emotion_tags | TEXT | | JSON 数组，如 ["焦虑","愤怒"] |
| emotion_intensity | INTEGER | 1-10 | 情绪强度 |
| family_insight_id | INTEGER | FK | 关联 family_background |
| created_at | TEXT | NOT NULL | ISO 8601 时间戳 |
| updated_at | TEXT | NOT NULL | ISO 8601 时间戳 |

---

## emotion_insights

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK AUTOINCREMENT | 主键 |
| entry_id | INTEGER | FK NOT NULL | 关联 diary_entries |
| emotion_type | TEXT | NOT NULL | 情绪类型 |
| intensity | INTEGER | 1-10 | 强度评分 |
| possible_root_cause | BLOB | | 加密的可能根本原因 |
| family_connection | INTEGER | 0/1 | 是否关联原生家庭 |
| mindfulness_suggestion | TEXT | | 正念建议 |
| created_at | TEXT | NOT NULL | ISO 8601 时间戳 |

---

## family_background

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK AUTOINCREMENT | 主键 |
| childhood_summary | BLOB | NOT NULL | 加密的童年概述 |
| parental_relationship | TEXT | | 父母关系描述（非敏感） |
| significant_events | BLOB | | 加密的重大事件 JSON |
| created_at | TEXT | NOT NULL | ISO 8601 时间戳 |
| updated_at | TEXT | NOT NULL | ISO 8601 时间戳 |

---

## 设计原则

- 敏感字段（日记正文、家庭背景、根因分析）BLOB 存密文
- 非敏感字段（时间戳、情绪标签）TEXT 存明文，支持 SQL 查询
- 加密算法：AES-256-GCM（JCA 内建），密钥首次启动自动生成并持久化到 ~/.zzdiary/encryption.key
- 每表不超过 12 字段
- 外键约束确保引用完整性

---

## ai_settings

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK AUTOINCREMENT | 主键（仅存一行） |
| mode | TEXT | NOT NULL DEFAULT 'ollama' | "ollama" / "deepseek" |
| deepseek_api_key | TEXT | | 用户 DeepSeek API Key |
| ollama_model | TEXT | DEFAULT 'qwen2.5:7b' | Ollama 模型名 |
| ollama_base_url | TEXT | DEFAULT 'http://localhost:11434' | Ollama 地址 |
