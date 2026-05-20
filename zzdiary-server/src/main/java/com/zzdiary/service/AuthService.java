package com.zzdiary.service;

import com.zzdiary.infrastructure.encryption.KeyManager;
import com.zzdiary.model.dto.SetupRequest;
import com.zzdiary.model.dto.UnlockRequest;
import com.zzdiary.model.entity.AppUser;
import com.zzdiary.repository.UserRepository;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.HexFormat;
import java.util.Map;

@Service
public class AuthService {

    private static final int HASH_ITERATIONS = 100_000;
    private static final int HASH_LENGTH = 256;
    private static final int HASH_SALT_LENGTH = 32;

    private final UserRepository userRepository;
    private final KeyManager keyManager;

    public AuthService(UserRepository userRepository, KeyManager keyManager) {
        this.userRepository = userRepository;
        this.keyManager = keyManager;
    }

    public record StatusResponse(boolean initialized, boolean unlocked, String email) {}

    public StatusResponse status() {
        var user = userRepository.findAny();
        return new StatusResponse(
                user.isPresent(),
                keyManager.isUnlocked(),
                user.map(AppUser::email).orElse(null)
        );
    }

    public Map<String, Object> setup(SetupRequest request) {
        if (userRepository.findAny().isPresent()) {
            throw new RuntimeException("已有用户，请直接解锁");
        }

        // Salt for encryption key (separate from password hash salt)
        byte[] encryptionSalt = keyManager.generateSalt();

        // Password hash with its own salt for verification
        byte[] hashSalt = new byte[HASH_SALT_LENGTH];
        new SecureRandom().nextBytes(hashSalt);
        String passwordHash = hashPassword(request.password(), hashSalt);

        userRepository.save(new AppUser(null, request.email(), passwordHash, encryptionSalt));

        keyManager.unlock(request.password(), encryptionSalt);

        return Map.of("email", request.email(), "message", "账户创建成功，已解锁");
    }

    public Map<String, Object> unlock(UnlockRequest request) {
        AppUser user = userRepository.findAny()
                .orElseThrow(() -> new RuntimeException("未找到用户，请先创建账户"));

        String expectedHash = user.passwordHash();

        if (!verifyPassword(request.password(), expectedHash)) {
            throw new RuntimeException("密码错误");
        }

        keyManager.unlock(request.password(), user.encryptionSalt());

        return Map.of("email", user.email(), "message", "已解锁");
    }

    public void lock() {
        keyManager.lock();
    }

    private String hashPassword(String password, byte[] salt) {
        try {
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, HASH_ITERATIONS, HASH_LENGTH);
            var factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return HexFormat.of().formatHex(salt) + ":" + HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("密码哈希失败", e);
        }
    }

    private boolean verifyPassword(String password, String stored) {
        String[] parts = stored.split(":");
        if (parts.length != 2) return false;
        byte[] salt = HexFormat.of().parseHex(parts[0]);
        byte[] hash = HexFormat.of().parseHex(parts[1]);

        try {
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, HASH_ITERATIONS, HASH_LENGTH);
            var factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] testHash = factory.generateSecret(spec).getEncoded();
            return java.util.Arrays.equals(hash, testHash);
        } catch (Exception e) {
            return false;
        }
    }
}
