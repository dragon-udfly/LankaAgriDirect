package com.example.lankaagridirect.Repositories;

import com.example.lankaagridirect.Models.Producer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProducerRepository extends MongoRepository<Producer, String> {

    Optional<Producer> findByNicAndIsDeletedFalse(String nic);

    Optional<Producer> findByEmailAndIsDeletedFalse(String email);

    // Used for login — can match NIC or email
    @Query("{$or: [{'nic': ?0}, {'email': ?1}], 'isDeleted': false}")
    Optional<Producer> findByNicOrEmailAndNotDeleted(String nic, String email);

    List<Producer> findByVerificationStatusAndIsDeletedFalse(String verificationStatus);

    List<Producer> findByDistrictAndVerificationStatusAndIsDeletedFalse(String district, String verificationStatus);

    List<Producer> findByProvinceAndVerificationStatusAndIsDeletedFalse(String province, String verificationStatus);

    List<Producer> findByVerificationStatusAndDistrictAndIsDeletedFalse(String verificationStatus, String district);

    // Count queries for reports
    long countByVerificationStatusAndIsDeletedFalse(String verificationStatus);

    long countByIsDeletedFalse();

    // Find by business phone for login
    Optional<Producer> findByBusinessPhoneAndIsDeletedFalse(String businessPhone);
}
