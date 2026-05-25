package com.zzdiary.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class VectorIndexManagerTest {

    private VectorIndexManager index;

    @BeforeEach
    void setUp() {
        index = new VectorIndexManager();
    }

    @Test
    void emptyIndexReturnsZeroSize() {
        assertThat(index.size()).isZero();
    }

    @Test
    void addIncrementsSize() {
        index.add(1L, new float[]{1.0f, 0.0f});
        assertThat(index.size()).isEqualTo(1);
    }

    @Test
    void searchEmptyIndexReturnsEmpty() {
        List<VectorIndexManager.ScoredResult> results = index.search(new float[]{1.0f, 0.0f}, 5);
        assertThat(results).isEmpty();
    }

    @Test
    void searchSingleVectorReturnsIt() {
        index.add(1L, new float[]{1.0f, 0.0f});
        List<VectorIndexManager.ScoredResult> results = index.search(new float[]{1.0f, 0.0f}, 5);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).entryId()).isEqualTo(1L);
        assertThat(results.get(0).score()).isCloseTo(1.0, Assertions.within(1e-6));
    }

    @Test
    void searchReturnsTopK() {
        // Three entries, but topK=2 returns only 2
        index.add(1L, new float[]{1.0f, 0.0f});
        index.add(2L, new float[]{0.9f, 0.1f});
        index.add(3L, new float[]{0.0f, 1.0f}); // orthogonal to query [1,0]
        List<VectorIndexManager.ScoredResult> results = index.search(new float[]{1.0f, 0.0f}, 2);
        assertThat(results).hasSize(2);
        // sorted descending by score
        assertThat(results.get(0).entryId()).isEqualTo(1L);
        assertThat(results.get(1).entryId()).isEqualTo(2L);
    }

    @Test
    void searchIdenticalVectorScoresOne() {
        float[] v = {0.5f, 0.5f, 0.5f, 0.5f};
        index.add(1L, v);
        List<VectorIndexManager.ScoredResult> results = index.search(v, 3);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).score()).isCloseTo(1.0, Assertions.within(1e-6));
    }

    @Test
    void searchOrthogonalVectorScoresZero() {
        index.add(1L, new float[]{1.0f, 0.0f});
        List<VectorIndexManager.ScoredResult> results = index.search(new float[]{0.0f, 1.0f}, 3);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).score()).isCloseTo(0.0, Assertions.within(1e-6));
    }

    @Test
    void removeRemovesEntry() {
        index.add(1L, new float[]{1.0f, 0.0f});
        index.add(2L, new float[]{0.0f, 1.0f});
        assertThat(index.size()).isEqualTo(2);
        index.remove(1L);
        assertThat(index.size()).isEqualTo(1);
        List<VectorIndexManager.ScoredResult> results = index.search(new float[]{1.0f, 0.0f}, 5);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).entryId()).isEqualTo(2L);
    }

    @Test
    void loadAllReplacesExisting() {
        index.add(1L, new float[]{1.0f, 0.0f});
        Map<Long, float[]> newVectors = Map.of(
                2L, new float[]{0.0f, 1.0f},
                3L, new float[]{1.0f, 1.0f}
        );
        index.loadAll(newVectors);
        assertThat(index.size()).isEqualTo(2);
        // Old entry 1 is gone
        List<VectorIndexManager.ScoredResult> results = index.search(new float[]{1.0f, 0.0f}, 5);
        assertThat(results).hasSize(2);
        assertThat(results.get(0).entryId()).isEqualTo(3L); // [1,1] closer to [1,0] than [0,1]
    }

    @Test
    void scoredResultRecord() {
        VectorIndexManager.ScoredResult r = new VectorIndexManager.ScoredResult(42L, 0.95);
        assertThat(r.entryId()).isEqualTo(42L);
        assertThat(r.score()).isEqualTo(0.95);
    }

    // Assertions helper
    private static class Assertions {
        static org.assertj.core.data.Offset<Double> within(double tolerance) {
            return org.assertj.core.data.Offset.offset(tolerance);
        }
    }
}
