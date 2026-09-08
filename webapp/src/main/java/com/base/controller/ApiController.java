package com.base.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

	@GetMapping("/user")
	@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
	public ResponseEntity<Map<String, String>> userEndpoint() {
		Map<String, String> response = new HashMap<>();
		response.put("message", "This is a USER endpoint");
		return ResponseEntity.ok(response);
	}

	@GetMapping("/admin")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Map<String, String>> adminEndpoint() {
		Map<String, String> response = new HashMap<>();
		response.put("message", "This is an ADMIN endpoint");
		return ResponseEntity.ok(response);
	}
}
