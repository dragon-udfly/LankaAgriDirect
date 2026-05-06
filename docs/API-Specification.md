# Lanka Agri-Direct API Specification

**Version:** 1.0  
**Last Updated:** 2026-05-06  
**Based On:** SRS.md v1.0

---

## 1. Introduction

### 1.1 Purpose

This document defines the RESTful API specification for the Lanka Agri-Direct backend, enabling communication between the React Native mobile application (Producer, Buyer, Admin) and the Spring Boot server with MongoDB database.

### 1.2 Scope

- **Authentication**: JWT-based stateless authentication
- **Roles**: Producer, Buyer (Anonymous), Admin
- **Base URL**: `http://localhost:8080/api/v1`
- **Format**: JSON

---

## 2. Authentication & Authorization

### 2.1 Authentication Method

- **Type**: JWT (JSON Web Token)
- **Token Lifetime**: 7 days (configurable)
- **Header**: `Authorization: Bearer <token>`

### 2.2 User Roles

| Role | Abbreviation | Description |
|------|--------------|-------------|
| Producer | `PRODUCER` | Registered farmer who adds/manages products |
| Buyer | `BUYER` | Anonymous user who searches/contacts producers |
| Admin | `ADMIN` | System administrator for verification & moderation |

### 2.3 Password Requirements

- Minimum 8 characters
- Stored as BCrypt hash

---

## 3. Data Models

### 3.1 Producer (User)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Auto | MongoDB ObjectId |
| `firstName` | String | Yes | Producer's first name |
| `lastName` | String | Yes | Producer's last name |
| `nic` | String | Yes | National Identity Card number |
| `nicPhotoUrl` | String | Yes | URL to NIC image |
| `profilePictureUrl` | String | No | URL to profile image |
| `businessPhone` | String | Yes | Business contact number |
| `mobilePhone` | String | No | Alternative mobile number |
| `email` | String | No | Email address (optional) |
| `storeTitle` | String | Yes | Store name/display title |
| `operatingDays` | Array | Yes | Days of week (e.g., ["Mon","Tue"]) |
| `startTime` | String | Yes | Opening time (e.g., "08:00") |
| `endTime` | String | Yes | Closing time (e.g., "18:00") |
| `latitude` | Double | Yes | GPS latitude |
| `longitude` | Double | Yes | GPS longitude |
| `locationDescription` | String | No | Additional location info |
| `homeAddress` | String | Yes | Home address |
| `storeAddress` | String | No | Collection point address |
| `district` | String | Yes | Sri Lanka district |
| `province` | String | Yes | Sri Lanka province |
| `gnDivision` | String | Yes | Grama Niladhari division |
| `businessType` | String | Yes | "small-scale" or "home-gardener" |
| `verificationStatus` | String | Auto | "pending", "verified", "blocked" |
| `password` | String | Yes | BCrypt hashed |
| `isDeleted` | Boolean | Auto | Soft delete flag |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `modifiedAt` | DateTime | Auto | Last modified timestamp |

### 3.2 Product

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Auto | MongoDB ObjectId |
| `producerId` | String | Yes | Reference to Producer |
| `name` | String | Yes | Product name |
| `category` | String | Yes | Category enum |
| `description` | String | No | Product description |
| `unitPrice` | Double | Yes | Price per unit |
| `unitType` | String | Yes | Unit (e.g., "kg", "bundle", "piece") |
| `imageUrls` | Array | No | Array of image URLs |
| `isSoldOut` | Boolean | Auto | Sold out status |
| `productStatus` | String | Auto | "active", "suspended" |
| `isDeleted` | Boolean | Auto | Soft delete flag |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `modifiedAt` | DateTime | Auto | Last modified timestamp |

### 3.3 Category

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Auto | MongoDB ObjectId |
| `name` | String | Yes | Category name |
| `isActive` | Boolean | Auto | Visibility flag |
| `createdAt` | DateTime | Auto | Creation timestamp |

**Default Categories:**

1. Herbal Products
2. Vegetables
3. Fruits
4. Rice
5. Fish
6. Meat

### 3.4 Admin

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Auto | MongoDB ObjectId |
| `name` | String | Yes | Admin name |
| `username` | String | Yes | Unique username |
| `password` | String | Yes | BCrypt hashed |
| `isDeleted` | Boolean | Auto | Soft delete flag |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `modifiedAt` | DateTime | Auto | Last modified timestamp |

