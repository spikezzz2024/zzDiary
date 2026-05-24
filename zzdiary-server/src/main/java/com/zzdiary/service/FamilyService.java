package com.zzdiary.service;

import com.zzdiary.infrastructure.encryption.EncryptionService;
import com.zzdiary.model.dto.FamilyBackgroundRequest;
import com.zzdiary.model.dto.FamilyBackgroundResponse;
import com.zzdiary.model.entity.FamilyBackground;
import com.zzdiary.repository.FamilyBackgroundRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Service
public class FamilyService {

    private static final String DISTILL_SYSTEM_PROMPT = """
            你是一位家庭治疗背景的心理咨询师。请根据用户提供的原生家庭信息，\
            提炼出一段约200字的"家庭影响洞察"，用于后续日记分析中理解用户的情绪反应模式。

            请重点分析：
            1. 家庭沟通模式如何影响用户的人际关系
            2. 童年经历可能形成的依恋风格倾向
            3. 可能反复出现的情绪主题

            请直接返回分析文本，不要使用 JSON 格式，不要包含其他说明文字。""";

    private final FamilyBackgroundRepository repository;
    private final EncryptionService encryptionService;
    private final AiService aiService;

    public FamilyService(FamilyBackgroundRepository repository,
                         EncryptionService encryptionService,
                         AiService aiService) {
        this.repository = repository;
        this.encryptionService = encryptionService;
        this.aiService = aiService;
    }

    /** Get the decrypted family background, or null if never saved. */
    public FamilyBackgroundResponse getBackground() {
        return repository.find()
                .map(bg -> new FamilyBackgroundResponse(
                        bg.id(),
                        new String(encryptionService.decrypt(bg.childhoodSummary()), StandardCharsets.UTF_8),
                        bg.parentalRelationship(),
                        new String(encryptionService.decrypt(bg.significantEvents()), StandardCharsets.UTF_8),
                        bg.skillSummary() != null
                                ? new String(encryptionService.decrypt(bg.skillSummary()), StandardCharsets.UTF_8)
                                : null,
                        bg.createdAt().toString(),
                        bg.updatedAt().toString()))
                .orElse(null);
    }

    /** Save or overwrite the family background. Resets any previously distilled skill. */
    @Transactional
    public FamilyBackgroundResponse saveBackground(FamilyBackgroundRequest request) {
        byte[] encryptedChildhood = encryptionService.encrypt(
                request.childhoodSummary().getBytes(StandardCharsets.UTF_8));
        byte[] encryptedEvents = encryptionService.encrypt(
                request.significantEvents().getBytes(StandardCharsets.UTF_8));

        FamilyBackground saved = repository.save(new FamilyBackground(
                null, encryptedChildhood,
                request.parentalRelationship() != null ? request.parentalRelationship() : "",
                encryptedEvents, null, null, null));

        return new FamilyBackgroundResponse(
                saved.id(),
                request.childhoodSummary(),
                request.parentalRelationship() != null ? request.parentalRelationship() : "",
                request.significantEvents(),
                null,
                saved.createdAt().toString(),
                saved.updatedAt().toString());
    }

    /** Use AI to distill the family background into a concise skill summary. */
    @Transactional
    public String distillSkill() {
        FamilyBackground bg = repository.find()
                .orElseThrow(() -> new RuntimeException("请先填写家庭背景信息"));

        String childhoodSummary = new String(encryptionService.decrypt(bg.childhoodSummary()), StandardCharsets.UTF_8);
        String significantEvents = new String(encryptionService.decrypt(bg.significantEvents()), StandardCharsets.UTF_8);

        String userPrompt = String.format("""
                童年总结：%s
                父母关系：%s
                重要事件：%s""", childhoodSummary, bg.parentalRelationship(), significantEvents);

        String skillText = aiService.distillFamilySkill(DISTILL_SYSTEM_PROMPT, userPrompt);

        byte[] encryptedSkill = encryptionService.encrypt(skillText.getBytes(StandardCharsets.UTF_8));
        repository.updateSkillSummary(bg.id(), encryptedSkill);

        return skillText;
    }

    /** Get the decrypted skill summary for injection into diary analysis. Null if none. */
    public String getSkillForAnalysis() {
        return repository.find()
                .filter(bg -> bg.skillSummary() != null && bg.skillSummary().length > 0)
                .map(bg -> new String(encryptionService.decrypt(bg.skillSummary()), StandardCharsets.UTF_8))
                .orElse(null);
    }

    /** Get the family background record id, for linking diary entries. Null if none. */
    public Long getFamilyBackgroundId() {
        return repository.find().map(FamilyBackground::id).orElse(null);
    }
}
