package com.zzdiary.infrastructure.encryption;

import org.springframework.stereotype.Component;

import javax.crypto.KeyGenerator;
import javax.crypto.spec.SecretKeySpec;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;

@Component
public class KeyManager {

    private static final String ALGORITHM = "AES";
    private static final int KEY_SIZE = 256;

    private volatile SecretKeySpec keySpec;

    public SecretKeySpec getKey() {
        if (keySpec == null) {
            synchronized (this) {
                if (keySpec == null) {
                    keySpec = loadOrGenerateKey();
                }
            }
        }
        return keySpec;
    }

    private SecretKeySpec loadOrGenerateKey() {
        try {
            Path keyFile = getKeyPath();
            if (Files.exists(keyFile)) {
                byte[] keyBytes = Files.readAllBytes(keyFile);
                return new SecretKeySpec(keyBytes, ALGORITHM);
            }
            KeyGenerator keyGen = KeyGenerator.getInstance(ALGORITHM);
            keyGen.init(KEY_SIZE, new SecureRandom());
            byte[] keyBytes = keyGen.generateKey().getEncoded();
            Files.createDirectories(keyFile.getParent());
            Files.write(keyFile, keyBytes);
            return new SecretKeySpec(keyBytes, ALGORITHM);
        } catch (Exception e) {
            throw new RuntimeException("密钥初始化失败", e);
        }
    }

    private static Path getKeyPath() {
        String userHome = System.getProperty("user.home");
        return Path.of(userHome, ".zzdiary", "encryption.key");
    }
}
