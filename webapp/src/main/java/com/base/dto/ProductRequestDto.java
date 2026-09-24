package com.base.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequestDto {

	@NotBlank
	private String name;

	@NotBlank
	private String sku;

	private String description;

	@NotNull
	@DecimalMin(value = "0.00")
	private BigDecimal price;

	@NotNull
	@Min(0)
	private Integer stock;

	@NotNull
	private Long categoryId;

	private String imageUrl;
}
