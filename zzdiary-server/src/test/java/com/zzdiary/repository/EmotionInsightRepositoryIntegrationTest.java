package com.zzdiary.repository;

import com.zzdiary.model.entity.DiaryEntry;
import com.zzdiary.model.entity.EmotionInsight;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Transactional
class EmotionInsightRepositoryIntegrationTest {

    @Autowired
    private EmotionInsightRepository repository;

    @Autowired
    private DiaryRepository diaryRepository;

    private Long entryId;

    @BeforeEach
    void setUp() {
        DiaryEntry entry = diaryRepository.save(new DiaryEntry(
                null, "content".getBytes(StandardCharsets.UTF_8),
                "free", null, null, null, Instant.now(), Instant.now()));
        entryId = entry.id();
    }

    private EmotionInsight createInsight(Long entryId, String emotionType) {
        return new EmotionInsight(null, entryId, emotionType, 5,
                "root cause".getBytes(StandardCharsets.UTF_8), 0,
                "breathe deeply", Instant.now());
    }

    @Test
    void saveAndRetrieve() {
        EmotionInsight saved = repository.save(createInsight(entryId, "anxiety"));
        assertThat(saved.id()).isNotNull();
        assertThat(saved.emotionType()).isEqualTo("anxiety");
        assertThat(saved.intensity()).isEqualTo(5);
    }

    @Test
    void findAll() {
        repository.save(createInsight(entryId, "anxiety"));
        repository.save(createInsight(entryId, "joy"));
        List<EmotionInsight> all = repository.findAll();
        assertThat(all).hasSize(2);
    }

    @Test
    void findAllByEntryIds() {
        repository.save(createInsight(entryId, "anxiety"));

        // Create a second diary entry with its own insight
        DiaryEntry entry2 = diaryRepository.save(new DiaryEntry(
                null, "other".getBytes(StandardCharsets.UTF_8),
                "free", null, null, null, Instant.now(), Instant.now()));
        repository.save(createInsight(entry2.id(), "joy"));

        List<EmotionInsight> results = repository.findAllByEntryIds(List.of(entryId));
        assertThat(results).hasSize(1);
        assertThat(results.get(0).emotionType()).isEqualTo("anxiety");
    }

    @Test
    void findAllByEntryIdsEmpty() {
        List<EmotionInsight> results = repository.findAllByEntryIds(List.of());
        assertThat(results).isEmpty();
    }

    @Test
    void deleteByEntryId() {
        repository.save(createInsight(entryId, "anxiety"));
        int deleted = repository.deleteByEntryId(entryId);
        assertThat(deleted).isEqualTo(1);
        assertThat(repository.findAllByEntryIds(List.of(entryId))).isEmpty();
    }

    @Test
    void deleteByEntryIdReturnsZeroForNonExisting() {
        assertThat(repository.deleteByEntryId(99999L)).isZero();
    }
}
