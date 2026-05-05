# SRS: Lanka Agri-Direct System (v1.0)

## 1. Introduction

### 1.1 Purpose

- The primary purpose of Lanka-Agri Direct is to establish a direct-to-consumer (D2C) marketplace that removes intermediaries from the agricultural supply chain.
- The system aims to solve two major problems
  - high retail prices for consumers
  - low profit margins for producers

### 1.2 Scope

- Development of a mobile-responsive React Native application for producers and buyers.
- Stock management and digital reservation for four specific categories,
  - Herbal Products
  - Vegetables
  - Fruits
  - Rice
- Support for two physical fulfillment methods,
  - Self-Pickup
  - Cash on Delivery (COD)
- Admin dashboard for,
  - User management
  - Content moderation

## 2. User Roles

1. Producer (Farmer) - adds and manage products
2. Buyer (consumer) - find product and contact seller
3. System User

- Admin - manage system, manage moderators, verify system operations
- Moderator - manage products and producers, verify products and producers

## 3. Functional Requirements (FR)

### 3.1 Producers Requirements

ID | Feature | Requirement Description
:--- | :--- | :---
FR-01 | Inventory Tracking | Ability to synchronize real time between database and storage.
FR-02 | Unit-Based Pricing Management | Farmers can define how they sell an item.
FR-03 | Account Creation | Ability to register and create account.
FR-04 | User Authentication | Ability to log in and verify account.
FR-05 | Account Update | Ability to update account details.
FR-06 | Account Deletion | Ability to delete account and user details.
FR-07 | Connectivity | Ability to notify user about internet disconnectivity (internet required).

### 3.2 Buyers' Requirements

ID | Feature | Requirement Description
:--- | :--- | :---
FR-08 | Nationalwide Search | Ability to search and filter products by category, district, and proximity using GPS
FR-09 | Contact Access | Ability to view the producer's business phone number and collection address for direct contact.
FR-10 | Map Discovery | Ability to view producer locations on a map for easier physical navigation.
FR-11 | Local Bookmarking | Ability to "Star" or bookmark a producer's store. These records are stored exclusively in the mobile device's local storage (App Data) for quick access without a user account.

### 3.3 Admin Requirements

ID | Feature | Requirement Description
:--- | :--- | :---
FRA-01 | User Management | Ability to approve or block Farmer accounts to ensure platform trust.
FRA-02 | Category Management | Ability to add, edit, or hide product categories.
FRA-03 | Content Moderation | Ability to remove improper or misleading product listings or images.
FRA-04 | System Reports | Ability to view total active users, total successful reservations, and total sales volume.
FRA-05 | Notification Management | Ability to send system-wide announcements to all users.
FRA-06 | Audit Management | Ability review system log details and user activity details.

## 4. Non-Functional Requirements (NFR)

ID | Feature | Requirement Description
:--- | :--- | :---
NFR-01 | Usability | Using large buttons, clear icons, and minimal typing to accommodate users.
NFR-02 | Mobile-First Design | The React frontend must be fully responsive and performant on mobile devices.
NFR-03 | Performance | The system must load quickly.
NFR-04 | Reliability & Availability | The system needs to be available 24/7. The system must be up so they can list their stock immediately.
NFR-05 | Scalability | Ability to handle growing user base.
NFR-06 | Data Security | Protecting the phone numbers and locations of farmers and consumers.

## 5. Data Requirements (DR)

ID | Entity | Key Attributes
:--- | :--- | :---
DR-01 | User-Producer | producerId, firstName, lastName, nic, nicPhotoUrl, profilePictureUrl, businessPhone, mobilePhone, email(opt), storeTitle, operatingDays(array), startTime, endTime, latitude, longitude, locationDescription, homeAddress, storeAddress, district, province, gnDivision, businessType, verificationStatus, password, isDeleted, createdAt, modifiedAt
DR-02 | Producer Bank Details | detailId, producerId, accountHolderName, bankName, branchCode, accountNumber (Encrypted)
DR-03 | Product | productId, producerId, name, category, description, unitPrice, unitType, imageUrls, isSoldOut(bool), productStatus (active, suspended), isDeleted, createdAt, modifiedAt
DR-04 | Lead Analytics | leadId, productId, producerId, timestamp, actionType (e.g., "Clicked Call", "Viewed Address")
DR-05 | Admin | adminId, name, username, password, isDeleted, createdAt, modifiedAt
DR-06 | Audit Log-Admin | adminId, action, description, performedAt
DR-07 | Audit-Producer | producerId, action, description, performedAt
DR-08 | Local Store Data | (Client-Side Only): producerId, storeTitle, profilePictureUrl, timestampAdded. (Stored in device local storage; subject to deletion upon clearing app data).

## 6. Constraints

ID | Description
:--- | :---
C-01 | The system must be developed using React Native (Frontend), Spring Boot (Backend), and MongoDB (Database).
C-02 | The user interface is strictly limited to English, which may affect accessibility for non-English speaking users in the region.
C-03 | The platform is localized exclusively for Sri Lanka.
C-04 | It does not process financial transactions between buyers and sellers, meaning "Buyer Protection" or "Refunds" cannot be managed digitally.
C-05 | A "Verified Account" constraint is mandatory. Producers are strictly prohibited from posting any products until their account status is manually switched to verified by an Admin after reviewing their NIC and profile details.

## 7. Assumptions

ID | Description
:--- | :---
A-01 | It is assumed that producers have access to a stable internet connection and a smartphone capable of uploading high-resolution images of their harvest and NIC.
A-02 | The system assumes that producers will manually toggle the "Sold Out" button immediately after a physical sale to maintain the accuracy of the marketplace.
A-03 | It is assumed that the platform complies with the Personal Data Protection Act (PDPA) of Sri Lanka, specifically regarding the storage of NIC photos and encrypted bank details.
A-04 | It is assumed that the Grama Niladhari (GN) division provided by the producer is accurate and matches the location of the produce for collection.
A-05 | It is assumed that buyers understand that bookmarked producers will be lost if they clear their mobile application data or uninstall the app.
