package com.zzdiary.infrastructure.encryption;

import org.springframework.stereotype.Component;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.security.spec.KeySpec;

@Component
public class KeyManager {

    private static final int PBKDF2_ITERATIONS = 600_000;
    private static final int KEY_LENGTH = 256;
    private static final int SALT_LENGTH = 32;

    private volatile SecretKeySpec keySpec;

    public boolean isUnlocked() {
        return keySpec != null;
    }

    public SecretKeySpec getKey() {
        if (keySpec == null) {
            throw new IllegalStateException("应用未解锁，请先登录");
        }
        return keySpec;
    }

    public byte[] generateSalt() {
        byte[] salt = new byte[SALT_LENGTH];
        new SecureRandom().nextBytes(salt);
        return salt;
    }

    public void unlock(String password, byte[] salt) {
        try {
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, PBKDF2_ITERATIONS, KEY_LENGTH);
            var factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] keyBytes = factory.generateSecret(spec).getEncoded();
            this.keySpec = new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new RuntimeException("密钥初始化失败", e);
        }
    }

    public void lock() {
        this.keySpec = null;
    }
}
