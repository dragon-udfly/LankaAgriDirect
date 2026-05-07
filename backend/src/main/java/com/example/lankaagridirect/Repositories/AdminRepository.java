package com.example.lankaagridirect.Repositories;

import com.example.lankaagridirect.Models.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends MongoRepository<Admin, String> {

    Optional<Admin> findByUsernameAndIsDeletedFalse(String username);

    Optional<Admin> findByIdAndIsDeletedFalse(String id);

    boolean existsByUsername(String username);

    long countByIsDeletedFalse();
}
