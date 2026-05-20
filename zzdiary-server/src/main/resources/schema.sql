CREATE TABLE IF NOT EXISTS diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content BLOB NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('guided', 'free')),
    emotion_tags TEXT,
    emotion_intensity INTEGER CHECK (emotion_intensity BETWEEN 1 AND 10),
    family_insight_id INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (family_insight_id) REFERENCES family_background(id)
);

CREATE TABLE IF NOT EXISTS emotion_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    emotion_type TEXT NOT NULL,
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
    possible_root_cause BLOB,
    family_connection INTEGER DEFAULT 0 CHECK (family_connection IN (0, 1)),
    mindfulness_suggestion TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    encryption_salt BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL DEFAULT 'ollama' CHECK (mode IN ('ollama', 'deepseek')),
    deepseek_api_key TEXT,
    ollama_model TEXT DEFAULT 'qwen2.5:7b',
    ollama_base_url TEXT DEFAULT 'http://localhost:11434'
);
