package com.base.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.base.config.JwtConfig;
import com.base.entity.RefreshTokenEntity;
import com.base.entity.UserEntity;
import com.base.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

	private final RefreshTokenRepository refreshTokenRepository;
	private final JwtConfig jwtConfig;

	public RefreshTokenEntity createRefreshToken(UserEntity user) {
		RefreshTokenEntity refreshToken = new RefreshTokenEntity();
		refreshToken.setUser(user);
		refreshToken.setExpiryDate(LocalDateTime.now().plusSeconds(jwtConfig.getRefreshTokenValidity() / 1000));
		refreshToken.setToken(UUID.randomUUID().toString());

		refreshToken = refreshTokenRepository.save(refreshToken);
		return refreshToken;
	}

	public RefreshTokenEntity verifyRefreshToken(String token) {
		RefreshTokenEntity refreshToken = refreshTokenRepository.findByToken(token)
				.orElseThrow(() -> new RuntimeException("Refresh token not found"));

		if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
			refreshTokenRepository.delete(refreshToken);
			throw new RuntimeException("Refresh token expired");
		}

		return refreshToken;
	}

	@Transactional
	public void deleteByUserId(Long userId) {
		refreshTokenRepository.deleteByUserId(userId);
	}
}
