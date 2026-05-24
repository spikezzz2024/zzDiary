package com.zzdiary.repository;

import com.zzdiary.model.entity.DiaryEntry;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class DiaryRepository {

    private final JdbcTemplate jdbc;

    public DiaryRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public DiaryEntry save(DiaryEntry entry) {
        var now = Instant.now();
        var sql = """
                INSERT INTO diary_entries (content, mode, emotion_tags, emotion_intensity, family_insight_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;
        var keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setBytes(1, entry.content());
            ps.setString(2, entry.mode());
            ps.setString(3, entry.emotionTags());
            ps.setObject(4, entry.emotionIntensity());
            ps.setObject(5, entry.familyInsightId());
            ps.setString(6, now.toString());
            ps.setString(7, now.toString());
            return ps;
        }, keyHolder);

        var generatedId = keyHolder.getKey().longValue();
        return new DiaryEntry(generatedId, entry.content(), entry.mode(), entry.emotionTags(),
                entry.emotionIntensity(), entry.familyInsightId(), now, now);
    }

    public Optional<DiaryEntry> findById(Long id) {
        var sql = "SELECT * FROM diary_entries WHERE id = ?";
        return jdbc.query(sql, this::mapRow, id).stream().findFirst();
    }

    public List<DiaryEntry> findAll(int limit, int offset) {
        var sql = "SELECT * FROM diary_entries ORDER BY created_at DESC LIMIT ? OFFSET ?";
        return jdbc.query(sql, this::mapRow, limit, offset);
    }

    public int deleteById(Long id) {
        return jdbc.update("DELETE FROM diary_entries WHERE id = ?", id);
    }

    public List<DiaryEntry> findByDate(String date) {
        var sql = "SELECT * FROM diary_entries WHERE date(created_at) = ? ORDER BY created_at DESC";
        return jdbc.query(sql, this::mapRow, date);
    }

    public List<String> findDistinctDates() {
        var sql = "SELECT DISTINCT date(created_at) AS entry_date FROM diary_entries ORDER BY entry_date DESC";
        return jdbc.query(sql, (rs, _rowNum) -> rs.getString("entry_date"));
    }

    public List<DiaryEntry> findByDateRange(String from, String to) {
        var sql = "SELECT * FROM diary_entries WHERE date(created_at) >= ? AND date(created_at) <= ? ORDER BY created_at ASC";
        return jdbc.query(sql, this::mapRow, from, to);
    }

    /** Get all entries ordered by date, for aggregation queries. */
    public List<DiaryEntry> findAllEntries() {
        var sql = "SELECT * FROM diary_entries ORDER BY created_at ASC";
        return jdbc.query(sql, this::mapRow);
    }

    public Optional<DiaryEntry> findTodayEntry(String today) {
        var sql = "SELECT * FROM diary_entries WHERE date(created_at) = ? LIMIT 1";
        return jdbc.query(sql, this::mapRow, today).stream().findFirst();
    }

    public int updateContent(Long id, byte[] encryptedContent) {
        var now = Instant.now();
        return jdbc.update(
                "UPDATE diary_entries SET content = ?, updated_at = ? WHERE id = ?",
                encryptedContent, now.toString(), id);
    }

    /** Persist AI analysis result metadata on the diary entry. */
    public int updateEmotion(Long id, String emotionTags, int intensity) {
        var now = Instant.now();
        return jdbc.update(
                "UPDATE diary_entries SET emotion_tags = ?, emotion_intensity = ?, updated_at = ? WHERE id = ?",
                emotionTags, intensity, now.toString(), id);
    }

    /** Link a diary entry to the family background record. */
    public int updateFamilyInsightId(Long id, Long familyInsightId) {
        var now = Instant.now();
        return jdbc.update(
                "UPDATE diary_entries SET family_insight_id = ?, updated_at = ? WHERE id = ?",
                familyInsightId, now.toString(), id);
    }

    private DiaryEntry mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new DiaryEntry(
                rs.getLong("id"),
                rs.getBytes("content"),
                rs.getString("mode"),
                rs.getString("emotion_tags"),
                (Integer) rs.getObject("emotion_intensity"),
                (Long) rs.getObject("family_insight_id"),
                Instant.parse(rs.getString("created_at")),
                Instant.parse(rs.getString("updated_at"))
        );
    }
}
