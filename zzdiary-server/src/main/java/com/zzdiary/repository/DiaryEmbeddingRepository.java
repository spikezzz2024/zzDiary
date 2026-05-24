package com.zzdiary.repository;

import com.zzdiary.model.entity.DiaryEmbedding;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class DiaryEmbeddingRepository {

    private final JdbcTemplate jdbc;

    public DiaryEmbeddingRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void save(Long entryId, byte[] embedding, String model, int dimension) {
        String now = Instant.now().toString();
        jdbc.update(conn -> {
            var ps = conn.prepareStatement(
                    "INSERT INTO diary_embeddings (entry_id, embedding, model, dimension, created_at) VALUES (?, ?, ?, ?, ?) " +
                    "ON CONFLICT(entry_id) DO UPDATE SET embedding = excluded.embedding, model = excluded.model, dimension = excluded.dimension, created_at = excluded.created_at");
            ps.setLong(1, entryId);
            ps.setBytes(2, embedding);
            ps.setString(3, model);
            ps.setInt(4, dimension);
            ps.setString(5, now);
            return ps;
        });
    }

    public Optional<DiaryEmbedding> findByEntryId(Long entryId) {
        return jdbc.query(
                "SELECT id, entry_id, embedding, model, dimension, created_at FROM diary_embeddings WHERE entry_id = ?",
                (rs, rowNum) -> new DiaryEmbedding(
                        rs.getLong("id"),
                        rs.getLong("entry_id"),
                        rs.getBytes("embedding"),
                        rs.getString("model"),
                        rs.getInt("dimension"),
                        rs.getString("created_at")
                ),
                entryId
        ).stream().findFirst();
    }

    public List<DiaryEmbedding> findAll() {
        return jdbc.query(
                "SELECT id, entry_id, embedding, model, dimension, created_at FROM diary_embeddings",
                (rs, rowNum) -> new DiaryEmbedding(
                        rs.getLong("id"),
                        rs.getLong("entry_id"),
                        rs.getBytes("embedding"),
                        rs.getString("model"),
                        rs.getInt("dimension"),
                        rs.getString("created_at")
                )
        );
    }

    public int deleteByEntryId(Long entryId) {
        return jdbc.update("DELETE FROM diary_embeddings WHERE entry_id = ?", entryId);
    }

    public int count() {
        var result = jdbc.queryForObject("SELECT COUNT(*) FROM diary_embeddings", Integer.class);
        return result != null ? result : 0;
    }
}
