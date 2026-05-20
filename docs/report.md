# Lanka Agri-Direct: Comprehensive Project Report
## Full-Stack Agricultural Marketplace Analysis

**Report Date:** May 19, 2026  
**Project Version:** 1.0  
**Project Language:** Java (Backend), TypeScript/JavaScript (Frontend/Mobile)

---

## Table of Contents

1. [Part 1: Project Overview & Architecture](#part-1-project-overview--architecture)
2. [Part 2: Database Design & MongoDB](#part-2-database-design--mongodb)
3. [Part 3: Backend Core - Spring Boot Setup](#part-3-backend-core---spring-boot-setup)
4. [Part 4: Backend - Authentication & Security](#part-4-backend---authentication--security)
5. [Part 5: Backend - Services Layer](#part-5-backend---services-layer)
6. [Part 6: Backend - REST API Controllers](#part-6-backend---rest-api-controllers)
7. [Part 7: Backend - External Integrations](#part-7-backend---external-integrations)
8. [Part 8: Admin Web Dashboard - Setup](#part-8-admin-web-dashboard---setup)
9. [Part 9: Admin Web Dashboard - Features](#part-9-admin-web-dashboard---features)
10. [Part 10: Mobile App - Architecture & Features](#part-10-mobile-app---architecture--features)

---

## PART 1: Project Overview & Architecture

### 1.1 Project Domain & Purpose

**Project Name:** Lanka Agri-Direct  
**Type:** Verified Direct-to-Consumer (D2C) Agricultural Marketplace  
**Geographic Scope:** All 25 districts of Sri Lanka  
**Mission:** Connect verified small-scale farmers and home gardeners directly with consumers, eliminating intermediaries and creating a high-trust agricultural marketplace.

### 1.2 Key Value Propositions

| Stakeholder | Value Proposition |
|-------------|-------------------|
| **Consumers (Buyers)** | Direct access to fresh, verified produce from local farmers with guaranteed identity verification |
| **Producers (Farmers)** | National marketplace reach, higher profit margins (no middlemen), real-time inventory control |
| **Admins** | Audit trail of all actions, role-based access control, verification workflow management |

### 1.3 Operational Model

- **Transaction Type:** Physical (Cash/COD only) - NO digital payments
- **Platform Role:** Information connector and lead generator
- **Verification Gate:** Mandatory producer verification via NIC photo + bank details before listing
- **Product Approval:** Automatic (no manual approval needed after producer is verified)
- **Inventory Management:** Manual "Sold Out" toggle by producers

### 1.4 System Architecture Pattern

**Three-Tier Architecture:**

```
┌─────────────────────────────────────────────────────┐
│           CLIENT TIER (Presentation)                │
├─────────────────────────────┬───────────────────────┤
│ Mobile (React Native)       │ Web (React Admin)     │
│ - Buyers (Anonymous)        │ - Verification       │
│ - Producers (Verified)      │ - Moderation         │
│ - GPS Discovery             │ - Analytics          │
└─────────────────────────────┴───────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│      APPLICATION TIER (Business Logic)              │
├─────────────────────────────────────────────────────┤
│ Spring Boot REST API (Java 21)                      │
│ - AuthService, ProducerService, ProductService     │
│ - AnalyticsService, AuditLogService                │
│ Port: 8080                                          │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│        DATA TIER (Persistence)                      │
├─────────────────────────────────────────────────────┤
│ MongoDB (NoSQL)                                     │
│ Database: lankaagridirect_db                        │
│ Port: 27017                                         │
│ Collections: Producer, Product, Category, etc.     │
└─────────────────────────────────────────────────────┘
```

### 1.5 Product Categories

The platform manages **4 primary agricultural categories:**

1. **Herbal Products** - Bundles, dried herbs, traditional varieties
2. **Vegetables** - Seasonal local produce
3. **Fruits** - Fresh local harvests
4. **Rice** - Samba, Nadu, heirloom varieties

### 1.6 Related Project Files

| File | Purpose |
|------|---------|
| [README.md](../README.md) | Project overview and quick start guide |
| [System Description.md](../docs/System%20Description.md) | Detailed system purpose and workflows |
| [Installation Guide.md](../docs/Installation%20Guide.md) | Setup and deployment instructions |
| [docker-compose.yml](../docker-compose.yml) | Container orchestration for all services |
| [LICENSE.md](../LICENSE.md) | Project licensing information |

### 1.7 Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Mobile Clients** | React Native + Expo | 0.76.6 / 52.0.0 |
| **Web Admin** | React + Vite + TypeScript | 19.2.5 / 8.0.10 / 6.0.2 |
| **Backend API** | Spring Boot (Java) | 4.0.6 (Java 21) |
| **Database** | MongoDB | Latest |
| **Authentication** | JWT + BCrypt | 0.12.6 |
| **Cloud Storage** | Cloudinary | 1.39.0 |
| **Containerization** | Docker + Docker Compose | Latest |

---

## PART 2: Database Design & MongoDB

### 2.1 Database Overview

**Database Engine:** MongoDB (NoSQL Document-Based)  
**Database Name:** `lankaagridirect_db`  
**Connection String:** `mongodb://mongodb:27017/lankaagridirect_db`  
**Persistence:** Docker volume `mongo_data`  
**Container:** mongo:latest (Docker service name: `mongodb`)

### 2.2 Collections Schema

#### 2.2.1 Producer Collection

```javascript
{
  "_id": ObjectId,
  "firstName": String,               // Required
  "lastName": String,                // Required
  "nic": String,                     // National ID Card
  "nicPhotoUrl": String,             // Cloudinary URL
  "profilePictureUrl": String,       // Optional Cloudinary URL
  "email": String,                   // Optional
  "businessPhone": String,           // Required - primary contact
  "mobilePhone": String,             // Optional - secondary contact
  "storeTitle": String,              // Store name/display title
  "businessType": String,            // "small-scale" or "home-gardener"
  
  // Operating Hours
  "operatingDays": [String],         // ["Mon", "Tue", "Wed", ...]
  "startTime": String,               // "08:00" format
  "endTime": String,                 // "18:00" format
  
  // Location (Geospatial)
  "latitude": Double,                // GPS coordinate
  "longitude": Double,               // GPS coordinate
  "locationDescription": String,     // Additional info
  "storeAddress": String,            // Collection point address
  "homeAddress": String,             // Residential address
  "district": String,                // Sri Lanka district
  "province": String,                // Sri Lanka province
  "gnDivision": String,              // Grama Niladhari division
  
  // Status Fields
  "verificationStatus": String,      // "pending", "verified", "blocked"
  "password": String,                // BCrypt hashed
  "isDeleted": Boolean,              // Soft delete
  
  // Timestamps
  "createdAt": ISODate,
  "modifiedAt": ISODate
}
```

#### 2.2.2 Product Collection

```javascript
{
  "_id": ObjectId,
  "producerId": ObjectId,            // Reference to Producer
  "name": String,                    // Product name
  "category": String,                // "Herbal", "Vegetables", "Fruits", "Rice"
  "description": String,             // Optional product description
  "unitPrice": Double,               // Price per unit
  "unitType": String,                // "kg", "bundle", "piece", etc.
  "imageUrls": [String],             // Array of Cloudinary URLs
  
  // Status Fields
  "isSoldOut": Boolean,              // Manual Sold Out toggle
  "productStatus": String,           // "active", "suspended"
  "isDeleted": Boolean,              // Soft delete
  
  // Timestamps
  "createdAt": ISODate,
  "modifiedAt": ISODate
}
```

#### 2.2.3 Category Collection

```javascript
{
  "_id": ObjectId,
  "name": String,                    // "Herbal Products", "Vegetables", etc.
  "description": String,
  "isActive": Boolean,
  "createdAt": ISODate
}
```

#### 2.2.4 AuditLog Collection (Append-Only)

```javascript
{
  "_id": ObjectId,
  "adminId": ObjectId,               // Reference to Admin user
  "action": String,                  // "VERIFIED_PRODUCER", "BLOCKED_PRODUCER", etc.
  "targetId": ObjectId,              // Reference to affected resource
  "targetType": String,              // "Producer", "Admin", "Product", etc.
  "details": Object,                 // Additional context
  "timestamp": ISODate,
  "ipAddress": String                // For security tracking
}
```

#### 2.2.5 LeadAnalytic Collection

```javascript
{
  "_id": ObjectId,
  "producerId": ObjectId,            // Reference to Producer
  "buyerId": String,                 // Anonymized buyer identifier (optional)
  "contactType": String,             // "phone_click", "address_view", etc.
  "timestamp": ISODate,
  "buyerLocation": {                 // Buyer's GPS at time of contact
    "latitude": Double,
    "longitude": Double
  }
}
```

#### 2.2.6 Admin Collection

```javascript
{
  "_id": ObjectId,
  "email": String,                   // Unique email
  "password": String,                // BCrypt hashed
  "fullName": String,
  "role": String,                    // "Admin" or "Moderator"
  "isActive": Boolean,
  "createdAt": ISODate,
  "lastLoginAt": ISODate
}
```

### 2.3 Database Initialization

**File:** [init-mongo.js](../init-mongo.js)  
**Purpose:** Seed initial data on first-time database creation  
**Execution:** Automatically runs when MongoDB container starts via Docker volume mount

**Seed Script Features:**
- Creates collections with initial indexes
- Creates default admin account
- Populates sample categories
- Sets up geospatial indexes for location-based queries

### 2.4 Key Database Features

| Feature | Implementation |
|---------|-----------------|
| **Geospatial Queries** | MongoDB geospatial indexes for GPS-based discovery |
| **Soft Deletes** | `isDeleted` boolean flag (data preserved for audits) |
| **Append-Only Audit** | AuditLog collection with server-controlled timestamps |
| **Timestamps** | Auto `createdAt` / `modifiedAt` on all documents |
| **Indexing** | Optimized indexes on email, NIC, producerId, category |
| **Data Validation** | Schema validation at application layer (Spring Data MongoDB) |

### 2.5 Related Database Files

| File | Purpose |
|------|---------|
| [init-mongo.js](../init-mongo.js) | MongoDB initialization and seed data |
| [databaseDesign.drawio](../docs/databaseDesing.drawio) | Database diagram (draw.io format) |
| [docker-compose.yml](../docker-compose.yml#L1-L20) | MongoDB service configuration |

### 2.6 Data Relationships

```
Producer (1) ──→ (N) Product
Producer (1) ──→ (N) LeadAnalytic
Producer (1) ──→ (N) ProducerAuditLog
Category (1) ──→ (N) Product
Admin (1) ──→ (N) AuditLog
```

---

## PART 3: Backend Core - Spring Boot Setup

### 3.1 Backend Overview

**Framework:** Spring Boot 4.0.6  
**Java Version:** Java 21 (GraalVM compatible)  
**Build Tool:** Apache Maven  
**Port:** 8080  
**API Base URL:** `http://localhost:8080/api/v1`

### 3.2 Project Structure

```
backend/
├── pom.xml                                 # Maven configuration & dependencies
├── mvnw                                    # Maven Wrapper (Linux/Mac)
├── mvnw.cmd                                # Maven Wrapper (Windows)
├── Dockerfile                              # Container image definition
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── lankaagridirect/
│   │   │               ├── controller/     # REST API endpoints
│   │   │               ├── service/        # Business logic
│   │   │               ├── repository/     # MongoDB data access
│   │   │               ├── model/          # Data entities
│   │   │               ├── dto/            # Request/Response DTOs
│   │   │               ├── security/       # JWT & Spring Security
│   │   │               ├── config/         # App configuration
│   │   │               ├── exception/      # Custom exceptions
│   │   │               └── Application.java # Main entry point
│   │   └── resources/
│   │       └── application.properties      # Configuration
│   └── test/
│       └── java/                           # Unit tests
└── target/                                 # Build output
```

### 3.3 Maven Dependencies (pom.xml Snippet)

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.0.6</version>
</parent>

<properties>
    <java.version>21</java.version>
</properties>

<dependencies>
    <!-- Core Web & Data -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-mongodb</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>

    <!-- Security & JWT -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.6</version>
    </dependency>

    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- Cloudinary -->
    <dependency>
        <groupId>com.cloudinary</groupId>
        <artifactId>cloudinary-http45</artifactId>
        <version>1.39.0</version>
    </dependency>

    <!-- Lombok (reduces boilerplate) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### 3.4 Application Configuration

**File:** [application.properties](../backend/src/main/resources/application.properties)

```properties
# App Name
spring.application.name=LankaAgriDirect

# =====================
# MongoDB Configuration
# =====================
spring.data.mongodb.uri=mongodb://mongodb:27017/lankaagridirect_db
spring.data.mongodb.host=mongodb
spring.data.mongodb.port=27017
spring.data.mongodb.database=lankaagridirect_db

# =====================
# JWT Configuration
# =====================
jwt.secret=${JWT_SECRET}                    # From .env
jwt.expiration-ms=604800000                 # 7 days in milliseconds

# =====================
# Cloudinary Configuration
# =====================
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}

# =====================
# Server Configuration
# =====================
server.port=8080
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# =====================
# CORS (Development)
# =====================
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173,http://localhost:8081
```

### 3.5 Building the Backend

**Build Command:**
```bash
cd backend/
./mvnw clean install          # Linux/Mac
mvnw.cmd clean install        # Windows
```

**Run Command (Local Development):**
```bash
./mvnw spring-boot:run
```

**Docker Build:**
```bash
docker build -t lanka-backend:latest ./backend/
```

### 3.6 Key Spring Boot Components

| Component | Purpose |
|-----------|---------|
| **@SpringBootApplication** | Main entry point with auto-configuration |
| **@RestController** | Maps HTTP requests to handler methods |
| **@Service** | Marks business logic beans |
| **@Repository** | Data access layer (Spring Data MongoDB) |
| **@Configuration** | Custom bean definitions (Security, CORS, etc.) |
| **@EnableWebSecurity** | Enables Spring Security configuration |

### 3.7 Related Backend Files

| File | Purpose |
|------|---------|
| [pom.xml](../backend/pom.xml) | Maven project configuration |
| [Dockerfile](../backend/Dockerfile) | Backend container definition |
| [application.properties](../backend/src/main/resources/application.properties) | Server configuration |
| [HELP.md](../backend/HELP.md) | Build and run instructions |

---

## PART 4: Backend - Authentication & Security

### 4.1 Authentication Architecture

**Authentication Method:** JWT (JSON Web Tokens)  
**Token Lifetime:** 7 days  
**Password Hashing:** BCrypt  
**Auth Header:** `Authorization: Bearer <token>`

### 4.2 JWT Implementation

**Library:** JJWT (JSON Web Token for Java) v0.12.6

**Token Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcm9kdWNlcl8xMjM0NTYiLCJyb2xlcyI6WyJQUk9EVUNFVL0ifSwiaWF0IjoxNjA0MTYyNDAwLCJleHAiOjE2MDQyNDI0MDB9.signature
```

**Claims (Payload):**
- `sub` (Subject): User ID
- `roles`: Array of user roles (PRODUCER, BUYER, ADMIN)
- `iat` (Issued At): Token creation timestamp
- `exp` (Expiration): Token expiration (7 days)

### 4.3 User Roles & Permissions

| Role | Permissions | API Scope |
|------|------------|-----------|
| **PRODUCER** | Create/update own products, view own analytics | `/api/v1/producers/*`, `/api/v1/products/*` |
| **BUYER** | Search products, view producer details, track contacts | `/api/v1/products/search`, `/api/v1/producers/{id}` (public) |
| **ADMIN** | Verify producers, manage admins, view audit logs | `/api/v1/admin/*` |

### 4.4 Password Security

**Hashing Algorithm:** BCrypt (adaptive, salted)  
**Password Requirements:**
- Minimum 8 characters
- No plaintext storage
- SaltRounds: Spring Security defaults (typically 10)

**Example BCrypt Hash:**
```
$2a$10$l/V0p3jLx4DW5l3z6C0FJ.eFvKfL9p5jQWpC5l5M8Q5X5N1R3x3nW
```

### 4.5 Spring Security Configuration

**Key Components:**
- `SecurityConfig` class: Enables HTTPS, CORS, JWT filter
- `JwtTokenProvider`: Generate/validate tokens
- `JwtAuthenticationFilter`: Intercepts requests, extracts JWT
- `JwtAuthenticationEntryPoint`: Handles unauthorized access
- `ControllerAdvice`: Global exception handler for auth errors

**Security Filter Chain:**
```
Request → JwtAuthenticationFilter → SecurityContext → Controller
                                      ↓
                            Role-based Authorization
```

### 4.6 Authentication Flow

#### Producer Registration
```
1. POST /api/v1/auth/register
   {
     "firstName": "John",
     "lastName": "Farmer",
     "email": "john@farm.lk",
     "password": "SecurePass123",
     "nic": "123456789V",
     "businessPhone": "+94771234567"
   }

2. Backend validates input
3. Hashes password with BCrypt
4. Stores to MongoDB Producer collection
5. Returns JWT token + user object
```

#### Producer Login
```
1. POST /api/v1/auth/login
   {
     "email": "john@farm.lk",
     "password": "SecurePass123"
   }

2. Backend finds producer by email
3. BCrypt compares password hash
4. Generates new JWT token (7-day expiry)
5. Returns token + producer details
```

#### Admin Verification
```
1. Producer status = "pending" (waiting for NIC verification)
2. Admin reviews in dashboard (NewRegistrationsPage)
3. Admin clicks "Approve" or "Block"
4. Backend updates producer.verificationStatus
5. Once "verified" → products go live immediately
```

### 4.7 Token Validation

**Token Validation Process:**
1. Extract token from `Authorization` header
2. Verify signature using JWT_SECRET
3. Check expiration time
4. Extract claims (user ID, roles)
5. Load user details from MongoDB
6. Set up SecurityContext with granted authorities

### 4.8 Related Security Files

| File/Path | Purpose |
|-----------|---------|
| `com.example.security.JwtTokenProvider` | Generate/validate JWT tokens |
| `com.example.security.JwtAuthenticationFilter` | Intercept requests with JWT |
| `com.example.security.SecurityConfig` | Spring Security bean configuration |
| `com.example.controller.AuthController` | Login/register endpoints |
| `com.example.dto.LoginRequest` | Request DTO for login |
| `com.example.dto.JwtAuthResponse` | Response DTO with token |

### 4.9 Environment Variables (Secrets)

**File:** `.env` (Docker)

```
JWT_SECRET=your-super-secret-base64-encoded-256-bit-key-here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## PART 5: Backend - Services Layer

### 5.1 Services Overview

The Services Layer implements **business logic** between Controllers and Repositories, following the Single Responsibility Principle.

**Core Services:**
1. `AuthService` - User authentication & registration
2. `ProducerService` - Producer CRUD & verification workflow
3. `ProductService` - Product listings management
4. `AdminService` - Admin user management
5. `AnalyticsService` - Lead tracking & statistics
6. `AuditLogService` - Immutable action logging
7. `CategoryService` - Product category management

### 5.2 AuthService

**Responsibilities:**
- Validate registration input (email, NIC, password)
- Hash passwords with BCrypt
- Generate JWT tokens
- Validate login credentials
- Token refresh/expiration handling

**Key Methods:**
```java
public JwtAuthResponse login(LoginRequest loginRequest)
public Producer register(ProducerRegistrationRequest request)
public JwtAuthResponse refreshToken(String token)
public boolean validateToken(String token)
public String getUserIdFromToken(String token)
```

### 5.3 ProducerService

**Responsibilities:**
- Create/read/update/delete producer accounts
- Manage producer verification workflow (pending → verified/blocked)
- Handle NIC photo uploads via Cloudinary
- Update operating hours and location
- Soft-delete producers

**Key Methods:**
```java
public Producer createProducer(ProducerRegistrationRequest request)
public Producer getProducerById(String producerId)
public List<Producer> getPendingVerifications()
public void verifyProducer(String producerId, boolean approved)
public Producer updateProducer(String producerId, ProducerUpdateRequest request)
public void deleteProducer(String producerId)
public List<Producer> searchByLocation(double latitude, double longitude, double radiusKm)
```

**Producer Verification States:**
```
PENDING → [VERIFIED or BLOCKED]
         ↓
      Once VERIFIED: Products automatically go live
      Once BLOCKED: Producer cannot create new products
```

### 5.4 ProductService

**Responsibilities:**
- Create/read/update/delete product listings
- Manage product images via Cloudinary
- Toggle "Sold Out" status
- Filter products by category, producer, availability
- Enforce verification gate (only verified producers can have active products)

**Key Methods:**
```java
public Product createProduct(String producerId, ProductCreateRequest request)
public Product getProductById(String productId)
public List<Product> getProductsByProducerId(String producerId)
public List<Product> getProductsByCategory(String category)
public Product updateProduct(String productId, ProductUpdateRequest request)
public void toggleSoldOut(String productId, boolean isSoldOut)
public void deleteProduct(String productId)
public List<Product> searchProducts(String category, double latitude, double longitude, double radiusKm)
```

**Product Status Workflow:**
```
Product created (producer.verificationStatus = "pending")
  ↓
Producer verified by admin
  ↓
Product status = "active" (visible to buyers)
  ↓
Producer toggles "sold out"
  ↓
Product hidden from buyer search
```

### 5.5 AdminService

**Responsibilities:**
- Create/manage admin accounts
- Assign roles (Admin, Moderator)
- Verify producer accounts
- Block/unblock producers
- Manage admin permissions

**Key Methods:**
```java
public Admin createAdmin(AdminCreateRequest request)
public Admin getAdminById(String adminId)
public void updateAdminRole(String adminId, String role)
public void deactivateAdmin(String adminId)
public void verifyProducerAsAdmin(String producerId, String adminId, boolean approved, String reason)
```

### 5.6 AnalyticsService

**Responsibilities:**
- Track lead contacts (contact click events)
- Calculate producer statistics (contact count, commission)
- Generate reports (top producers, category breakdown)
- Store LeadAnalytic documents

**Key Methods:**
```java
public void recordLeadClick(String producerId, String buyerId, String contactType)
public Map<String, Object> getProducerStats(String producerId)
public List<ProducerAnalytics> getTopProducers(int limit)
public Map<String, Integer> getCategoryBreakdown()
public long getTotalActiveProducers()
```

### 5.7 AuditLogService

**Responsibilities:**
- Create append-only audit log entries (immutable)
- Record all admin actions (verification, blocking, etc.)
- Track who did what and when
- Prevent audit log modification/deletion

**Key Methods:**
```java
public void logAction(String adminId, String action, String targetId, String targetType, Object details)
public List<AuditLog> getAuditLogsByAdmin(String adminId, int skip, int limit)
public List<AuditLog> getAuditLogsByTarget(String targetId)
public List<AuditLog> getAllAuditLogs(int skip, int limit)
```

**Audit Log Immutability:**
```java
// These operations are BLOCKED:
auditLogRepository.delete(auditLog);          // ❌ Cannot delete
auditLogRepository.save(auditLog);            // ❌ Cannot update
// Only insert (create) is allowed ✓
```

### 5.8 CategoryService

**Responsibilities:**
- Manage product categories (Herbal, Vegetables, Fruits, Rice)
- List active categories
- Enable/disable categories

**Key Methods:**
```java
public List<Category> getAllCategories()
public Category getCategoryById(String categoryId)
public Category createCategory(CategoryCreateRequest request)
public void updateCategory(String categoryId, CategoryUpdateRequest request)
```

### 5.9 Service Layer Architecture

```
Controller
    ↓
Service Layer
├── AuthService
├── ProducerService
├── ProductService
├── AdminService
├── AnalyticsService
├── AuditLogService
└── CategoryService
    ↓
Repository Layer (Spring Data MongoDB)
    ↓
MongoDB Database
```

### 5.10 Related Service Files

| File/Path | Purpose |
|-----------|---------|
| `com.example.service.AuthService` | Authentication logic |
| `com.example.service.ProducerService` | Producer management |
| `com.example.service.ProductService` | Product management |
| `com.example.service.AdminService` | Admin operations |
| `com.example.service.AnalyticsService` | Lead analytics |
| `com.example.service.AuditLogService` | Audit trail |
| `com.example.service.CategoryService` | Category management |

---

## PART 6: Backend - REST API Controllers

### 6.1 API Overview

**Base URL:** `http://localhost:8080/api/v1`  
**Format:** JSON (request/response)  
**Authentication:** JWT Bearer token (except public endpoints)  
**Response Format:** Standard REST JSON with HTTP status codes

### 6.2 AuthController

**Endpoint:** `/api/v1/auth`

#### Register Producer
```http
POST /api/v1/auth/register
Content-Type: application/json
Authorization: None (Public)

{
  "firstName": "John",
  "lastName": "Farmer",
  "email": "john@farm.lk",
  "password": "SecurePass123",
  "nic": "987654321V",
  "nicPhotoUrl": "https://res.cloudinary.com/...",
  "businessPhone": "+94771234567",
  "storeTitle": "John's Farm",
  "district": "Kandy",
  "latitude": 6.9271,
  "longitude": 80.7744
}

RESPONSE 201 Created:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "producer": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@farm.lk",
    "verificationStatus": "pending"
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json
Authorization: None (Public)

{
  "email": "john@farm.lk",
  "password": "SecurePass123"
}

RESPONSE 200 OK:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "producer": { ... }
}
```

#### Validate Token
```http
GET /api/v1/auth/validate
Authorization: Bearer <token>

RESPONSE 200 OK:
{
  "valid": true,
  "userId": "507f1f77bcf86cd799439011",
  "roles": ["PRODUCER"]
}
```

### 6.3 ProducerController

**Endpoint:** `/api/v1/producers`

#### Get All Producers (Paginated)
```http
GET /api/v1/producers?skip=0&limit=10
Authorization: Bearer <admin-token> (Admin only)

RESPONSE 200 OK:
{
  "producers": [
    {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "storeTitle": "John's Farm",
      "verificationStatus": "verified",
      "district": "Kandy"
    }
  ],
  "total": 150
}
```

#### Get Producer by ID
```http
GET /api/v1/producers/{producerId}
Authorization: Bearer <token>

RESPONSE 200 OK:
{
  "id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "businessPhone": "+94771234567",
  "latitude": 6.9271,
  "longitude": 80.7744,
  "verificationStatus": "verified"
}
```

#### Get Pending Verifications (Admin)
```http
GET /api/v1/producers/verification/pending
Authorization: Bearer <admin-token> (Admin only)

RESPONSE 200 OK:
{
  "pendingProducers": [
    {
      "id": "507f1f77bcf...",
      "firstName": "Jane",
      "email": "jane@farm.lk",
      "nicPhotoUrl": "https://res.cloudinary.com/..."
    }
  ],
  "count": 5
}
```

#### Update Producer
```http
PUT /api/v1/producers/{producerId}
Content-Type: application/json
Authorization: Bearer <token> (Own producer or Admin)

{
  "businessPhone": "+94771234568",
  "mobilePhone": "+94772234567",
  "storeTitle": "John's Fresh Farm",
  "operatingDays": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  "startTime": "06:00",
  "endTime": "18:00"
}

RESPONSE 200 OK:
{
  "id": "507f1f77bcf...",
  "storeTitle": "John's Fresh Farm",
  "modifiedAt": "2026-05-19T10:30:00Z"
}
```

### 6.4 ProductController

**Endpoint:** `/api/v1/products`

#### Create Product
```http
POST /api/v1/products
Content-Type: application/json
Authorization: Bearer <producer-token> (Verified producer only)

{
  "name": "Fresh Tomatoes",
  "category": "Vegetables",
  "description": "Fresh organic tomatoes",
  "unitPrice": 150,
  "unitType": "kg",
  "imageUrls": ["https://res.cloudinary.com/..."]
}

RESPONSE 201 Created:
{
  "id": "507f1f77bcf86cd799439012",
  "producerId": "507f1f77bcf86cd799439011",
  "name": "Fresh Tomatoes",
  "categorySegments": "Vegetables",
  "unitPrice": 150,
  "isSoldOut": false,
  "createdAt": "2026-05-19T10:30:00Z"
}
```

#### Search Products by Location
```http
GET /api/v1/products/search?category=Vegetables&latitude=6.9271&longitude=80.7744&radius=10
Authorization: None (Public)

RESPONSE 200 OK:
{
  "products": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Fresh Tomatoes",
      "unitPrice": 150,
      "producer": {
        "id": "507f1f77bcf86cd799439011",
        "storeTitle": "John's Farm",
        "businessPhone": "+94771234567",
        "distance": 2.5  // km from buyer
      },
      "isSoldOut": false
    }
  ]
}
```

#### Toggle Sold Out
```http
PUT /api/v1/products/{productId}/sold-out
Content-Type: application/json
Authorization: Bearer <producer-token>

{
  "isSoldOut": true
}

RESPONSE 200 OK:
{
  "id": "507f1f77bcf86cd799439012",
  "isSoldOut": true
}
```

### 6.5 AdminController

**Endpoint:** `/api/v1/admin`  
**Authorization:** Admin token required for all endpoints

#### Verify Producer
```http
POST /api/v1/admin/producers/{producerId}/verify
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "approved": true,
  "notes": "NIC verified, bank details confirmed"
}

RESPONSE 200 OK:
{
  "id": "507f1f77bcf86cd799439011",
  "verificationStatus": "verified"
}
```

#### Block Producer
```http
POST /api/v1/admin/producers/{producerId}/block
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "reason": "Duplicate account detected"
}

RESPONSE 200 OK:
{
  "id": "507f1f77bcf86cd799439011",
  "verificationStatus": "blocked"
}
```

#### Get Dashboard Stats
```http
GET /api/v1/admin/stats
Authorization: Bearer <admin-token>

RESPONSE 200 OK:
{
  "totalProducers": 250,
  "verifiedProducers": 200,
  "pendingVerifications": 30,
  "blockedProducers": 20,
  "totalProducts": 1500,
  "productsByCategory": {
    "Vegetables": 600,
    "Fruits": 500,
    "Rice": 300,
    "Herbal": 100
  }
}
```

### 6.6 AnalyticsController

**Endpoint:** `/api/v1/analytics`

#### Record Contact Click
```http
POST /api/v1/analytics/lead-click
Content-Type: application/json
Authorization: None (Public)

{
  "producerId": "507f1f77bcf86cd799439011",
  "contactType": "phone_click",
  "buyerLocation": {
    "latitude": 6.9271,
    "longitude": 80.7744
  }
}

RESPONSE 200 OK:
{
  "recorded": true
}
```

#### Get Producer Analytics (Producer or Admin)
```http
GET /api/v1/analytics/producer/{producerId}
Authorization: Bearer <token>

RESPONSE 200 OK:
{
  "producerId": "507f1f77bcf86cd799439011",
  "totalContacts": 145,
  "contactsThisMonth": 32,
  "topContactTime": "10:00-11:00",
  "buyerRadiusAverage": 5.2
}
```

### 6.7 AuditLogController

**Endpoint:** `/api/v1/admin/audit-logs`  
**Authorization:** Admin token required

#### Get All Audit Logs
```http
GET /api/v1/admin/audit-logs?skip=0&limit=20
Authorization: Bearer <admin-token>

RESPONSE 200 OK:
{
  "logs": [
    {
      "id": "507f1f77bcf86cd799439020",
      "adminId": "507f1f77bcf86cd799439001",
      "action": "VERIFIED_PRODUCER",
      "targetId": "507f1f77bcf86cd799439011",
      "targetType": "Producer",
      "timestamp": "2026-05-19T09:15:00Z"
    }
  ],
  "total": 342
}
```

### 6.8 Error Responses

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "JWT token is expired",
  "status": 401
}
```

**403 Forbidden:**
```json
{
  "error": "Forbidden",
  "message": "Only verified producers can create products",
  "status": 403
}
```

**400 Bad Request:**
```json
{
  "error": "Validation Error",
  "message": "Email already exists",
  "status": 400
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "Database connection failed",
  "status": 500
}
```

### 6.9 Related Controller Files

| File/Path | Purpose |
|-----------|---------|
| `com.example.controller.AuthController` | Authentication endpoints |
| `com.example.controller.ProducerController` | Producer CRUD operations |
| `com.example.controller.ProductController` | Product management |
| `com.example.controller.AdminController` | Admin operations |
| `com.example.controller.AnalyticsController` | Lead tracking |
| `com.example.controller.AuditLogController` | Audit log access |

---

## PART 7: Backend - External Integrations

### 7.1 Cloudinary Integration

**Purpose:** Cloud storage for all image uploads (NIC photos, profile pictures, product images)  
**Service:** Cloudinary.com  
**Library:** cloudinary-http45 (v1.39.0)  
**Upload Limit:** 10MB per file

### 7.2 Cloudinary Configuration

**Environment Variables:**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Configuration File:** [application.properties](../backend/src/main/resources/application.properties)
```properties
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}
```

### 7.3 Image Upload Workflow

#### Producer Registration (NIC Photo)
```
1. Producer selects NIC image file
2. Mobile app → POST /api/v1/auth/register (multipart/form-data)
3. Backend ImageUploadController receives file
4. Validates: file size ≤ 10MB, format = JPEG/PNG
5. Uploads to Cloudinary under folder "nic-photos/{producerId}"
6. Stores URL in Producer.nicPhotoUrl
7. Returns URL to frontend
```

#### Product Image Upload
```
1. Producer creates product with images
2. POST /api/v1/products (multipart/form-data)
3. ImageUploadController processes each image
4. Uploads to Cloudinary "products/{productId}"
5. Returns array of URLs
6. Stores in Product.imageUrls[]
```

### 7.4 Cloudinary URL Structure

**NIC Photo:**
```
https://res.cloudinary.com/{cloud_name}/image/upload/
  v{version}/nic-photos/{producer_id}/{filename}
```

**Product Image:**
```
https://res.cloudinary.com/{cloud_name}/image/upload/
  v{version}/products/{product_id}/{filename}
```

**Profile Picture:**
```
https://res.cloudinary.com/{cloud_name}/image/upload/
  v{version}/profiles/{producer_id}/{filename}
```

### 7.5 Image Controller Implementation

**File:** `com.example.controller.ImageUploadController`

```java
@PostMapping("/upload")
public ResponseEntity<String> uploadImage(
    @RequestParam("file") MultipartFile file,
    @RequestParam("folder") String folder
) throws IOException {
    // 1. Validate file
    if (file.getSize() > 10 * 1024 * 1024) {
        throw new FileSizeLimitException("File exceeds 10MB limit");
    }
    
    // 2. Upload to Cloudinary
    Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
        ObjectUtils.asMap("folder", folder));
    
    // 3. Return URL
    String imageUrl = (String) uploadResult.get("secure_url");
    return ResponseEntity.ok(imageUrl);
}
```

### 7.6 MongoDB Integration

**Framework:** Spring Data MongoDB  
**Connection:** `spring.data.mongodb.uri=mongodb://mongodb:27017/lankaagridirect_db`

**Repository Pattern:**
```java
@Repository
public interface ProducerRepository extends MongoRepository<Producer, String> {
    Optional<Producer> findByEmail(String email);
    Optional<Producer> findByNic(String nic);
    List<Producer> findByVerificationStatus(String status);
}
```

**MongoRepository Features:**
- Automatic CRUD operations
- Custom query methods
- Pagination support (Page, Pageable)
- Index management

### 7.7 Key Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| spring-boot-starter-data-mongodb | 4.0.6 | MongoDB driver & repositories |
| cloudinary-http45 | 1.39.0 | Cloud image storage |
| lombok | Latest | Boilerplate reduction (@Data, @Getter, @Setter) |
| spring-boot-starter-validation | 4.0.6 | Input validation (@Valid, @NotNull) |
| jjwt | 0.12.6 | JWT token handling |

### 7.8 File Upload Limits

**Configuration:** [application.properties](../backend/src/main/resources/application.properties)

```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### 7.9 Error Handling for Uploads

**File Too Large:**
```json
{
  "error": "FileSizeLimitExceededException",
  "message": "File exceeds 10MB limit",
  "status": 413
}
```

**Invalid File Type:**
```json
{
  "error": "InvalidFileTypeException",
  "message": "Only JPEG and PNG files are allowed",
  "status": 400
}
```

**Cloudinary Upload Failure:**
```json
{
  "error": "CloudinaryException",
  "message": "Failed to upload file to Cloudinary",
  "status": 500
}
```

### 7.10 Related Integration Files

| File/Path | Purpose |
|-----------|---------|
| `com.example.controller.ImageUploadController` | Image upload endpoint |
| `com.example.service.ImageService` | Image processing logic |
| `com.example.config.CloudinaryConfig` | Cloudinary bean setup |
| [application.properties](../backend/src/main/resources/application.properties) | Upload configuration |

---

## PART 8: Admin Web Dashboard - Setup

### 8.1 Admin Dashboard Overview

**Framework:** React 19.2.5  
**Build Tool:** Vite 8.0.10  
**Language:** TypeScript 6.0.2  
**Package Manager:** npm  
**Target Demo:** Desktop (responsive, optimized for 1024px+)

### 8.2 Project Structure

```
admin-web/
├── package.json                            # Dependencies & scripts
├── vite.config.ts                          # Vite bundler configuration
├── tsconfig.json                           # TypeScript configuration
├── eslint.config.js                        # Code linting rules
├── Dockerfile                              # Container image
├── nginx.conf                              # Reverse proxy config (production)
├── index.html                              # HTML entry point
├── public/                                 # Static assets
├── src/
│   ├── main.tsx                            # React app entry point
│   ├── App.tsx                             # Root component
│   ├── App.css                             # Global styles
│   ├── index.css                           # CSS reset & variables
│   ├── pages/                              # Page components
│   │   ├── LoginPage.tsx                   # Admin login
│   │   ├── DashboardPage.tsx               # Dashboard with stats
│   │   ├── ProducersPage.tsx               # Manage producers
│   │   ├── NewRegistrationsPage.tsx        # Verify pending registrations
│   │   ├── ProductsPage.tsx                # Browse products
│   │   └── AuditLogsPage.tsx               # View audit trail
│   ├── components/                         # Reusable components
│   │   ├── Sidebar.tsx                     # Navigation sidebar
│   │   ├── AppButton.tsx                   # Custom button
│   │   └── AppInput.tsx                    # Custom input field
│   ├── context/                            # React Context
│   │   └── AuthContext.tsx                 # Admin auth state
│   ├── api/                                # API layer
│   │   └── adminApi.ts                     # HTTP calls to backend
│   ├── styles/                             # Component-specific CSS
│   │   └── NewRegistrations.css            # NewRegistrations page styles
│   └── assets/                             # Images, icons, etc.
└── tsconfig.app.json                       # App-specific TS config
```

### 8.3 Package.json Configuration

**File:** [package.json](../admin-web/package.json)

```json
{
  "name": "admin-web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",                           # Start dev server on :5173
    "build": "tsc -b && vite build",         # Build for production
    "lint": "eslint .",                      # Run ESLint
    "preview": "vite preview"                # Preview production build
  },
  "dependencies": {
    "axios": "^1.16.0",                      # HTTP client
    "react": "^19.2.5",                      # UI framework
    "react-dom": "^19.2.5",                  # React DOM renderer
    "react-router-dom": "^7.15.0",           # Client-side routing
    "recharts": "^3.8.1"                     # Chart visualization
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.1",        # Vite React plugin
    "typescript": "~6.0.2",                  # Type checking
    "vite": "^8.0.10",                       # Build tool
    "eslint": "^10.2.1"                      # Code linting
  }
}
```

### 8.4 Vite Configuration

**File:** [vite.config.ts](../admin-web/vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,                              // Dev server port
    proxy: {
      '/api': {
        target: 'http://localhost:8080',     // Backend proxy
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',                          # Production build output
    minify: 'terser'                         # Code minification
  }
})
```

### 8.5 TypeScript Configuration

**File:** [tsconfig.json](../admin-web/tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,                          # Strict type checking
    "noImplicitAny": true,                   # No implicit any
    "strictNullChecks": true,                # Null safety
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 8.6 Development Setup

**Install Dependencies:**
```bash
cd admin-web/
npm install
```

**Start Dev Server:**
```bash
npm run dev
# Server runs on http://localhost:5173
```

**Build for Production:**
```bash
npm run build
# Output in dist/ folder
```

**Lint Code:**
```bash
npm run lint
```

### 8.7 Docker Build & Run

**File:** [Dockerfile](../admin-web/Dockerfile)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:latest
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build Command:**
```bash
docker build -t lanka-admin-web:latest ./admin-web/
```

**Run Container:**
```bash
docker run -p 5173:80 lanka-admin-web:latest
```

### 8.8 React Project Setup

**Entry Point:** [index.html](../admin-web/index.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lanka Agri-Direct Admin</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

**Main Entry:** [main.tsx](../admin-web/src/main.tsx)
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### 8.9 Key Technologies

| Technology | Purpose |
|-----------|---------|
| **React 19** | Component-based UI framework |
| **Vite** | Next-generation bundler (ultra-fast) |
| **TypeScript** | Static type checking for safety |
| **Axios** | HTTP client for API calls |
| **React Router DOM** | Client-side navigation |
| **Recharts** | Data visualization & charts |
| **ESLint** | Code quality & consistency |
| **Nginx** | Reverse proxy (production) |

### 8.10 Related Admin Web Files

| File | Purpose |
|------|---------|
| [package.json](../admin-web/package.json) | Dependencies & npm scripts |
| [vite.config.ts](../admin-web/vite.config.ts) | Build configuration |
| [tsconfig.json](../admin-web/tsconfig.json) | TypeScript settings |
| [Dockerfile](../admin-web/Dockerfile) | Container image |
| [nginx.conf](../admin-web/nginx.conf) | Production proxy config |
| [index.html](../admin-web/index.html) | HTML template |
| [eslint.config.js](../admin-web/eslint.config.js) | Linting rules |

---

## PART 9: Admin Web Dashboard - Features

### 9.1 Dashboard Pages Overview

The admin dashboard has **6 main pages** for complete system management:

1. **LoginPage** - Admin authentication
2. **DashboardPage** - Statistics & overview
3. **ProducersPage** - Manage all producers
4. **NewRegistrationsPage** - Verify pending producers
5. **ProductsPage** - View all products
6. **AuditLogsPage** - Track admin actions

### 9.2 LoginPage

**File:** [admin-web/src/pages/LoginPage.tsx](../admin-web/src/pages/LoginPage.tsx)

**Purpose:** Authenticate admin users with JWT

**Features:**
- Email & password input fields
- Login via backend `/api/v1/auth/login` endpoint (Admin credentials)
- Error messages for invalid credentials
- Success → JWT token stored in localStorage
- Redirect to Dashboard on success
- Remember login state via AuthContext

**UI Elements:**
- Email input field
- Password input field
- "Login" button (disabled while loading)
- Error alert box
- "Forgot Password" link (optional)

### 9.3 DashboardPage

**File:** [admin-web/src/pages/DashboardPage.tsx](../admin-web/src/pages/DashboardPage.tsx)

**Purpose:** Display system statistics and KPIs

**Key Metrics Displayed:**
- **Producer Stats:**
  - Total Producers count
  - Verified Producers count
  - Pending Verifications count
  - Blocked Producers count

- **Product Stats:**
  - Total Products count
  - Products by Category (Vegetables, Fruits, Herbal, Rice)
  
- **Activity:**
  - Recent registrations
  - Active producers today
  - Products added this week

**Visualizations:**
- Business card-style metric boxes (total numbers)
- Recharts bar chart for category breakdown
- Recharts pie chart for producer status distribution
- Trending line chart (optional)

**API Calls:**
```typescript
GET /api/v1/admin/stats
Authorization: Bearer {adminToken}
```

**UI Components:**
- Metric cards (count, icon, color-coded)
- Bar charts (category breakdown)
- Pie charts (producer status)
- Data refresh button

### 9.4 ProducersPage

**File:** [admin-web/src/pages/ProducersPage.tsx](../admin-web/src/pages/ProducersPage.tsx)

**Purpose:** View and manage all producer accounts

**Features:**
- Paginated list of producers (10 per page)
- Filter by:
  - Verification Status (All, Verified, Pending, Blocked)
  - District
  - Business Type (Small-scale, Home-gardener)

- Display columns:
  - Producer Name
  - Store Title
  - Email
  - District
  - Verification Status (badge: green/yellow/red)
  - Business Phone
  - Registered Date
  - Actions (View Details, Block/Unblock, Delete)

**API Calls:**
```typescript
GET /api/v1/producers?skip=0&limit=10
Authorization: Bearer {adminToken}

GET /api/v1/producers/{producerId}
```

**UI Components:**
- Table view with sorting
- Pagination controls
- Filter dropdown
- Search input (by name/email)
- Status badges
- Action buttons (View, Block, Delete)

### 9.5 NewRegistrationsPage

**File:** [admin-web/src/pages/NewRegistrationsPage.tsx](../admin-web/src/pages/NewRegistrationsPage.tsx)

**Purpose:** Verify pending producer registrations

**Critical Verification Steps:**
1. Review producer details (name, NIC, contact)
2. View NIC photo from Cloudinary
3. Check business address
4. Validate bank details
5. Approve or Block the registration

**Features:**
- Card-based layout for each pending producer
- Large NIC photo preview (Cloudinary image)
- Producer details:
  - Full name
  - NIC number (masked except last 3 digits)
  - Email
  - Business phone
  - Store title
  - District & address
  - Operating hours
  - GPS coordinates (map link)

- Actions:
  - **Approve Button** → verified status → products go live
  - **Block Button** → blocked status → cannot create products
  - **Request More Info** → send message (optional)

**API Calls:**
```typescript
GET /api/v1/producers/verification/pending
Authorization: Bearer {adminToken}

POST /api/v1/admin/producers/{producerId}/verify
{
  "approved": true,
  "notes": "..."
}

POST /api/v1/admin/producers/{producerId}/block
{
  "reason": "..."
}
```

**UI Components:**
- Producer card layout
- Image modal (NIC photo preview)
- Approve/Block buttons
- Confirmation dialogs
- Notes textarea
- Status update notifications

**Styling File:** [admin-web/src/styles/NewRegistrations.css](../admin-web/src/styles/NewRegistrations.css)

### 9.6 ProductsPage

**File:** [admin-web/src/pages/ProductsPage.tsx](../admin-web/src/pages/ProductsPage.tsx)

**Purpose:** Browse all products across the platform

**Features:**
- Product grid layout with cards
- Filter by:
  - Category (Vegetables, Fruits, Herbal, Rice)
  - Availability (Active, Sold Out)
  - District
  - Producer

- Product card displays:
  - Product image (first URL from imageUrls)
  - Product name
  - Category badge
  - Unit price (LKR)
  - Unit type (kg, bundle, piece)
  - Producer name
  - Sold out badge (if applicable)

- Search functionality
- Sort by (Newest, Price, Producer name)
- Pagination

**API Calls:**
```typescript
GET /api/v1/products?skip=0&limit=20&category=Vegetables&isSoldOut=false
```

**UI Components:**
- Product card grid
- Filter sidebar
- Search bar
- Sort dropdown
- Pagination controls
- Image galleries

### 9.7 AuditLogsPage

**File:** [admin-web/src/pages/AuditLogsPage.tsx](../admin-web/src/pages/AuditLogsPage.tsx)

**Purpose:** Track all administrative actions (immutable audit trail)

**Features:**
- Append-only audit log view (cannot modify/delete)
- Temporal log entries with:
  - Timestamp (formatted: May 19, 2026 10:30 AM)
  - Admin who performed action
  - Action type (VERIFIED_PRODUCER, BLOCKED_PRODUCER, etc.)
  - Target resource (Producer ID, Product ID)
  - Details (reason, notes)
  - IP address (for security)

- Filter by:
  - Admin user
  - Action type
  - Date range
  - Target resource type

- Sort by:
  - Most recent first (default)
  - Oldest first

- Export to CSV (optional)

**API Calls:**
```typescript
GET /api/v1/admin/audit-logs?skip=0&limit=50
Authorization: Bearer {adminToken}
```

**UI Components:**
- Timeline-style view OR table view
- Filter controls
- Date picker
- Search input
- Export button
- Read-only display (no edit/delete options)

### 9.8 AuthContext

**File:** [admin-web/src/context/AuthContext.tsx](../admin-web/src/context/AuthContext.tsx)

**Purpose:** Manage admin authentication state across app

**Stored State:**
```typescript
{
  admin: {
    id: string,
    email: string,
    role: "Admin" | "Moderator",
    fullName: string
  },
  token: string,                             // JWT from login
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null
}
```

**Context Methods:**
- `login(email, password)` - Authenticate admin
- `logout()` - Clear auth state
- `validateToken()` - Check if token is valid
- `refreshToken()` - Get new token (if expired)

**Usage:**
```typescript
const { admin, token, isAuthenticated, login, logout } = useContext(AuthContext)
```

### 9.9 API Layer

**File:** [admin-web/src/api/adminApi.ts](../admin-web/src/api/adminApi.ts)

**Purpose:** Centralized HTTP client for backend communication

**Axios Instance Setup:**
```typescript
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 5000
})

// Add JWT token to ALL requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**API Methods:**
```typescript
export const adminApi = {
  login: (email, password) => POST /auth/login
  getStats: () => GET /admin/stats
  getPendingProducers: () => GET /producers/verification/pending
  verifyProducer: (producerId, approved) => POST /admin/producers/{id}/verify
  getProducts: (filters) => GET /products
  getAuditLogs: (skip, limit) => GET /admin/audit-logs
}
```

### 9.10 React Router Navigation

**File:** [admin-web/src/App.tsx](../admin-web/src/App.tsx)

**Route Structure:**
```typescript
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<PrivateRoute />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/producers" element={<ProducersPage />} />
      <Route path="/registrations" element={<NewRegistrationsPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/audit-logs" element={<AuditLogsPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

**PrivateRoute Component:**
- Redirects unauthenticated users to login
- Checks JWT token validity
- Shows loading spinner while validating

### 9.11 Related Admin Dashboard Files

| File | Purpose |
|------|---------|
| [LoginPage.tsx](../admin-web/src/pages/LoginPage.tsx) | Admin login |
| [DashboardPage.tsx](../admin-web/src/pages/DashboardPage.tsx) | Stats dashboard |
| [ProducersPage.tsx](../admin-web/src/pages/ProducersPage.tsx) | Producer management |
| [NewRegistrationsPage.tsx](../admin-web/src/pages/NewRegistrationsPage.tsx) | Producer verification |
| [ProductsPage.tsx](../admin-web/src/pages/ProductsPage.tsx) | Product listings |
| [AuditLogsPage.tsx](../admin-web/src/pages/AuditLogsPage.tsx) | Audit trail |
| [AuthContext.tsx](../admin-web/src/context/AuthContext.tsx) | Auth state |
| [adminApi.ts](../admin-web/src/api/adminApi.ts) | API client |
| [Sidebar.tsx](../admin-web/src/components/Sidebar.tsx) | Navigation |
| [NewRegistrations.css](../admin-web/src/styles/NewRegistrations.css) | Styling |

---

## PART 10: Mobile App - Architecture & Features

### 10.1 Mobile App Overview

**Framework:** React Native 0.76.6  
**Runtime:** Expo 52.0.0  
**Language:** TypeScript 5.8.3  
**Node Requirement:** ≥22.11.0  
**Platforms:** iOS, Android, Web  
**Build System:** Expo CLI + EAS (Expo Application Services)

### 10.2 Project Structure

```
mobile-app/
├── package.json                            # Dependencies & scripts
├── app.json                                # Expo configuration
├── App.tsx                                 # Root component
├── babel.config.js                         # Babel transpiler config
├── tsconfig.json                           # TypeScript config
├── metro.config.js                         # Metro bundler config
├── jest.config.js                          # Jest testing config
├── Gemfile                                 # Ruby dependencies (iOS)
├── index.js                                # Entry point
├── android/                                # Android project
│   ├── build.gradle
│   ├── settings.gradle
│   ├── gradle.properties
│   ├── gradlew / gradlew.bat               # Gradle wrapper
│   └── app/src/                            # Android source
├── ios/                                    # iOS project
│   ├── Podfile                             # CocoaPods dependencies
│   ├── LankaAgriDirectApp/                 # iOS app source
│   │   ├── AppDelegate.swift
│   │   ├── Info.plist
│   │   └── Images.xcassets/
│   └── LankaAgriDirectApp.xcodeproj/       # Xcode project
├── src/
│   ├── api/                                # API layer
│   │   ├── axiosInstance.js                # Axios HTTP client
│   │   ├── authApi.js                      # Auth endpoints
│   │   ├── producerApi.js                  # Producer endpoints
│   │   ├── productApi.js                   # Product endpoints
│   │   ├── analyticsApi.js                 # Analytics endpoints
│   │   └── cloudinaryUpload.js             # Image upload
│   ├── context/                            # React Context
│   │   └── AuthContext.js                  # Auth state management
│   ├── navigation/                         # Screen navigation
│   │   ├── AppNavigator.js                 # Root navigator
│   │   ├── BuyerNavigator.js               # Buyer screens
│   │   └── ProducerNavigator.js            # Producer screens
│   ├── screens/                            # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── buyer/
│   │   │   ├── HomeScreen.js               # GPS discovery
│   │   │   ├── ProductDetailScreen.js
│   │   │   └── BookmarksScreen.js
│   │   └── producer/
│   │       ├── DashboardScreen.js
│   │       ├── MyProductsScreen.js
│   │       ├── AddProductScreen.js
│   │       └── AccountSettingsScreen.js
│   ├── components/                         # Reusable components
│   │   ├── AlertBox.js
│   │   ├── AppButton.js
│   │   ├── AppInput.js
│   │   ├── ProductCard.js
│   │   └── VerificationBanner.js
│   ├── theme/                              # Design system
│   │   └── colors.js                       # Color palette
│   └── utils/                              # Helper functions
├── __tests__/                              # Jest unit tests
└── build/                                  # Build output
```

### 10.3 Package Dependencies

**File:** [package.json](../mobile-app/package.json)

**Key Dependencies:**
| Package | Version | Purpose |
|---------|---------|---------|
| react-native | 0.76.6 | Native mobile framework |
| expo | 52.0.0 | Development platform |
| @react-native-async-storage/async-storage | 1.23.1 | Local device storage (bookmarks) |
| @react-native-community/geolocation | 3.4.0 | GPS location access |
| @react-navigation/bottom-tabs | 7.15.11 | Bottom tab navigation |
| @react-navigation/stack | 7.8.11 | Stack screen navigation |
| @react-navigation/native | 7.2.2 | Navigation core |
| react-native-image-picker | 8.2.1 | Photo/camera picker |
| react-native-vector-icons | 10.3.0 | Icon library |
| axios | 1.16.0 | HTTP client |

### 10.4 App Navigation Architecture

**Navigation Pattern:** Role-based tab + stack navigator

```
AppNavigator (Root)
├── isAuthenticated = false
│   └── AuthStack
│       ├── LoginScreen
│       └── RegisterScreen
│
└── isAuthenticated = true
    ├── role = "BUYER"
    │   └── BuyerNavigator (Bottom Tabs)
    │       ├── HomeTab
    │       │   ├── HomeScreen (GPS discovery)
    │       │   └── ProductDetailScreen (stack)
    │       ├── BookmarksTab
    │       │   └── BookmarksScreen
    │       └── SettingsTab
    │           └── AccountSettingsScreen
    │
    └── role = "PRODUCER"
        └── ProducerNavigator (Bottom Tabs)
            ├── DashboardTab
            │   └── DashboardScreen
            ├── ProductsTab
            │   ├── MyProductsScreen
            │   └── AddProductScreen (stack)
            └── SettingsTab
                └── AccountSettingsScreen
```

### 10.5 Buyer Features

#### 10.5.1 HomeScreen (GPS Discovery)

**File:** [mobile-app/src/screens/buyer/HomeScreen.js](../mobile-app/src/screens/buyer/HomeScreen.js)

**Purpose:** Location-based product discovery for anonymous buyers

**Features:**
- Get current GPS location (geolocation)
- Filter products by:
  - Category (Vegetables, Fruits, Herbal, Rice)
  - Distance radius (5km, 10km, 25km)
  - Availability (Active, Show Sold Out)

- Display product cards:
  - Product image
  - Product name
  - Unit price (LKR)
  - Producer store name
  - Distance in km
  - Sold out badge (if applicable)

**API Calls:**
```javascript
GET /api/v1/products/search?category=Vegetables&latitude=6.9271&longitude=80.7744&radius=10
```

**Geolocation Code:**
```javascript
import { geolocation } from '@react-native-community/geolocation'

geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords
    // Fetch products near location
  }
)
```

**UI Components:**
- Category filter buttons
- Distance radius slider
- Product card grid
- Loading spinner
- "No products found" message
- Refresh button

#### 10.5.2 ProductDetailScreen

**Purpose:** View detailed product information and producer contact

**Features:**
- Large product image gallery
- Product details:
  - Name, category, unit price, unit type
  - Description
  - Availability (Sold Out toggle)
  - Producer information:
    - Store name
    - Business phone (clickable to call)
    - Operating hours
    - Distance from buyer
    - Address with map link

- Actions:
  - Call producer (phone intent)
  - View on map (maps app)
  - Record lead click (analytics)
  - Back to search

**API Calls:**
```javascript
GET /api/v1/products/{productId}
GET /api/v1/producers/{producerId}
POST /api/v1/analytics/lead-click
```

**UI Elements:**
- Image carousel
- Text details
- Call button (phone intent)
- Map button (Google Maps/Apple Maps)
- Star/bookmark button

#### 10.5.3 BookmarksScreen

**Purpose:** Local device storage for favorite producers

**Features:**
- Display starred producers (stored in AsyncStorage)
- Saved data persists across app sessions
- NO server sync (device-only)
- Quick access to frequently visited stores
- Remove bookmark option
- Tap to navigate to producer details

**Technology:** AsyncStorage (device-only key-value store)

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage'

// Save bookmark
await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks))

// Retrieve bookmarks
const saved = await AsyncStorage.getItem('bookmarks')
```

**Data Structure:**
```javascript
{
  "bookmarks": [
    {
      "producerId": "507f1f77bcf86cd799439011",
      "storeTitle": "John's Farm",
      "savedAt": "2026-05-19T10:30:00Z"
    }
  ]
}
```

### 10.6 Producer Features

#### 10.6.1 DashboardScreen

**File:** [mobile-app/src/screens/producer/DashboardScreen.js](../mobile-app/src/screens/producer/DashboardScreen.js)

**Purpose:** Producer overview and quick statistics

**Features:**
- Verification status banner:
  - "Pending Verification" (in progress)
  - "Account Verified ✓" (green)
  - "Account Blocked ✗" (red)

- Statistics cards:
  - Active products count
  - Total products count
  - Contact leads this month
  - Average sale price

- Quick actions:
  - Add new product
  - View my products
  - See analytics
  - Edit profile

**VerificationBanner Component:** [mobile-app/src/components/VerificationBanner.js](../mobile-app/src/components/VerificationBanner.js)

```javascript
// Shows status based on producer.verificationStatus
{status === "verified" && <Green badge> Account Verified </Green>}
{status === "pending" && <Yellow badge> Waiting Verification </Yellow>}
{status === "blocked" && <Red badge> Account Blocked </Red>}
```

#### 10.6.2 MyProductsScreen

**File:** [mobile-app/src/screens/producer/MyProductsScreen.js](../mobile-app/src/screens/producer/MyProductsScreen.js)

**Purpose:** View and manage producer's own product listings

**Features:**
- List of all producer's products
- Sort by:
  - Date added (newest first)
  - Price (high to low)
  - Sold out status

- Filter by:
  - Category
  - Active/Sold Out
  - Price range

- Product card shows:
  - Thumbnail image
  - Product name
  - Unit price
  - Category
  - Sold out status
  - Action buttons

- Actions per product:
  - Edit (name, price, category)
  - Toggle Sold Out
  - Delete product
  - View analytics

**API Calls:**
```javascript
GET /api/v1/products/producer/{producerId}
PUT /api/v1/products/{productId}
PUT /api/v1/products/{productId}/sold-out
DELETE /api/v1/products/{productId}
```

#### 10.6.3 AddProductScreen

**File:** [mobile-app/src/screens/producer/AddProductScreen.js](../mobile-app/src/screens/producer/AddProductScreen.js)

**Purpose:** Create new product listings

**Features:**
- Form fields:
  - Product name (text input)
  - Category (picker: Vegetables, Fruits, Herbal, Rice)
  - Unit price (number input in LKR)
  - Unit type (picker: kg, bundle, piece, dozen, etc.)
  - Description (text area, optional)
  - Product images (picker)

- Upload workflow:
  - Select 1+ product images
  - Upload to Cloudinary via cloudinaryUpload.js
  - Display preview
  - Submit form with image URLs

**Image Upload:**
```javascript
import ImagePicker from 'react-native-image-picker'

const handleSelectImage = () => {
  ImagePicker.launchImageLibrary({
    mediaType: 'photo',
    count: 5  // Allow up to 5 images
  }, (response) => {
    // Upload each image to Cloudinary
    uploadToCloudinary(response)
  })
}
```

**API Call:**
```javascript
POST /api/v1/products
{
  "name": "Fresh Tomatoes",
  "category": "Vegetables",
  "unitPrice": 150,
  "unitType": "kg",
  "imageUrls": ["https://res.cloudinary.com/..."]
}
```

**Validation:**
- Product name required (min 3 chars)
- Category required
- Price required (> 0)
- At least 1 image required
- No special characters in name

#### 10.6.4 AccountSettingsScreen

**File:** [mobile-app/src/screens/producer/AccountSettingsScreen.js](../mobile-app/src/screens/producer/AccountSettingsScreen.js)

**Purpose:** Manage producer profile and account settings

**Features:**
- Edit producer information:
  - Store title
  - Business phone
  - Mobile phone
  - Email
  - Operating hours
  - Business address
  - Location GPS

- Change password

- Logout

- Delete account (with confirmation)

**Settings Form:**
```javascript
{
  "storeTitle": "John's Fresh Farm",
  "businessPhone": "+94771234567",
  "mobilePhone": "+94772234567",
  "startTime": "06:00",
  "endTime": "18:00",
  "storeAddress": "123 Farm Lane, Kandy",
  "latitude": 6.9271,
  "longitude": 80.7744
}
```

### 10.7 Authentication Flow

#### Registration
```
1. User fills RegisterScreen form
   - First name, last name
   - Email, password
   - NIC number
   - Business phone
   - Store title
   - District, address

2. Select NIC photo from device
   - react-native-image-picker

3. Upload NIC to Cloudinary
   - cloudinaryUpload.js

4. POST /api/v1/auth/register
   {
     "firstName": "...",
     "email": "...",
     "password": "...",
     "nicPhotoUrl": "https://res.cloudinary.com/...",
     ...
   }

5. Backend returns JWT token

6. Save token to AsyncStorage
   localStorage.setItem('jwt_token', token)

7. Set AuthContext state: authenticat = true, role = "PRODUCER"

8. Status: "pending" (waiting admin verification)
```

#### Login
```
1. User enters email & password on LoginScreen

2. POST /api/v1/auth/login
   { "email": "...", "password": "..." }

3. Backend validates credentials, returns JWT

4. Save JWT to AsyncStorage

5. Backend returns user + role

6. Set AuthContext: authenticated = true, role = determined

7. Navigation updates: show appropriate screens
```

### 10.8 React Context (AuthContext)

**File:** [mobile-app/src/context/AuthContext.js](../mobile-app/src/context/AuthContext.js)

**Stored State:**
```javascript
{
  user: {
    id: "",
    email: "",
    firstName: "",
    role: "PRODUCER" | "BUYER",
    verificationStatus: "pending" | "verified" | "blocked"
  },
  token: "",                                 // JWT
  isAuthenticated: false,
  isLoading: false,
  error: null
}
```

**Context Methods:**
```javascript
const {
  user,
  token,
  isAuthenticated,
  login,
  register,
  logout,
  updateUser,
  clearError
} = useContext(AuthContext)
```

### 10.9 API Layer

**Axios Instance:** [mobile-app/src/api/axiosInstance.js](../mobile-app/src/api/axiosInstance.js)

```javascript
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const instance = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 5000
})

// Auto-attach JWT to all requests
instance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**API Modules:**
- [authApi.js](../mobile-app/src/api/authApi.js) - Login, register, validate token
- [producerApi.js](../mobile-app/src/api/producerApi.js) - Producer CRUD
- [productApi.js](../mobile-app/src/api/productApi.js) - Product search, create, update
- [analyticsApi.js](../mobile-app/src/api/analyticsApi.js) - Lead tracking
- [cloudinaryUpload.js](../mobile-app/src/api/cloudinaryUpload.js) - Image upload

### 10.10 Development & Testing

**Start Development:**
```bash
cd mobile-app/
npm install
npm start
# Expo CLI opens, choose:
# - 'a' for Android
# - 'i' for iOS
# - 'w' for web
```

**Run on Android:**
```bash
npm run android
# Or via Expo CLI
```

**Run on iOS:**
```bash
npm run ios
# Or via Expo CLI
```

**Run Tests:**
```bash
npm test
# Runs Jest tests in __tests__/ folder
```

**Build for Production (EAS):**
```bash
eas build --platform android
eas build --platform ios
```

### 10.11 Key Reusable Components

| Component | Purpose |
|-----------|---------|
| [AlertBox.js](../mobile-app/src/components/AlertBox.js) | Display error/success messages |
| [AppButton.js](../mobile-app/src/components/AppButton.js) | Branded button component |
| [AppInput.js](../mobile-app/src/components/AppInput.js) | Branded text input |
| [ProductCard.js](../mobile-app/src/components/ProductCard.js) | Product display card |
| [VerificationBanner.js](../mobile-app/src/components/VerificationBanner.js) | Status banner |

### 10.12 Related Mobile App Files

| File | Purpose |
|------|---------|
| [package.json](../mobile-app/package.json) | Dependencies & scripts |
| [app.json](../mobile-app/app.json) | Expo configuration |
| [App.tsx](../mobile-app/App.tsx) | Root component |
| [android/](../mobile-app/android/) | Android native project |
| [ios/](../mobile-app/ios/) | iOS native project |
| [src/navigation/](../mobile-app/src/navigation/) | Navigation setup |
| [src/screens/](../mobile-app/src/screens/) | Screen components |
| [src/api/](../mobile-app/src/api/) | API layer |
| [src/context/AuthContext.js](../mobile-app/src/context/AuthContext.js) | Auth state |

---

## Deployment & Operations

### Docker Compose Orchestration

**File:** [docker-compose.yml](../docker-compose.yml)

**Services:**
1. **MongoDB** - Data persistence
2. **Backend** - Spring Boot API
3. **Admin Web** - React admin dashboard

**Start All Services:**
```bash
docker-compose up -d
```

**Check Status:**
```bash
docker-compose ps
```

**View Logs:**
```bash
docker-compose logs -f backend
```

**Stop All Services:**
```bash
docker-compose down
```

---

## Summary

**Lanka Agri-Direct** is a full-stack agricultural marketplace with:

✅ **Three-tier architecture** - Web, Mobile, Backend, Database  
✅ **Verified producer system** - NIC + bank verification gate  
✅ **Role-based access** - Producers, Buyers, Admins  
✅ **GPS-based discovery** - Location-aware product search  
✅ **Cloud storage** - Cloudinary for all images  
✅ **Immutable audits** - Append-only action tracking  
✅ **JWT security** - Stateless token authentication  
✅ **No payments** - Physical transactions only  

**Technologies:** Spring Boot, MongoDB, React Native, React, Docker, Cloudinary, JWT

---

**End of Report**

*Report Generated: May 19, 2026*  
*Project Version: 1.0*  
*Analyst: GitHub Copilot*