### 3.5 Lead Analytics

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Auto | MongoDB ObjectId |
| `producerId` | String | Yes | Reference to Producer |
| `timestamp` | DateTime | Auto | Event timestamp |
| `actionType` | String | Yes | "clicked_call" or "viewed_address" |
| `buyerDeviceId` | String | No | Anonymous device identifier |

### 3.6 Audit Log

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Auto | MongoDB ObjectId |
| `adminId` | String | Yes | Reference to Admin |
| `action` | String | Yes | Action type |
| `description` | String | Yes | Detailed description |
| `performedAt` | DateTime | Auto | Timestamp |

### 3.7 Producer Audit Log

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | Auto | MongoDB ObjectId |
| `producerId` | String | Yes | Reference to Producer |
| `action` | String | Yes | Action type |
| `description` | String | Yes | Detailed description |
| `performedAt` | DateTime | Auto | Timestamp |

---

## 4. API Endpoints

### 4.1 Authentication

#### 4.1.1 Register Producer

```
POST /auth/register/producer
```

**Request Body:**

```json
{
  "firstName": "string",
  "lastName": "string",
  "nic": "string",
  "nicPhotoUrl": "string",
  "businessPhone": "string",
  "mobilePhone": "string",
  "email": "string",
  "storeTitle": "string",
  "operatingDays": ["string"],
  "startTime": "string",
  "endTime": "string",
  "latitude": number,
  "longitude": number,
  "locationDescription": "string",
  "homeAddress": "string",
  "storeAddress": "string",
  "district": "string",
  "province": "string",
  "gnDivision": "string",
  "businessType": "string",
  "password": "string"
}
```

**Response (201):**

```json
{
  "message": "Registration successful. Pending verification.",
  "producerId": "string"
}
```

---

#### 4.1.2 Register Admin (First Time Only)

```
POST /auth/register/admin
```

**Request Body:**

```json
{
  "name": "string",
  "username": "string",
  "password": "string"
}
```

**Response (201):**

```json
{
  "message": "Admin created successfully",
  "adminId": "string"
}
```

---

#### 4.1.3 Login

```
POST /auth/login
```

**Request Body:**

```json
{
  "loginId": "string",
  "password": "string"
}
```

**Response (200):**

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "role": "PRODUCER | ADMIN"
  }
}
```

---

#### 4.1.4 Get Current User

```
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "id": "string",
  "name": "string",
  "role": "PRODUCER | ADMIN",
  "verificationStatus": "string"
}
```

---

#### 4.1.5 Update Profile

```
PUT /auth/profile
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (Partial update - fields to update)

```json
{
  "firstName": "string",
  "businessPhone": "string",
  "storeTitle": "string"
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully"
}
```

---

#### 4.1.6 Delete Account

```
DELETE /auth/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "message": "Account deleted successfully"
}
```

---

### 4.2 Products

#### 4.2.1 Get All Products (Public)

```
GET /products
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by category |
| `district` | string | No | Filter by district |
| `province` | string | No | Filter by province |
| `lat` | number | No | User latitude |
| `lng` | number | No | User longitude |
| `radius` | number | No | Search radius in km |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |
| `search` | string | No | Search by product name |

**Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "producerId": "string",
      "producerName": "string",
      "producerDistrict": "string",
      "name": "string",
      "category": "string",
      "description": "string",
      "unitPrice": number,
      "unitType": "string",
      "imageUrls": ["string"],
      "isSoldOut": false,
      "distance": 5.2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

#### 4.2.2 Get Product by ID (Public)

```
GET /products/{id}
```

**Response (200):**

```json
{
  "id": "string",
  "producerId": "string",
  "producerName": "string",
  "producerStoreTitle": "string",
  "producerDistrict": "string",
  "producerProvince": "string",
  "producerAddress": "string",
  "producerPhone": "string",
  "producerLatitude": number,
  "producerLongitude": number,
  "name": "string",
  "category": "string",
  "description": "string",
  "unitPrice": number,
  "unitType": "string",
  "imageUrls": ["string"],
  "isSoldOut": false,
  "createdAt": "datetime"
}
```

---

#### 4.2.3 Create Product (Producer Only - Verified)

```
POST /products
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Producer (verificationStatus = "verified")

