plugins {
	java
	id("org.springframework.boot") version "3.5.0"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.zzdiary"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(25)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-actuator")
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.xerial:sqlite-jdbc:3.49.1.0")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}

tasks.register<Copy>("copyFrontend") {
	from("../out/renderer")
	into(layout.buildDirectory.dir("resources/main/static"))
	doFirst {
		logger.lifecycle("Copying frontend from ../out/renderer to resources/main/static")
	}
}

tasks.named("processResources") {
	if (tasks.findByName("copyFrontend") != null) {
		dependsOn("copyFrontend")
	}
}
