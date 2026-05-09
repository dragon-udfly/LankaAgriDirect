package com.example.lankaagridirect.Security;

/**
 * DataInitializer removed.
 * Admin seeding is now handled by init-mongo.js which runs at MongoDB
 * container startup via /docker-entrypoint-initdb.d/ — before the backend starts.
 * This avoids the race condition where Spring Boot tried to query MongoDB
 * before the connection was established, crashing the application.
 */
