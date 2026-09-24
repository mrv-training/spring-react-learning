package com.base.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

	@GetMapping(value = {
			"/",
			"/login",
			"/dashboard",
			"/products",
			"/products/new",
			"/products/{id:\\d+}",
			"/products/{id:\\d+}/edit",
			"/categories",
			"/categories/new",
			"/categories/{id:\\d+}",
			"/categories/{id:\\d+}/edit"
	})
	public String forward() {
		return "forward:/index.html";
	}
}
