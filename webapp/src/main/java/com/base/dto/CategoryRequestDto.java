package com.base.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequestDto {

	@NotBlank
	private String name;

	private String description;
}
