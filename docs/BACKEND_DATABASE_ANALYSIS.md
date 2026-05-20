# Lanka Agri-Direct Database Design Analysis

## Database Type
**MongoDB (NoSQL)** - Document-based, scalable database perfect for semi-structured agricultural product data.

---

## Entities Overview

### 1. **Producer** (Collection: `producers`)
**Purpose**: Stores agricultural producer/farmer accounts and profile information

**Key Attributes**:
- **Identity**: `id` (ObjectId), `nic` (National ID - unique), `email` (unique)
- **Personal Info**: `firstName`, `lastName`, `profilePictureUrl`
- **Authentication**: `password` (hashed), `businessPhone`, `mobilePhone`
- **Business Info**: `storeTitle`, `businessType` (small-scale or home-gardener)
- **Operating Hours**: `operatingDays` (array), `startTime`, `endTime`
- **Location**: 
  - `latitude`, `longitude` (for mapping)
  - `homeAddress`, `storeAddress`
  - `locationDescription`
  - `district`, `province` (indexed for searching)
  - `gnDivision` (Grama Niladhari Division - Sri Lankan administrative unit)
- **NIC Photos**: `nicPhotoUrl` (stored as JSON array: [front_url, back_url])
- **Status**: `verificationStatus` (pending → verified/blocked), `isDeleted`
- **Timestamps**: `createdAt`, `modifiedAt`

**Indexes**:
- `nic` (unique)
- `email` (unique, sparse)
- `district`, `province` (for regional filtering)
- `verificationStatus` (for admin workflows)

---

### 2. **Product** (Collection: `products`)
**Purpose**: Stores agricultural product listings created by producers

**Key Attributes**:
- **Identity**: `id` (ObjectId), `producerId` (FK to Producer)
- **Product Details**: `name`, `description`
- **Category**: `category` (stored as string, indexed)
- **Pricing**: `unitPrice` (Double), `unitType` (kg, piece, liter, etc.)
- **Images**: `imageUrls` (List of URLs from Cloudinary)
- **Status**: 
  - `isSoldOut` (Boolean)
  - `productStatus` (active or suspended)
  - `isDeleted` (soft delete)
- **Timestamps**: `createdAt`, `modifiedAt`

**Relationship**: One Producer → Many Products (1-N)

**Indexes**:
- `producerId` (find products by producer)
- `category` (filter by type)
- `productStatus` (show only active products)

---

### 3. **Category** (Collection: `categories`)
**Purpose**: Master list of product categories for filtering and organization

**Key Attributes**:
- **Identity**: `id` (ObjectId)
- **Data**: `name` (category name), `isActive` (Boolean)
- **Timestamp**: `createdAt`

**Supported Categories**: Vegetables, Fruits, Herbal Products, Rice, Fish, Meat

---

### 4. **Admin** (Collection: `admins`)
**Purpose**: System administrator and moderator accounts for platform management

**Key Attributes**:
- **Identity**: `id` (ObjectId)
- **Authentication**: `username` (unique), `email` (unique), `password` (hashed)
- **Profile**: `name`, `role` (Admin or Moderator)
- **Status**: `isDeleted`
- **Timestamps**: `createdAt`, `modifiedAt`

**Roles**:
- **Admin**: Full access to all platform functions
- **Moderator**: Limited access (verification, blocking producers)

---

### 5. **AuditLog** (Collection: `admin_audit_logs`)
**Purpose**: Immutable append-only log of all admin actions for compliance

**Key Attributes**:
- **Identity**: `id` (ObjectId)
- **Reference**: `adminId` (FK to Admin, indexed)
- **Action Details**: 
  - `action` (ACTION_TYPE: VERIFY_PRODUCER, BLOCK_PRODUCER, UNBLOCK_PRODUCER, DELETE_PRODUCER)
  - `description` (human-readable details)
- **Timestamp**: `performedAt` (when action was taken)

**Important**: 
- Append-only collection
- No updates or deletes allowed
- Ensures data integrity and compliance

**Common Actions**:
- `VERIFY_PRODUCER` - Admin verified a new producer
- `BLOCK_PRODUCER` - Blocked a producer account
- `UNBLOCK_PRODUCER` - Restored a blocked account
- `DELETE_PRODUCER` - Permanently deleted a producer

---

### 6. **ProducerAuditLog** (Collection: `producer_audit_logs`)
**Purpose**: Immutable append-only log of producer self-actions

**Key Attributes**:
- **Identity**: `id` (ObjectId)
- **Reference**: `producerId` (FK to Producer, indexed)
- **Action Details**:
  - `action` (ACTION_TYPE)
  - `description` (human-readable details)
- **Timestamp**: `performedAt` (when action was taken)

**Important**: 
- Append-only collection
- No updates or deletes allowed

**Common Actions**:
- `CREATE_PRODUCT` - Producer created a new product
- `UPDATE_PRODUCT` - Producer updated product details
- `DELETE_PRODUCT` - Producer deleted a product
- `TOGGLE_SOLD_OUT` - Product marked as sold out/available
- `UPDATE_PROFILE` - Producer updated profile information
- `UPDATE_LOCATION` - Producer changed location

---

### 7. **LeadAnalytic** (Collection: `lead_analytics`)
**Purpose**: Track buyer interactions with producers for analytics and insights

