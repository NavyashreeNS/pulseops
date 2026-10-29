package com.pulseops.controller;

import com.pulseops.dto.AuthRequest;
import com.pulseops.dto.AuthResponse;
import com.pulseops.dto.RegisterRequest;
import com.pulseops.model.sql.User;
import com.pulseops.repository.sql.UserRepository;
import com.pulseops.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAssignableUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream().map(u -> Map.<String, Object>of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail(),
                "role", u.getRole().name(),
                "department", u.getDepartment() != null ? u.getDepartment() : "Engineering"
        )).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
