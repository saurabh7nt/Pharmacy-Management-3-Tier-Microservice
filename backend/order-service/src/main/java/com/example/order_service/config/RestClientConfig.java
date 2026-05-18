package com.example.order_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${services.user-service.url}")
    private String userServiceUrl;

    @Value("${services.medicine-service.url}")
    private String medicineServiceUrl;

    @Bean(name = "userServiceRestClient")
    public RestClient userServiceRestClient() {
        return RestClient.builder()
                .baseUrl(userServiceUrl)
                .build();
    }

    @Bean(name = "medicineServiceRestClient")
    public RestClient medicineServiceRestClient() {
        return RestClient.builder()
                .baseUrl(medicineServiceUrl)
                .build();
    }
}


