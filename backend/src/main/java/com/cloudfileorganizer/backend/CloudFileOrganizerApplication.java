package com.cloudfileorganizer.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CloudFileOrganizerApplication {

	public static void main(String[] args) {
		SpringApplication.run(CloudFileOrganizerApplication.class, args);
		System.out.println("Spring-boot booted successfully");
	}
}
