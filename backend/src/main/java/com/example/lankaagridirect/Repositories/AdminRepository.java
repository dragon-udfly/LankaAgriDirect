package com.example.lankaagridirect.Repositories;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.lankaagridirect.Models.Admin;

@Repository
public interface AdminRepository extends MongoRepository<Admin, String> {

    Optional<Admin> findByUsernameAndIsDeletedFalse(String username);

    Optional<Admin> findByIdAndIsDeletedFalse(String id);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, String id);

    long countByIsDeletedFalse();
}
