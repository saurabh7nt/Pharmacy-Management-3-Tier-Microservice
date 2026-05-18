package com.example.user_service.serviceImpl;

import com.example.common.exception.ResourceNotFoundException;
import com.example.user_service.dto.RegisterUserRequest;
import com.example.user_service.dto.UpdateUserRequest;
import com.example.user_service.dto.UserResponse;
import com.example.user_service.entity.Users;
import com.example.user_service.exception.DuplicateResourceException;
import com.example.user_service.repository.UsersRepository;
import com.example.user_service.service.UsersService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UsersServiceImpl implements UsersService {

    private final UsersRepository usersRepository;

    public UsersServiceImpl(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    @Override
    public UserResponse registerUser(RegisterUserRequest request) {
        // Check if email already exists
        if (usersRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        // Check if username already exists
        if (usersRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already exists: " + request.getUsername());
        }

        // Create new user entity
        Users user = new Users();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(encryptPassword(request.getPassword())); // Simple encryption for now
        user.setRole(request.getRole());
        user.setActive(true);

        // Save user
        Users savedUser = usersRepository.save(user);

        return UserResponse.fromEntity(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserResponse.fromEntity(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return UserResponse.fromEntity(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return usersRepository.findAll(pageable)
                .map(UserResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsersByRole(String role, Pageable pageable) {
        // Validate role
        if (!role.equals("ADMIN") && !role.equals("USER")) {
            throw new IllegalArgumentException("Invalid role. Must be ADMIN or USER");
        }
        return usersRepository.findByRole(role, pageable)
                .map(UserResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllUsers(pageable);
        }
        return usersRepository.searchUsers(keyword.trim(), pageable)
                .map(UserResponse::fromEntity);
    }

    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        Users existingUser = usersRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Update fields only if provided
        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            existingUser.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            existingUser.setLastName(request.getLastName());
        }

        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            // Check if new username is different and not taken
            if (!existingUser.getUsername().equals(request.getUsername())) {
                if (usersRepository.existsByUsername(request.getUsername())) {
                    throw new DuplicateResourceException("Username already exists: " + request.getUsername());
                }
                existingUser.setUsername(request.getUsername());
            }
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            // Check if new email is different and not taken
            if (!existingUser.getEmail().equals(request.getEmail())) {
                if (usersRepository.existsByEmail(request.getEmail())) {
                    throw new DuplicateResourceException("Email already exists: " + request.getEmail());
                }
                existingUser.setEmail(request.getEmail());
            }
        }

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            existingUser.setRole(request.getRole());
        }

        if (request.getActive() != null) {
            existingUser.setActive(request.getActive());
        }

        Users updatedUser = usersRepository.save(existingUser);
        return UserResponse.fromEntity(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        Users existingUser = usersRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Soft delete - set active to false
        existingUser.setActive(false);
        usersRepository.save(existingUser);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return usersRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean usernameExists(String username) {
        return usersRepository.existsByUsername(username);
    }

    /**
     * Simple password encryption (in production, use BCrypt or similar)
     */
    private String encryptPassword(String password) {
        // For now, just prefix with "encrypted_"
        // In production, use BCryptPasswordEncoder or similar
        return "encrypted_" + password;
    }
}


