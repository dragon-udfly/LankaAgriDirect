package com.example.lankaagridirect.Security;

import com.example.lankaagridirect.Models.Admin;
import com.example.lankaagridirect.Repositories.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Ensures the default admin account exists on startup.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            Admin admin = adminRepository.findByUsernameAndIsDeletedFalse("admin").orElse(null);
            
            if (admin == null) {
                if (!adminRepository.existsByUsername("admin")) {
                    admin = new Admin();
                    admin.setName("System Admin");
                    admin.setUsername("admin");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setIsDeleted(false);
                    admin.setCreatedAt(LocalDateTime.now());
                    admin.setModifiedAt(LocalDateTime.now());
                    adminRepository.save(admin);
                    System.out.println(">>> SEEDER: Default admin document created. Username: admin / Password: admin123");
                } else {
                    System.out.println(">>> SEEDER: Admin document exists but is marked as deleted. Skipping.");
                }
            } else {
                // Always sync password to ensure it works, even if seeded poorly by init-mongo.js
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setModifiedAt(LocalDateTime.now());
                adminRepository.save(admin);
                System.out.println(">>> SEEDER: Admin document password synchronized to 'admin123'.");
            }
        } catch (Exception e) {
            System.err.println(">>> SEEDER ERROR: Could not seed admin user. MongoDB might not be ready. " + e.getMessage());
        }
    }
}
