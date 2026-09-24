package com.base.controller;

import com.base.dto.PageResponseDto;
import com.base.dto.ProductRequestDto;
import com.base.dto.ProductResponseDto;
import com.base.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

	private final ProductService productService;

	@GetMapping
	@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
	public ResponseEntity<PageResponseDto<ProductResponseDto>> list(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(required = false) String q
	) {
		return ResponseEntity.ok(productService.findPage(page, size, q));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
	public ResponseEntity<ProductResponseDto> get(@PathVariable Long id) {
		return ResponseEntity.ok(productService.findById(id));
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ProductResponseDto> create(@Valid @RequestBody ProductRequestDto request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ProductResponseDto> update(
			@PathVariable Long id,
			@Valid @RequestBody ProductRequestDto request
	) {
		return ResponseEntity.ok(productService.update(id, request));
	}

	@PostMapping("/{id}/image")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ProductResponseDto> uploadImage(
			@PathVariable Long id,
			@RequestParam("file") MultipartFile file
	) {
		return ResponseEntity.ok(productService.saveImage(id, file));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		productService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
