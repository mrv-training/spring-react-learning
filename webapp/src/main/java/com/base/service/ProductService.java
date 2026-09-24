package com.base.service;

import com.base.dto.PageResponseDto;
import com.base.dto.ProductRequestDto;
import com.base.dto.ProductResponseDto;
import com.base.entity.CategoryEntity;
import com.base.entity.ProductEntity;
import com.base.repository.CategoryRepository;
import com.base.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

	private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp"
	);

	private final ProductRepository productRepository;
	private final CategoryRepository categoryRepository;

	public PageResponseDto<ProductResponseDto> findPage(int page, int size, String query) {
		int safePage = Math.max(page, 0);
		int safeSize = size < 1 ? 5 : Math.min(size, 50);
		Page<ProductEntity> result = productRepository.search(
				query == null ? "" : query.trim(),
				PageRequest.of(safePage, safeSize, Sort.by("id").ascending())
		);
		return new PageResponseDto<>(
				result.getContent().stream().map(this::toResponse).toList(),
				result.getNumber(),
				result.getSize(),
				result.getTotalElements(),
				result.getTotalPages()
		);
	}

	public ProductResponseDto findById(Long id) {
		return toResponse(getProduct(id));
	}

	public ProductResponseDto create(ProductRequestDto request) {
		if (productRepository.existsBySku(request.getSku().trim())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists");
		}
		ProductEntity product = new ProductEntity();
		applyRequest(product, request);
		return toResponse(productRepository.save(product));
	}

	public ProductResponseDto update(Long id, ProductRequestDto request) {
		ProductEntity product = getProduct(id);
		if (productRepository.existsBySkuAndIdNot(request.getSku().trim(), id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists");
		}
		applyRequest(product, request);
		return toResponse(productRepository.save(product));
	}

	public ProductResponseDto saveImage(Long id, MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
		}
		String contentType = file.getContentType();
		if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPEG, PNG, GIF, or WebP images are allowed");
		}

		ProductEntity product = getProduct(id);
		deleteLocalImage(product.getImageUrl());

		String extension = extensionFor(contentType, file.getOriginalFilename());
		String filename = "product-" + id + "-" + UUID.randomUUID() + extension;
		Path destination = uploadDir().resolve(filename);
		try {
			Files.copy(file.getInputStream(), destination);
		} catch (IOException ex) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store image");
		}

		product.setImageUrl("/uploads/" + filename);
		return toResponse(productRepository.save(product));
	}

	public void delete(Long id) {
		ProductEntity product = getProduct(id);
		deleteLocalImage(product.getImageUrl());
		productRepository.delete(product);
	}

	private ProductEntity getProduct(Long id) {
		return productRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
	}

	private void applyRequest(ProductEntity product, ProductRequestDto request) {
		product.setName(request.getName().trim());
		product.setSku(request.getSku().trim());
		product.setDescription(request.getDescription() == null ? null : request.getDescription().trim());
		product.setPrice(request.getPrice());
		product.setStock(request.getStock());
		product.setCategory(getCategory(request.getCategoryId()));
		product.setImageUrl(request.getImageUrl() == null || request.getImageUrl().isBlank()
				? null
				: request.getImageUrl().trim());
	}

	private CategoryEntity getCategory(Long categoryId) {
		if (categoryId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is required");
		}
		return categoryRepository.findById(categoryId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
	}

	private ProductResponseDto toResponse(ProductEntity product) {
		CategoryEntity category = product.getCategory();
		return new ProductResponseDto(
				product.getId(),
				product.getName(),
				product.getSku(),
				product.getDescription(),
				product.getPrice(),
				product.getStock(),
				category == null ? null : category.getId(),
				category == null ? null : category.getName(),
				product.getImageUrl(),
				product.getCreatedAt(),
				product.getUpdatedAt()
		);
	}

	private Path uploadDir() {
		try {
			Path dir = Path.of("uploads").toAbsolutePath();
			Files.createDirectories(dir);
			return dir;
		} catch (IOException ex) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to prepare upload directory");
		}
	}

	private void deleteLocalImage(String imageUrl) {
		if (imageUrl == null || !imageUrl.startsWith("/uploads/")) {
			return;
		}
		Path file = Path.of("uploads").toAbsolutePath().resolve(Path.of(imageUrl).getFileName());
		try {
			Files.deleteIfExists(file);
		} catch (IOException ignored) {
			// Keep product delete even if the file is already gone.
		}
	}

	private String extensionFor(String contentType, String originalFilename) {
		return switch (contentType) {
			case "image/jpeg" -> ".jpg";
			case "image/png" -> ".png";
			case "image/gif" -> ".gif";
			case "image/webp" -> ".webp";
			default -> {
				if (originalFilename != null && originalFilename.contains(".")) {
					yield originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
				}
				yield ".img";
			}
		};
	}
}
