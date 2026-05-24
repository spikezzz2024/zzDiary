package com.zzdiary.config;

import com.zzdiary.service.EmbeddingService;
import com.zzdiary.service.VectorIndexManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class DatabaseInitializer {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Bean
    CommandLineRunner initDatabase(DataSource dataSource, EmbeddingService embeddingService,
                                   VectorIndexManager vectorIndexManager) {
        return args -> {
            String userHome = System.getProperty("user.home");
            Path dbDir = Path.of(userHome, ".zzdiary");
            Files.createDirectories(dbDir);

            var populator = new ResourceDatabasePopulator();
            populator.addScript(new ClassPathResource("schema.sql"));
            populator.execute(dataSource);

            try {
                var allVectors = embeddingService.loadAll();
                vectorIndexManager.loadAll(allVectors);
                log.info("Vector index loaded: {} entries", vectorIndexManager.size());
            } catch (Exception e) {
                log.warn("Failed to load vector index on startup: {}", e.getMessage());
            }
        };
    }
}
