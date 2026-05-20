package com.zzdiary.repository;

import com.zzdiary.model.entity.EmotionInsight;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public class EmotionInsightRepository {

    private final JdbcTemplate jdbc;

    public EmotionInsightRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public EmotionInsight save(EmotionInsight insight) {
        var now = Instant.now();
        var sql = """
                INSERT INTO emotion_insights (entry_id, emotion_type, intensity, possible_root_cause, family_connection, mindfulness_suggestion, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;
        jdbc.update(sql,
                insight.entryId(),
                insight.emotionType(),
                insight.intensity(),
                insight.possibleRootCause(),
                insight.familyConnection(),
                insight.mindfulnessSuggestion(),
                now.toString()
        );
        return insight;
    }

    public Optional<EmotionInsight> findByEntryId(Long entryId) {
        var sql = "SELECT * FROM emotion_insights WHERE entry_id = ?";
        return jdbc.query(sql, this::mapRow, entryId).stream().findFirst();
    }

    private EmotionInsight mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new EmotionInsight(
                rs.getLong("id"),
                rs.getLong("entry_id"),
                rs.getString("emotion_type"),
                (Integer) rs.getObject("intensity"),
                rs.getBytes("possible_root_cause"),
                (Integer) rs.getObject("family_connection"),
                rs.getString("mindfulness_suggestion"),
                Instant.parse(rs.getString("created_at"))
        );
    }
}
