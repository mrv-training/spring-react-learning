package com.base.service;

import com.base.dto.CategoryRequestDto;
import com.base.dto.CategoryResponseDto;
import com.base.dto.PageResponseDto;
import com.base.entity.CategoryEntity;
import com.base.repository.CategoryRepository;
import com.base.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

	private final CategoryRepository categoryRepository;
	private final ProductRepository productRepository;

	public PageResponseDto<CategoryResponseDto> findPage(int page, int size, String query) {
		int safePage = Math.max(page, 0);
		int safeSize = size < 1 ? 5 : Math.min(size, 50);
		Page<CategoryEntity> result = categoryRepository.search(
				query == null ? "" : query.trim(),
				PageRequest.of(safePage, safeSize, Sort.by("name").ascending())
		);
		return new PageResponseDto<>(
				result.getContent().stream().map(this::toResponse).toList(),
				result.getNumber(),
				result.getSize(),
				result.getTotalElements(),
				result.getTotalPages()
		);
	}

	public List<CategoryResponseDto> findAllOptions() {
		return categoryRepository.findAll(Sort.by("name").ascending()).stream()
				.map(this::toResponse)
				.toList();
	}

	public CategoryResponseDto findById(Long id) {
		return toResponse(getCategory(id));
	}

	public CategoryResponseDto create(CategoryRequestDto request) {
		String name = request.getName().trim();
		if (categoryRepository.existsByNameIgnoreCase(name)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Category name already exists");
		}
		CategoryEntity category = new CategoryEntity();
		applyRequest(category, request);
		return toResponse(categoryRepository.save(category));
	}

	public CategoryResponseDto update(Long id, CategoryRequestDto request) {
		CategoryEntity category = getCategory(id);
		String name = request.getName().trim();
		if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Category name already exists");
		}
		applyRequest(category, request);
		return toResponse(categoryRepository.save(category));
	}

	public void delete(Long id) {
		CategoryEntity category = getCategory(id);
		if (productRepository.existsByCategoryId(id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a category that has products");
		}
		categoryRepository.delete(category);
	}

	private CategoryEntity getCategory(Long id) {
		return categoryRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
	}

	private void applyRequest(CategoryEntity category, CategoryRequestDto request) {
		category.setName(request.getName().trim());
		category.setDescription(request.getDescription() == null || request.getDescription().isBlank()
				? null
				: request.getDescription().trim());
	}

	private CategoryResponseDto toResponse(CategoryEntity category) {
		return new CategoryResponseDto(
				category.getId(),
				category.getName(),
				category.getDescription(),
				productRepository.countByCategoryId(category.getId()),
				category.getCreatedAt(),
				category.getUpdatedAt()
		);
	}
}
