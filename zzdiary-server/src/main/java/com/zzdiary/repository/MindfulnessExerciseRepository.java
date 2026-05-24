package com.zzdiary.repository;

import com.zzdiary.model.entity.MindfulnessExercise;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Statement;
import java.time.Instant;
import java.util.List;

@Repository
public class MindfulnessExerciseRepository {

    private final JdbcTemplate jdbc;

    public MindfulnessExerciseRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Insert a new exercise recommendation. */
    public MindfulnessExercise save(MindfulnessExercise exercise) {
        var now = exercise.createdAt() != null ? exercise.createdAt() : Instant.now();
        var sql = """
                INSERT INTO mindfulness_exercises (exercise_type, recommendation_text, user_content, duration_seconds, completed, completed_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;
        var keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, exercise.exerciseType());
            ps.setString(2, exercise.recommendationText());
            ps.setString(3, exercise.userContent());
            ps.setObject(4, exercise.durationSeconds());
            ps.setObject(5, exercise.completed());
            ps.setString(6, exercise.completedAt());
            ps.setString(7, now.toString());
            ps.setString(8, now.toString());
            return ps;
        }, keyHolder);
        var generatedId = keyHolder.getKey().longValue();
        return new MindfulnessExercise(generatedId, exercise.exerciseType(),
                exercise.recommendationText(), exercise.userContent(),
                exercise.durationSeconds(), exercise.completed(),
                exercise.completedAt(), now, now);
    }

    /** Fetch all exercises ordered by created_at descending. */
    public List<MindfulnessExercise> findAll(int limit) {
        var sql = "SELECT * FROM mindfulness_exercises ORDER BY created_at DESC LIMIT ?";
        return jdbc.query(sql, this::mapRow, limit);
    }

    /** Fetch completed exercises in a date range for progress aggregation. */
    public List<MindfulnessExercise> findCompletedBetween(String from, String to) {
        var sql = "SELECT * FROM mindfulness_exercises WHERE completed = 1 AND completed_at >= ? AND completed_at <= ? ORDER BY completed_at ASC";
        return jdbc.query(sql, this::mapRow, from, to);
    }

    /** Mark an exercise as completed. */
    public int updateCompleted(Long id, String userContent, int durationSeconds, String completedAt, String updatedAt) {
        var sql = """
                UPDATE mindfulness_exercises
                SET completed = 1, user_content = ?, duration_seconds = ?, completed_at = ?, updated_at = ?
                WHERE id = ?
                """;
        return jdbc.update(sql, userContent, durationSeconds, completedAt, updatedAt, id);
    }

    /** Total number of completed exercises. */
    public int countCompleted() {
        var sql = "SELECT COUNT(*) FROM mindfulness_exercises WHERE completed = 1";
        var result = jdbc.queryForObject(sql, Integer.class);
        return result != null ? result : 0;
    }

    private MindfulnessExercise mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new MindfulnessExercise(
                rs.getLong("id"),
                rs.getString("exercise_type"),
                rs.getString("recommendation_text"),
                rs.getString("user_content"),
                (Integer) rs.getObject("duration_seconds"),
                (Integer) rs.getObject("completed"),
                rs.getString("completed_at"),
                Instant.parse(rs.getString("created_at")),
                Instant.parse(rs.getString("updated_at"))
        );
    }
}
