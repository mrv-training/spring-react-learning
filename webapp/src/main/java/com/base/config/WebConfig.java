package com.base.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		Path uploadPath = Path.of("uploads").toAbsolutePath().normalize();
		try {
			Files.createDirectories(uploadPath);
		} catch (IOException ignored) {
			// ProductService also creates this directory before writing files.
		}
		String uploadLocation = uploadPath.toUri().toString();
		if (!uploadLocation.endsWith("/")) {
			uploadLocation += "/";
		}
		registry.addResourceHandler("/uploads/**").addResourceLocations(uploadLocation);
	}
}
