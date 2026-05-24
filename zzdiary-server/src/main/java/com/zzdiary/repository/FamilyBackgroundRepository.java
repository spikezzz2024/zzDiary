package com.zzdiary.repository;

import com.zzdiary.model.entity.FamilyBackground;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Statement;
import java.time.Instant;
import java.util.Optional;

@Repository
public class FamilyBackgroundRepository {

    private final JdbcTemplate jdbc;

    public FamilyBackgroundRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Returns the single family background row, or empty if never saved. */
    public Optional<FamilyBackground> find() {
        var sql = "SELECT * FROM family_background LIMIT 1";
        return jdbc.query(sql, this::mapRow).stream().findFirst();
    }

    /** Upsert: delete all existing rows, then insert. Single-row table. */
    public FamilyBackground save(FamilyBackground bg) {
        jdbc.update("DELETE FROM family_background");
        var now = Instant.now();
        var keyHolder = new org.springframework.jdbc.support.GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement(
                    "INSERT INTO family_background (childhood_summary, parental_relationship, significant_events, skill_summary, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setBytes(1, bg.childhoodSummary());
            ps.setString(2, bg.parentalRelationship());
            ps.setBytes(3, bg.significantEvents());
            if (bg.skillSummary() != null) {
                ps.setBytes(4, bg.skillSummary());
            } else {
                ps.setNull(4, java.sql.Types.BLOB);
            }
            ps.setString(5, now.toString());
            ps.setString(6, now.toString());
            return ps;
        }, keyHolder);
        var id = keyHolder.getKey().longValue();
        return new FamilyBackground(id, bg.childhoodSummary(), bg.parentalRelationship(),
                bg.significantEvents(), bg.skillSummary(), now, now);
    }

    /** Update only the skill_summary column after AI distillation. */
    public void updateSkillSummary(Long id, byte[] encryptedSkill) {
        var now = Instant.now();
        jdbc.update(
                "UPDATE family_background SET skill_summary = ?, updated_at = ? WHERE id = ?",
                encryptedSkill, now.toString(), id);
    }

    private FamilyBackground mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new FamilyBackground(
                rs.getLong("id"),
                rs.getBytes("childhood_summary"),
                rs.getString("parental_relationship"),
                rs.getBytes("significant_events"),
                (byte[]) rs.getObject("skill_summary"),
                Instant.parse(rs.getString("created_at")),
                Instant.parse(rs.getString("updated_at"))
        );
    }
}
