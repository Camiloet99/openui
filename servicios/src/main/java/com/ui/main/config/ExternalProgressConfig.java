package com.ui.main.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;


import org.springframework.beans.factory.annotation.Value;

@Configuration
public class ExternalProgressConfig {

    @Bean
    public WebClient nivel99Client(@Value("${app.nivel99.base-url}") String baseUrl) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Accept", "application/json")
                .build();
    }
}