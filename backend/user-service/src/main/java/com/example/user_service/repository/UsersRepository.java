package com.example.user_service.repository;

import com.example.user_service.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {

    /**
     * Find user by email
     */
    Optional<Users> findByEmail(String email);

    /**
     * Find user by username
     */
    Optional<Users> findByUsername(String username);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Check if username exists
     */
    boolean existsByUsername(String username);

    /**
     * Find users by role with pagination
     */
    Page<Users> findByRole(String role, Pageable pageable);

    /**
     * Find active users with pagination
     */
    Page<Users> findByActive(boolean active, Pageable pageable);

    /**
     * Search users by name or email
     */
    @Query("SELECT u FROM Users u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Users> searchUsers(@Param("keyword") String keyword, Pageable pageable);
}
