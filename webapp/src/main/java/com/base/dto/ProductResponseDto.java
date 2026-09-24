package com.base.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {
	private Long id;
	private String name;
	private String sku;
	private String description;
	private BigDecimal price;
	private Integer stock;
	private Long categoryId;
	private String category;
	private String imageUrl;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
