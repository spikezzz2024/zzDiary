package com.zzdiary.service;

import com.zzdiary.infrastructure.ai.OllamaClient;
import com.zzdiary.model.entity.DiaryEmbedding;
import com.zzdiary.repository.DiaryEmbeddingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.ByteBuffer;
import java.nio.FloatBuffer;
import java.time.Instant;

@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);
    private static final String EMBEDDING_MODEL = "nomic-embed-text";

    private final OllamaClient ollamaClient;
    private final DiaryEmbeddingRepository embeddingRepository;
    private volatile int knownDimension;

    public EmbeddingService(AiConfigService aiConfigService, DiaryEmbeddingRepository embeddingRepository) {
        this.ollamaClient = aiConfigService.createOllamaClient();
        this.embeddingRepository = embeddingRepository;
    }

    /** Generate embedding for text and persist to DB. Returns the raw float array. */
    public float[] embedAndPersist(Long entryId, String text) {
        float[] vector = generateEmbedding(text);
        byte[] blob = floatsToBlob(vector);
        embeddingRepository.save(entryId, blob, EMBEDDING_MODEL, vector.length);
        return vector;
    }

    /** Generate embedding without persisting (for search queries). */
    public float[] generateEmbedding(String text) {
        float[] embedding = ollamaClient.embed(EMBEDDING_MODEL, text);
        if (knownDimension == 0) {
            knownDimension = embedding.length;
            log.info("Embedding dimension detected: {}", knownDimension);
        } else if (embedding.length != knownDimension) {
            throw new RuntimeException(
                    "嵌入维度不一致: expected " + knownDimension + " but got " + embedding.length);
        }
        return embedding;
    }

    public int getDimension() {
        return knownDimension;
    }

    /** Load all persisted embeddings into memory. */
    public java.util.Map<Long, float[]> loadAll() {
        var map = new java.util.concurrent.ConcurrentHashMap<Long, float[]>();
        for (DiaryEmbedding emb : embeddingRepository.findAll()) {
            try {
                float[] vector = blobToFloats(emb.embedding());
                map.put(emb.entryId(), vector);
                if (knownDimension == 0 && vector.length > 0) {
                    knownDimension = vector.length;
                }
            } catch (Exception e) {
                log.warn("Failed to deserialize embedding for entry {}: {}", emb.entryId(), e.getMessage());
            }
        }
        log.info("Loaded {} embeddings from database", map.size());
        return map;
    }

    public int count() {
        return embeddingRepository.count();
    }

    public void deleteByEntryId(Long entryId) {
        embeddingRepository.deleteByEntryId(entryId);
    }

    public String getModelName() {
        return EMBEDDING_MODEL;
    }

    /** Approximate disk size of the embedding model in MB. */
    public int getModelSizeMB() {
        return 274; // nomic-embed-text ~274 MB
    }

    /** Check whether the embedding model is pulled in Ollama. */
    public boolean isModelAvailable() {
        try {
            return ollamaClient.isModelPulled(EMBEDDING_MODEL);
        } catch (Exception e) {
            return false;
        }
    }

    /** Check whether Ollama is reachable. */
    public boolean isOllamaAvailable() {
        return ollamaClient.isAvailable();
    }

    /** Pull the embedding model from Ollama (blocking). */
    public void pullModel() {
        ollamaClient.pullModel(EMBEDDING_MODEL);
    }

    /** Pack float array into byte array (4 bytes per float, big-endian). */
    private static byte[] floatsToBlob(float[] floats) {
        ByteBuffer buf = ByteBuffer.allocate(floats.length * Float.BYTES);
        buf.asFloatBuffer().put(floats);
        return buf.array();
    }

    /** Unpack byte array back into float array. */
    static float[] blobToFloats(byte[] blob) {
        FloatBuffer fb = ByteBuffer.wrap(blob).asFloatBuffer();
        float[] floats = new float[fb.remaining()];
        fb.get(floats);
        return floats;
    }
}
