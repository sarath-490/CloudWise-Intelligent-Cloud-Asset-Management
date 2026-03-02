package com.cloudfileorganizer.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CloudFileOrganizerApplication {

	public static void main(String[] args) {
		SpringApplication.run(CloudFileOrganizerApplication.class, args);
		System.out.println("Spring-boot booted successfully");
	}
}
