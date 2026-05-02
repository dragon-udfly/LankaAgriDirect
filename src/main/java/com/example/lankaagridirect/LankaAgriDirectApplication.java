package com.example.lankaagridirect;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LankaAgriDirectApplication {

    private static final Logger logger = LoggerFactory.getLogger(LankaAgriDirectApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(LankaAgriDirectApplication.class, args);
        logger.info("LankaAgriDirectApplication started successfully!");
    }

}
