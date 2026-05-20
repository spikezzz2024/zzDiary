package com.zzdiary.infrastructure.encryption;

import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import java.security.SecureRandom;

@Component
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private final KeyManager keyManager;
    private final SecureRandom secureRandom = new SecureRandom();

    public EncryptionService(KeyManager keyManager) {
        this.keyManager = keyManager;
    }

    public byte[] encrypt(byte[] plaintext) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);
            var cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keyManager.getKey(), new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] encrypted = cipher.doFinal(plaintext);
            byte[] result = new byte[GCM_IV_LENGTH + encrypted.length];
            System.arraycopy(iv, 0, result, 0, GCM_IV_LENGTH);
            System.arraycopy(encrypted, 0, result, GCM_IV_LENGTH, encrypted.length);
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public byte[] decrypt(byte[] ciphertext) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] encrypted = new byte[ciphertext.length - GCM_IV_LENGTH];
            System.arraycopy(ciphertext, 0, iv, 0, GCM_IV_LENGTH);
            System.arraycopy(ciphertext, GCM_IV_LENGTH, encrypted, 0, encrypted.length);
            var cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keyManager.getKey(), new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            return cipher.doFinal(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    public String encryptString(String plaintext) {
        return java.util.Base64.getEncoder().encodeToString(
                encrypt(plaintext.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    }

    public String decryptString(String base64Ciphertext) {
        return new String(
                decrypt(java.util.Base64.getDecoder().decode(base64Ciphertext)),
                java.nio.charset.StandardCharsets.UTF_8);
    }
}