**Key Attributes**:
- **Identity**: `id` (ObjectId)
- **Reference**: `producerId` (FK to Producer, indexed)
- **Interaction Data**:
  - `actionType` (clicked_call, viewed_address)
  - `buyerDeviceId` (device identifier for anonymous tracking)
  - `timestamp` (when interaction occurred)

**Use Cases**:
- Track popular producers
- Monitor call/inquiry volume per producer
- Provide producers with lead insights
- Analyze buyer behavior patterns

**Tracking Methods**:
- Anonymous tracking using device ID
- No personal data collection for buyers
- Privacy-compliant analytics

---

## Database Relationships

```
Producer (1) ──── (Many) Product
   └─────────────────────────────────────┐
                                         ├──(Many) LeadAnalytic
Admin (1)   ──── (Many) AuditLog         │
                                         └──(Many) ProducerAuditLog
```

---

## Key Design Decisions

### 1. **NoSQL Choice (MongoDB)**
- **Why**: Semi-structured data (dynamic product types, varying attributes)
- **Benefits**: 
  - Flexible schema for different agricultural products
  - Horizontal scalability
  - Better performance for reads (most operations)
  - Document-based storage suits the domain

### 2. **Soft Deletes vs Hard Deletes**
- **Implemented**: `isDeleted` flag on Producer and Product
- **Reason**: 
  - Preserves referential integrity
  - Allows recovery if needed
  - Maintains audit trail

### 3. **Append-Only Audit Logs**
- **Why**: 
  - Compliance and regulatory requirements
  - Data integrity guarantee
  - Immutable history for accountability
  - Cannot be tampered with

### 4. **Embedded NIC Photos (JSON Array)**
- **Storage**: Stored as JSON array in producer documents `[frontUrl, backUrl]`
- **Hosts**: Images uploaded to Cloudinary (third-party service)
- **Why**: 
  - Easy to validate KYC (Know Your Customer)
  - Quick access without additional DB queries

### 5. **Geographic Indexing**
- **Fields**: `district`, `province`, `latitude`, `longitude`
- **Use**: Regional filtering, location-based searches, map functionality
- **Limitation**: MongoDB 2dsphere index could be used for geo queries if added

### 6. **Verification Workflow**
- **States**: pending → verified/blocked
- **Process**:
  1. Producer registers → status = "pending"
  2. Admin reviews NIC photos and info
  3. Admin approves → status = "verified"
  4. Or blocks → status = "blocked" (with reason in AuditLog)

---

## Data Integrity & Constraints

| Field | Constraint | Reason |
|-------|-----------|--------|
| `Producer.nic` | Unique | National identity must be unique |
| `Producer.email` | Unique, Sparse | One account per email |
| `Admin.username` | Unique | Login credential must be unique |
| `AdminAuditLog` | Append-only | Compliance requirement |
| `ProducerAuditLog` | Append-only | Activity tracking |

---

## Performance Considerations

### Indexes for Common Queries:
1. **Find products by producer**: `Product.producerId`
2. **Find verified producers**: `Producer.verificationStatus`
3. **Filter by region**: `Producer.district`, `Producer.province`
4. **Product filtering**: `Product.category`, `Product.productStatus`
5. **Audit tracking**: `AuditLog.adminId`, `ProducerAuditLog.producerId`

### Query Examples:
```javascript
// Find all verified producers in a district
db.producers.find({ 
  verificationStatus: "verified", 
  district: "Colombo" 
})

// Find products by category
db.products.find({ 
  category: "Vegetables", 
  productStatus: "active",
  isDeleted: false
})

// Get producer activity log
db.producer_audit_logs.find({ 
  producerId: "123456" 
}).sort({ performedAt: -1 })

// Track buyer interactions
db.lead_analytics.find({ 
  producerId: "123456", 
  actionType: "clicked_call" 
})
```

---

## Scalability & Future Enhancements

### Current Limitations:
- Geographic queries limited (no geospatial indexes implemented)
- No product ratings/reviews collection
- No transactions (critical for order management if scaling to e-commerce)

### Recommended Enhancements:
1. **Add Transactions Collection** - If moving toward e-commerce
2. **Add Reviews Collection** - Buyer feedback and ratings
3. **Add Geospatial Indexes** - For efficient location-based queries
4. **Implement Change Streams** - For real-time analytics
5. **Add Caching Layer** - Redis for frequently accessed data

---

## Security Measures

1. **Password Hashing**: All passwords hashed before storage
2. **JWT Authentication**: Used for API authentication
3. **Soft Deletes**: Prevent accidental data loss
4. **Audit Trails**: Complete activity logging for compliance
5. **Role-Based Access Control**: Admin vs Moderator roles
6. **Input Validation**: Prevent injection attacks
7. **CORS Configuration**: Restrict cross-origin requests

---

## Summary Statistics

| Entity | Purpose | Count (Estimated) |
|--------|---------|-------------------|
| Producer | Agricultural sellers | Thousands |
| Product | Listings | Hundreds of thousands |
| Category | Classification | ~10-15 |
| Admin | Platform management | Tens |
| AuditLog | Admin actions log | Grows daily |
| ProducerAuditLog | Activity tracking | Grows continuously |
| LeadAnalytic | Buyer interactions | Millions (high volume) |

---

**Database Type**: MongoDB (NoSQL)  
**Version**: Spring Data MongoDB  
**Environment**: Docker-based deployment  
**Backup**: Recommended daily snapshots
