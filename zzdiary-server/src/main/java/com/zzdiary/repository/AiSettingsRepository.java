package com.zzdiary.repository;

import com.zzdiary.model.entity.AiSettings;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class AiSettingsRepository {

    private final JdbcTemplate jdbc;

    public AiSettingsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<AiSettings> find() {
        var sql = "SELECT * FROM ai_settings LIMIT 1";
        return jdbc.query(sql, this::mapRow).stream().findFirst();
    }

    public AiSettings save(AiSettings settings) {
        jdbc.update("DELETE FROM ai_settings");
        jdbc.update(
                "INSERT INTO ai_settings (mode, deepseek_api_key, ollama_model, ollama_base_url) VALUES (?, ?, ?, ?)",
                settings.mode(),
                settings.deepseekApiKey(),
                settings.ollamaModel(),
                settings.ollamaBaseUrl()
        );
        return find().orElseThrow();
    }

    private AiSettings mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new AiSettings(
                rs.getLong("id"),
                rs.getString("mode"),
                rs.getString("deepseek_api_key"),
                rs.getString("ollama_model"),
                rs.getString("ollama_base_url")
        );
    }
}
