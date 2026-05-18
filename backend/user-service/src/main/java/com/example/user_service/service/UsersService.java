package com.example.user_service.service;

import com.example.user_service.dto.RegisterUserRequest;
import com.example.user_service.dto.UpdateUserRequest;
import com.example.user_service.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public interface UsersService {

    /**
     * Register a new user
     */
    UserResponse registerUser(RegisterUserRequest request);

    /**
     * Get user by ID
     */
    UserResponse getUserById(Long id);

    /**
     * Get user by email
     */
    UserResponse getUserByEmail(String email);

    /**
     * Get all users with pagination
     */
    Page<UserResponse> getAllUsers(Pageable pageable);

    /**
     * Get users by role with pagination
     */
    Page<UserResponse> getUsersByRole(String role, Pageable pageable);

    /**
     * Search users by keyword
     */
    Page<UserResponse> searchUsers(String keyword, Pageable pageable);

    /**
     * Update user
     */
    UserResponse updateUser(Long id, UpdateUserRequest request);

    /**
     * Delete user (soft delete by setting active to false)
     */
    void deleteUser(Long id);

    /**
     * Check if email exists
     */
    boolean emailExists(String email);

    /**
     * Check if username exists
     */
    boolean usernameExists(String username);
}
