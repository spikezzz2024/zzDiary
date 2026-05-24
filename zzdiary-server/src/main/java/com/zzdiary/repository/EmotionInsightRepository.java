package com.zzdiary.repository;

import com.zzdiary.model.entity.EmotionInsight;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Statement;
import java.time.Instant;
import java.util.List;

@Repository
public class EmotionInsightRepository {

    private final JdbcTemplate jdbc;

    public EmotionInsightRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public EmotionInsight save(EmotionInsight insight) {
        var now = insight.createdAt() != null ? insight.createdAt() : Instant.now();
        var sql = """
                INSERT INTO emotion_insights (entry_id, emotion_type, intensity, possible_root_cause, family_connection, mindfulness_suggestion, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;
        var keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, insight.entryId());
            ps.setString(2, insight.emotionType());
            ps.setObject(3, insight.intensity());
            ps.setBytes(4, insight.possibleRootCause());
            ps.setObject(5, insight.familyConnection());
            ps.setString(6, insight.mindfulnessSuggestion());
            ps.setString(7, now.toString());
            return ps;
        }, keyHolder);
        var generatedId = keyHolder.getKey().longValue();
        return new EmotionInsight(generatedId, insight.entryId(), insight.emotionType(),
                insight.intensity(), insight.possibleRootCause(), insight.familyConnection(),
                insight.mindfulnessSuggestion(), now);
    }

    public int deleteByEntryId(Long entryId) {
        return jdbc.update("DELETE FROM emotion_insights WHERE entry_id = ?", entryId);
    }

    /** Fetch all emotion insights for a batch of entry IDs. */
    public List<EmotionInsight> findAllByEntryIds(List<Long> entryIds) {
        if (entryIds.isEmpty()) {
            return List.of();
        }
        String placeholders = String.join(",", entryIds.stream().map(id -> "?").toList());
        var sql = "SELECT * FROM emotion_insights WHERE entry_id IN (" + placeholders + ")";
        return jdbc.query(sql, this::mapRow, entryIds.toArray());
    }

    /** All emotion insights for distribution aggregation. */
    public List<EmotionInsight> findAll() {
        var sql = "SELECT * FROM emotion_insights";
        return jdbc.query(sql, this::mapRow);
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
