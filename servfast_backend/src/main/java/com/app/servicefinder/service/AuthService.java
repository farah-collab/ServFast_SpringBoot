package com.app.servicefinder.service;

import com.app.servicefinder.dto.auth.*;
import com.app.servicefinder.dto.user.UserResponseDTO;
import com.app.servicefinder.model.PasswordResetToken;
import com.app.servicefinder.model.User;
import com.app.servicefinder.repository.PasswordResetTokenRepository;
import com.app.servicefinder.repository.UserRepository;
import com.app.servicefinder.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JavaMailSender mailSender;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ─── REGISTER ─────────────────────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }
        User user = userRepository.save(User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .city(request.getCity())
                .role(request.getRole() != null ? request.getRole() : User.Role.CLIENT)
                .build());
        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        return AuthResponse.builder()
                .token(token)
                .user(toUserResponseDTO(user))
                .build();
    }

    // ─── LOGIN ────────────────────────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        return AuthResponse.builder()
                .token(token)
                .user(toUserResponseDTO(user))
                .build();
    }

    private UserResponseDTO toUserResponseDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profilePhoto(user.getProfilePhoto())
                .bio(user.getBio())
                .city(user.getCity())
                .role(user.getRole() != null ? user.getRole().name() : User.Role.CLIENT.name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email).orElse(null);

        // Always silently succeed — never reveal if the email exists
        if (user == null) return;

        // Generate a secure token and save it
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(1)); // expires in 1 hour
        passwordResetTokenRepository.save(resetToken);

        // Send the email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("ServFast — Reset your password");
        message.setText(
            "Hello " + user.getFullName() + ",\n\n" +
            "You requested a password reset. Click the link below:\n\n" +
            frontendUrl + "/reset-password?token=" + token + "\n\n" +
            "This link expires in 1 hour.\n\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "— The ServFast Team"
        );
        mailSender.send(message);
    }

    // ─── RESET PASSWORD ───────────────────────────────────────────────────────
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete token after use so it can't be reused
        passwordResetTokenRepository.delete(resetToken);
    }
}