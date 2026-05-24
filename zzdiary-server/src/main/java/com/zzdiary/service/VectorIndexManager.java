package com.zzdiary.service;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/** In-memory vector index using exact cosine similarity search.
 *  Designed to be swappable with JVector for approximate search at scale. */
@Component
public class VectorIndexManager {

    private final Map<Long, float[]> vectors = new ConcurrentHashMap<>();

    public void add(Long entryId, float[] vector) {
        vectors.put(entryId, vector);
    }

    public void remove(Long entryId) {
        vectors.remove(entryId);
    }

    public void loadAll(Map<Long, float[]> loaded) {
        vectors.clear();
        vectors.putAll(loaded);
    }

    /** Search for top-K nearest neighbors by cosine similarity. */
    public List<ScoredResult> search(float[] query, int topK) {
        if (vectors.isEmpty()) {
            return List.of();
        }

        var pq = new PriorityQueue<ScoredResult>(Comparator.comparingDouble(r -> r.score));

        for (var entry : vectors.entrySet()) {
            double similarity = cosineSimilarity(query, entry.getValue());
            if (pq.size() < topK) {
                pq.offer(new ScoredResult(entry.getKey(), similarity));
            } else if (similarity > pq.peek().score()) {
                pq.poll();
                pq.offer(new ScoredResult(entry.getKey(), similarity));
            }
        }

        var results = new ArrayList<ScoredResult>(pq);
        results.sort((a, b) -> Double.compare(b.score(), a.score()));
        return results;
    }

    public int size() {
        return vectors.size();
    }

    private double cosineSimilarity(float[] a, float[] b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot += (double) a[i] * b[i];
            normA += (double) a[i] * a[i];
            normB += (double) b[i] * b[i];
        }
        double denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom > 0 ? dot / denom : 0;
    }

    public record ScoredResult(Long entryId, double score) {}
}
