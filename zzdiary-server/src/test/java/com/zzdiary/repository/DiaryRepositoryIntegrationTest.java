package com.zzdiary.repository;

import com.zzdiary.model.entity.DiaryEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Transactional
class DiaryRepositoryIntegrationTest {

    @Autowired
    private DiaryRepository repository;

    private byte[] testContent() {
        return "test diary content".getBytes(StandardCharsets.UTF_8);
    }

    private DiaryEntry createEntry(String mode) {
        return new DiaryEntry(null, testContent(), mode, null, null, null, Instant.now(), Instant.now());
    }

    @Test
    void saveAndFindById() {
        DiaryEntry saved = repository.save(createEntry("free"));
        assertThat(saved.id()).isNotNull();

        DiaryEntry found = repository.findById(saved.id()).orElseThrow();
        assertThat(found.mode()).isEqualTo("free");
        assertThat(found.content()).isEqualTo(testContent());
    }

    @Test
    void findByIdNotFoundReturnsEmpty() {
        assertThat(repository.findById(99999L)).isEmpty();
    }

    @Test
    void findAllWithPagination() {
        repository.save(createEntry("free"));
        repository.save(createEntry("free"));
        repository.save(createEntry("guided"));

        List<DiaryEntry> page1 = repository.findAll(2, 0);
        assertThat(page1).hasSize(2);

        List<DiaryEntry> page2 = repository.findAll(2, 2);
        assertThat(page2).hasSize(1);
    }

    @Test
    void findByDate() {
        repository.save(createEntry("free"));
        String today = LocalDate.now().toString();
        List<DiaryEntry> results = repository.findByDate(today);
        assertThat(results).isNotEmpty();
    }

    @Test
    void findDistinctDates() {
        repository.save(createEntry("free"));
        List<String> dates = repository.findDistinctDates();
        assertThat(dates).isNotEmpty();
    }

    @Test
    void deleteByIdRemovesEntry() {
        DiaryEntry saved = repository.save(createEntry("free"));
        int deleted = repository.deleteById(saved.id());
        assertThat(deleted).isEqualTo(1);
        assertThat(repository.findById(saved.id())).isEmpty();
    }

    @Test
    void deleteByIdReturnsZeroForNonExisting() {
        assertThat(repository.deleteById(99999L)).isZero();
    }

    @Test
    void updateContent() {
        DiaryEntry saved = repository.save(createEntry("free"));
        byte[] newContent = "updated content".getBytes(StandardCharsets.UTF_8);
        int updated = repository.updateContent(saved.id(), newContent);
        assertThat(updated).isEqualTo(1);

        DiaryEntry found = repository.findById(saved.id()).orElseThrow();
        assertThat(found.content()).isEqualTo(newContent);
    }

    @Test
    void updateEmotion() {
        DiaryEntry saved = repository.save(createEntry("free"));
        int updated = repository.updateEmotion(saved.id(), "[\"anxiety\"]", 7);
        assertThat(updated).isEqualTo(1);

        DiaryEntry found = repository.findById(saved.id()).orElseThrow();
        assertThat(found.emotionTags()).isEqualTo("[\"anxiety\"]");
        assertThat(found.emotionIntensity()).isEqualTo(7);
    }

    @Test
    void findTodayEntry() {
        repository.save(createEntry("free"));
        String today = LocalDate.now().toString();
        DiaryEntry found = repository.findTodayEntry(today).orElseThrow();
        assertThat(found.mode()).isEqualTo("free");
    }

    @Test
    void findAllEntries() {
        repository.save(createEntry("free"));
        repository.save(createEntry("guided"));
        List<DiaryEntry> all = repository.findAllEntries();
        assertThat(all).hasSize(2);
        // Ascending order by created_at
        assertThat(all.get(0).createdAt()).isBeforeOrEqualTo(all.get(1).createdAt());
    }
}