**Request Body:**

```json
{
  "name": "string",
  "category": "string",
  "description": "string",
  "unitPrice": number,
  "unitType": "string",
  "imageUrls": ["string"]
}
```

**Response (201):**

```json
{
  "message": "Product created successfully",
  "productId": "string"
}
```

---

#### 4.2.4 Update Product (Producer Only - Own Products)

```
PUT /products/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Producer (only their own products)

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "unitPrice": number,
  "imageUrls": ["string"]
}
```

**Response (200):**

```json
{
  "message": "Product updated successfully"
}
```

---

#### 4.2.5 Toggle Sold Out (Producer Only - Own Products)

```
PUT /products/{id}/sold-out
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Producer (only their own products)

**Request Body:**

```json
{
  "isSoldOut": true
}
```

**Response (200):**

```json
{
  "message": "Product marked as sold out"
}
```

---

#### 4.2.6 Delete Product (Producer/Admin)

```
DELETE /products/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Producer (own products only) or Admin

**Response (200):**

```json
{
  "message": "Product deleted successfully"
}
```

---

### 4.3 Producers (Public Discovery)

#### 4.3.1 Get Verified Producers (Public)

```
GET /producers
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `district` | string | No | Filter by district |
| `province` | string | No | Filter by province |
| `category` | string | No | Filter by product category |
| `lat` | number | No | User latitude |
| `lng` | number | No | User longitude |
| `radius` | number | No | Search radius in km |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "storeTitle": "string",
      "profilePictureUrl": "string",
      "district": "string",
      "province": "string",
      "operatingDays": ["string"],
      "startTime": "string",
      "endTime": "string",
      "distance": 5.2
    }
  ],
  "pagination": {}
}
```

---

#### 4.3.2 Get Producer Details (Public)

```
GET /producers/{id}
```

**Response (200):**

```json
{
  "id": "string",
  "storeTitle": "string",
  "profilePictureUrl": "string",
  "businessPhone": "string",
  "homeAddress": "string",
  "storeAddress": "string",
  "district": "string",
  "province": "string",
  "gnDivision": "string",
  "businessType": "string",
  "operatingDays": ["string"],
  "startTime": "string",
  "endTime": "string",
  "latitude": number,
  "longitude": number,
  "verificationStatus": "verified",
  "createdAt": "datetime"
}
```

---

#### 4.3.3 Get Producer Products (Public)

```
GET /producers/{id}/products
```

**Query Parameters:** `?includeSoldOut=false`

**Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "unitPrice": number,
      "unitType": "string",
      "imageUrls": ["string"],
      "isSoldOut": false
    }
  ]
}
```

---

### 4.4 Admin - Producer Management

#### 4.4.1 Get All Producers (Admin)

```
GET /admin/producers
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Query Parameters:**

- `status`: pending | verified | blocked
- `district`: string
- `page`, `limit`: pagination

**Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "storeTitle": "string",
      "firstName": "string",
      "lastName": "string",
      "businessPhone": "string",
      "email": "string",
      "district": "string",
      "verificationStatus": "pending",
      "createdAt": "datetime"
    }
  ],
  "pagination": {}
}
```

---

#### 4.4.2 Get Producer Details (Admin)

```
GET /admin/producers/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Response (200):**

```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "nic": "string",
  "nicPhotoUrl": "string",
  "profilePictureUrl": "string",
  "businessPhone": "string",
  "mobilePhone": "string",
  "email": "string",
  "storeTitle": "string",
  "homeAddress": "string",
  "storeAddress": "string",
  "district": "string",
  "province": "string",
  "gnDivision": "string",
  "businessType": "string",
  "verificationStatus": "pending",
  "createdAt": "datetime",
  "modifiedAt": "datetime"
}
```

---

#### 4.4.3 Verify Producer (Admin)

```
PUT /admin/producers/{id}/verify
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Response (200):**

```json
{
  "message": "Producer verified successfully"
}
```

---

#### 4.4.4 Block Producer (Admin)

```
PUT /admin/producers/{id}/block
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Request Body:**

```json
{
  "reason": "string"
}
```

**Response (200):**

```json
{
  "message": "Producer blocked successfully"
}
```

---

#### 4.4.5 Unblock Producer (Admin)

