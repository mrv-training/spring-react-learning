package com.base.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
public class UploadController {

	@GetMapping("/uploads/{filename:.+}")
	public ResponseEntity<Resource> getImage(@PathVariable String filename) {
		if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filename");
		}

		Path file = Path.of("uploads").toAbsolutePath().normalize().resolve(filename);
		if (!Files.isRegularFile(file)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
		}

		String probed;
		try {
			probed = Files.probeContentType(file);
		} catch (IOException ex) {
			probed = null;
		}
		MediaType contentType = probed != null
				? MediaType.parseMediaType(probed)
				: MediaType.APPLICATION_OCTET_STREAM;

		return ResponseEntity.ok()
				.contentType(contentType)
				.header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
				.body(new FileSystemResource(file));
	}
}
