package com.pulseops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PulseopsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(PulseopsBackendApplication.class, args);
    }
}