```
PUT /admin/producers/{id}/unblock
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Response (200):**

```json
{
  "message": "Producer unblocked successfully"
}
```

---

#### 4.4.6 Delete Producer (Admin)

```
DELETE /admin/producers/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Response (200):**

```json
{
  "message": "Producer deleted successfully"
}
```

---

### 4.5 Admin - Category Management

#### 4.5.1 Get All Categories (Admin)

```
GET /admin/categories
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "isActive": true,
      "createdAt": "datetime"
    }
  ]
}
```

---

#### 4.5.2 Create Category (Admin)

```
POST /admin/categories
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Request Body:**

```json
{
  "name": "string"
}
```

**Response (201):**

```json
{
  "message": "Category created successfully",
  "categoryId": "string"
}
```

---

#### 4.5.3 Update Category (Admin)

```
PUT /admin/categories/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Request Body:**

```json
{
  "name": "string",
  "isActive": true
}
```

**Response (200):**

```json
{
  "message": "Category updated successfully"
}
```

---

#### 4.5.4 Delete Category (Admin)

```
DELETE /admin/categories/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Response (200):**

```json
{
  "message": "Category deleted successfully"
}
```

---

### 4.6 Admin - Content Moderation

#### 4.6.1 Get All Products (Admin)

```
GET /admin/products
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Query Parameters:**

- `status`: active | suspended
- `category`: string
- `producerId`: string

**Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "producerId": "string",
      "producerStoreTitle": "string",
      "name": "string",
      "category": "string",
      "productStatus": "active",
      "createdAt": "datetime"
    }
  ]
}
```

---

#### 4.6.2 Suspend Product (Admin)

```
PUT /admin/products/{id}/suspend
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Request Body:**

```json
{
  "reason": "string"
}
```

**Response (200):**

```json
{
  "message": "Product suspended successfully"
}
```

---

#### 4.6.3 Activate Product (Admin)

```
PUT /admin/products/{id}/activate
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Response (200):**

```json
{
  "message": "Product activated successfully"
}
```

---

#### 4.6.4 Delete Product (Admin)

```
DELETE /admin/products/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Response (200):**

```json
{
  "message": "Product deleted successfully"
}
```

---

### 4.7 Admin - System Reports

#### 4.7.1 Get User Statistics

```
GET /admin/reports/users
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Response (200):**

```json
{
  "totalProducers": 150,
  "verifiedProducers": 120,
  "pendingProducers": 20,
  "blockedProducers": 10,
  "totalAdmins": 5
}
```

---

#### 4.7.2 Get Product Statistics

```
GET /admin/reports/products
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Response (200):**

```json
{
  "totalProducts": 500,
  "activeProducts": 450,
  "soldOutProducts": 30,
  "suspendedProducts": 20,
  "byCategory": {
    "Vegetables": 200,
    "Fruits": 150,
    "Herbal Products": 80,
    "Rice": 50,
    "Fish": 15,
    "Meat": 5
  }
}
```

---

#### 4.7.3 Get Analytics Summary

```
GET /admin/reports/analytics
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Query Parameters:** `?startDate=2026-01-01&endDate=2026-05-06`

**Response (200):**

```json
{
  "totalCallClicks": 2500,
  "totalAddressViews": 1800,
  "topProducers": [
    {
      "producerId": "string",
      "storeTitle": "string",
      "totalLeads": 150
    }
  ],
  "byDistrict": {
    "Colombo": 500,
    "Kandy": 300,
    "Galle": 200
  }
}
```

---

### 4.8 Admin - Announcements

#### 4.8.1 Send Announcement

```
POST /admin/announcements
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Request Body:**

```json
{
  "title": "string",
  "message": "string",
  "targetRoles": ["PRODUCER", "BUYER"]
}
```

**Response (201):**

```json
{
  "message": "Announcement sent successfully"
}
```

---

### 4.9 Admin - Audit Logs

#### 4.9.1 Get All Audit Logs

```
GET /admin/audit-logs
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Query Parameters:**

- `adminId`: string
- `startDate`, `endDate`: date range
- `page`, `limit`: pagination

**Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "adminId": "string",
      "adminName": "string",
      "action": "VERIFY_PRODUCER",
      "description": "Verified producer John Doe",
      "performedAt": "datetime"
    }
  ]
}
```

