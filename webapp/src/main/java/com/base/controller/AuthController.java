package com.base.controller;

import com.base.dto.LoginRequestDto;
import com.base.entity.RefreshTokenEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.base.config.JwtUtil;
import com.base.dto.LoginResponseDto;
import com.base.dto.RefreshTokenRequestDto;
import com.base.entity.UserEntity;
import com.base.service.RefreshTokenService;
import com.base.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final UserService userService;
	private final RefreshTokenService refreshTokenService;

	@PostMapping("/login")
	public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
		
		
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		System.out.println(encoder.encode("password123"));
		
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
		);

		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
		UserEntity user = userService.findByUsername(userDetails.getUsername());

		String accessToken = jwtUtil.generateAccessToken(user.getUsername(), user.getRole().name());
		String refreshToken = refreshTokenService.createRefreshToken(user).getToken();

		return ResponseEntity.ok(new LoginResponseDto(accessToken, refreshToken, user.getUsername(), user.getRole().name()));
	}

	@PostMapping("/refresh")
	public ResponseEntity<LoginResponseDto> refresh(@Valid @RequestBody RefreshTokenRequestDto request) {
		RefreshTokenEntity refreshToken = refreshTokenService.verifyRefreshToken(request.getRefreshToken());
		UserEntity user = refreshToken.getUser();

		String newAccessToken = jwtUtil.generateAccessToken(user.getUsername(), user.getRole().name());
		String newRefreshToken = refreshTokenService.createRefreshToken(user).getToken();

		// Delete old refresh token
		refreshTokenService.deleteByUserId(user.getId());

		return ResponseEntity.ok(new LoginResponseDto(newAccessToken, newRefreshToken, user.getUsername(), user.getRole().name()));
	}
}
