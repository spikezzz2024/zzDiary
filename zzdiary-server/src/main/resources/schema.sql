CREATE TABLE IF NOT EXISTS family_background (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    childhood_summary BLOB NOT NULL,
    parental_relationship TEXT NOT NULL,
    significant_events BLOB NOT NULL,
    skill_summary BLOB,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS ai_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL DEFAULT 'ollama' CHECK (mode IN ('ollama', 'deepseek')),
    deepseek_api_key TEXT,
    ollama_model TEXT DEFAULT 'qwen2.5:7b',
    ollama_base_url TEXT DEFAULT 'http://localhost:11434'
);

CREATE TABLE IF NOT EXISTS mindfulness_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('breathing', 'gratitude', 'emotion_awareness')),
    recommendation_text TEXT,
    user_content TEXT,
    duration_seconds INTEGER,
    completed INTEGER DEFAULT 0 CHECK (completed IN (0, 1)),
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
