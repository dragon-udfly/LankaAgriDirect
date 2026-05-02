package com.example.lankaagridirect;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LankaAgriDirectApplication {

    private static final Logger logger = LoggerFactory.getLogger(LankaAgriDirectApplication.class);

    @Value("${app.system.name}")
    private String systemName;

    public static void main(String[] args) {
        SpringApplication.run(LankaAgriDirectApplication.class, args);
    }

    @PostConstruct
    public void logStatus() {
        logger.info("{} started successfully!", systemName);
    }
}