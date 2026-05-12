package com.example.lankaagridirect.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public org.springframework.security.core.userdetails.UserDetailsService userDetailsService() {
        return new org.springframework.security.provisioning.InMemoryUserDetailsManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // --- Fully Public Endpoints ---
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/register/producer").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/register/admin").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/v1/products/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/v1/producers/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/v1/map/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/v1/categories").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/v1/health").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/analytics/call").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/analytics/address").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/upload/**").permitAll()

                // --- Admin-only Endpoints ---
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                // --- Producer-only Endpoints ---
                .requestMatchers(HttpMethod.POST, "/api/v1/products").hasRole("PRODUCER")
                .requestMatchers(HttpMethod.PUT,  "/api/v1/products/**").hasRole("PRODUCER")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/products/**")
                    .hasAnyRole("PRODUCER", "ADMIN")

                // --- Authenticated (any valid role) ---
                .requestMatchers("/api/v1/auth/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/v1/auth/profile").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/auth/profile").authenticated()
                .requestMatchers("/api/v1/analytics/producer/**").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