---

#### 4.9.2 Get Producer Activity Logs

```
GET /admin/producers/{id}/audit-logs
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Admin only

**Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "producerId": "string",
      "action": "CREATE_PRODUCT",
      "description": "Created product 'Fresh Mango'",
      "performedAt": "datetime"
    }
  ]
}
```

---

### 4.10 Analytics (Public/Anonymous)

#### 4.10.1 Track Call Click

```
POST /analytics/call
```

**Request Body:**

```json
{
  "producerId": "string",
  "deviceId": "string"
}
```

**Response (200):**

```json
{
  "message": "Click recorded"
}
```

---

#### 4.10.2 Track Address View

```
POST /analytics/address
```

**Request Body:**

```json
{
  "producerId": "string",
  "deviceId": "string"
}
```

**Response (200):**

```json
{
  "message": "View recorded"
}
```

---

#### 4.10.3 Get Producer Analytics (Producer/Admin)

```
GET /analytics/producer/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Access:** Producer (own) or Admin

**Response (200):**

```json
{
  "producerId": "string",
  "totalCallClicks": 120,
  "totalAddressViews": 80,
  "dailyStats": [
    {
      "date": "2026-05-01",
      "calls": 10,
      "addressViews": 8
    }
  ]
}
```

---

### 4.11 Map Discovery (Public)

#### 4.11.1 Get Producer Locations for Map

```
GET /map/producers
```

**Query Parameters:**

- `district`: string
- `province`: string
- `category`: string

**Response (200):**

```json
{
  "data": [
    {
      "producerId": "string",
      "storeTitle": "string",
      "latitude": number,
      "longitude": number,
      "district": "string",
      "category": "string",
      "productCount": 5
    }
  ]
}
```

---

## 5. Error Responses

### 5.1 Standard Error Format

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

### 5.2 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate entry) |
| 422 | Validation Error |
| 500 | Internal Server Error |

### 5.3 Common Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Token expired |
| `AUTH_003` | Account not verified |
| `AUTH_004` | Account blocked |
| `PRODUCER_001` | Producer not found |
| `PRODUCER_002` | Cannot create products - not verified |
| `PRODUCT_001` | Product not found |
| `PRODUCT_002` | Not authorized to modify this product |
| `ADMIN_001` | Unauthorized access |
| `VALIDATION_001` | Invalid input data |

---

## 6. Security Requirements

### 6.1 Authentication

- JWT tokens with 7-day expiration
- Refresh token rotation (optional)
- Password stored as BCrypt hash

### 6.2 Role-Based Access Control (RBAC)

| Endpoint | Producer | Buyer | Admin |
|----------|----------|-------|-------|
| `GET /products` | ✓ | ✓ | ✓ |
| `POST /products` | ✓ (verified only) | ✗ | ✗ |
| `PUT /products/{id}` | Own only | ✗ | ✗ |
| `PUT /products/{id}/sold-out` | Own only | ✗ | ✗ |
| `GET /admin/*` | ✗ | ✗ | ✓ |
| `PUT /admin/producers/*` | ✗ | ✗ | ✓ |
| `POST /analytics/*` | ✓ | ✓ | ✓ |

### 6.3 Rate Limiting (Recommended)

- Authentication: 5 requests/minute
- Public endpoints: 60 requests/minute
- Admin endpoints: 30 requests/minute

---

## 7. Pagination & Filtering

### 7.1 Pagination Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

### 7.2 Pagination Response

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 8. Appendix

### 8.1 Sri Lanka Districts

Colombo, Kandy, Galle, Matara, Kurunegala, Puttalam, Anuradhapura, Polonnaruwa, Badulla, Monaragala, Hambantota, Jaffna, Kilinochchi, Mannar, Mullaitivu, Vanni, Trincomalee, Batticaloa, Ampara, Kalmunai, Ratnapura, Nuwara Eliya, Kegalle, Gampaha

### 8.2 Sri Lanka Provinces

Western, Central, Southern, Northern, Eastern, North-Central, Uva, Sabaragamuwa

### 8.3 Business Types

- "small-scale"
- "home-gardener"

### 8.4 Categories

1. Herbal Products
2. Vegetables
3. Fruits
4. Rice
5. Fish
6. Meat

---

**End of API Specification**
