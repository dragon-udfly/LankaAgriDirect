package com.example.lankaagridirect.Repositories;

import com.example.lankaagridirect.Models.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    // Custom query methods can go here if needed
}
