package com.example.lankaagridirect.Security;

import com.example.lankaagridirect.Models.Admin;
import com.example.lankaagridirect.Repositories.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (adminRepository.countByIsDeletedFalse() == 0) {
                Admin admin = new Admin();
                admin.setName("System Admin");
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setIsDeleted(false);
                admin.setCreatedAt(LocalDateTime.now());
                admin.setModifiedAt(LocalDateTime.now());
                
                adminRepository.save(admin);
                System.out.println("Default admin account created: admin / admin123");
            }
        };
    }
}
