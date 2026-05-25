package com.zzdiary.infrastructure.encryption;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import javax.crypto.KeyGenerator;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EncryptionServiceTest {

    @Mock
    private KeyManager keyManager;

    private EncryptionService encryptionService;

    @BeforeEach
    void setUp() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(256, new SecureRandom());
        byte[] keyBytes = keyGen.generateKey().getEncoded();
        when(keyManager.getKey()).thenReturn(new SecretKeySpec(keyBytes, "AES"));
        encryptionService = new EncryptionService(keyManager);
    }

    @Test
    void encryptDecryptRoundTrip() {
        byte[] plaintext = "Hello, zzDiary!".getBytes(StandardCharsets.UTF_8);
        byte[] encrypted = encryptionService.encrypt(plaintext);
        byte[] decrypted = encryptionService.decrypt(encrypted);
        assertThat(decrypted).isEqualTo(plaintext);
    }

    @Test
    void encryptProducesDifferentOutputForSameInput() {
        byte[] plaintext = "test".getBytes(StandardCharsets.UTF_8);
        byte[] c1 = encryptionService.encrypt(plaintext);
        byte[] c2 = encryptionService.encrypt(plaintext);
        assertThat(c1).isNotEqualTo(c2); // random IV
    }

    @Test
    void encryptStringDecryptStringRoundTrip() {
        String plaintext = "今天心情不错";
        String encrypted = encryptionService.encryptString(plaintext);
        String decrypted = encryptionService.decryptString(encrypted);
        assertThat(decrypted).isEqualTo(plaintext);
    }

    @Test
    void decryptTamperedDataThrows() {
        byte[] plaintext = "sensitive data".getBytes(StandardCharsets.UTF_8);
        byte[] encrypted = encryptionService.encrypt(plaintext);
        encrypted[encrypted.length - 1] ^= 0xFF; // flip bits
        assertThatThrownBy(() -> encryptionService.decrypt(encrypted))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Decryption failed");
    }

    @Test
    void decryptTooShortThrows() {
        byte[] tooShort = new byte[5];
        assertThatThrownBy(() -> encryptionService.decrypt(tooShort))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Decryption failed");
    }

    @Test
    void encryptEmptyByteArray() {
        byte[] plaintext = new byte[0];
        byte[] encrypted = encryptionService.encrypt(plaintext);
        byte[] decrypted = encryptionService.decrypt(encrypted);
        assertThat(decrypted).isEmpty();
    }

    @Test
    void encryptStringHandlesUnicode() {
        String plaintext = "emoji测试🎉日本語도 포함";
        String encrypted = encryptionService.encryptString(plaintext);
        String decrypted = encryptionService.decryptString(encrypted);
        assertThat(decrypted).isEqualTo(plaintext);
    }
}
