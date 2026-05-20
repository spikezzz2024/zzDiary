package com.zzdiary.repository;

import com.zzdiary.model.entity.AppUser;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<AppUser> findByEmail(String email) {
        var sql = "SELECT * FROM app_users WHERE email = ?";
        return jdbc.query(sql, this::mapRow, email).stream().findFirst();
    }

    public Optional<AppUser> findAny() {
        var sql = "SELECT * FROM app_users LIMIT 1";
        return jdbc.query(sql, this::mapRow).stream().findFirst();
    }

    public AppUser save(AppUser user) {
        var sql = "INSERT INTO app_users (email, password_hash, encryption_salt) VALUES (?, ?, ?)";
        jdbc.update(sql, user.email(), user.passwordHash(), user.encryptionSalt());
        return findByEmail(user.email()).orElseThrow();
    }

    private AppUser mapRow(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new AppUser(
                rs.getLong("id"),
                rs.getString("email"),
                rs.getString("password_hash"),
                rs.getBytes("encryption_salt")
        );
    }
}
