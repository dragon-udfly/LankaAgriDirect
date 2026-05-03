# System Description: Lanka Agri-Direct (v1.0)

## 1. System Overview

### 1.1 Purpose

Lanka Agri-Direct is a **Verified Direct-to-Consumer (D2C) Directory** designed to bridge the gap between small-scale producers and consumers across Sri Lanka. The platform facilitates trust by manually verifying producer identities and listing fees, allowing farmers to earn higher margins while providing consumers with direct access to fresh, local produce.

### 1.2 System Details

* **System Name:** Lanka Agri-Direct
* **Version:** 1.0
* **Operational Model:** Verified Directory & Lead Generation
* **Tech Stack:**
  * **User Interface (Mobile):** React Native (Producers & Anonymous Buyers)
  * **Admin Interface (Web):** React Desktop Browser (Admins & Moderators)
  * **Backend Application:** Spring Boot - Java
  * **Database Management:** MongoDB (NoSQL)

## 2. Core Objectives

1. **Verified Connectivity:** Establishing a high-trust environment by ensuring every producer is vetted via NIC and bank details before listing.
2. **Lead Generation:** Connecting buyers directly to producers through business contact details and physical location mapping.
3. **Inventory Transparency:** Providing a real-time "Sold Out" mechanism for farmers to manage stock visibility immediately after physical sales.
4. **Market Decentralization:** Empowering home gardeners and small-scale farmers with a digital storefront that reaches a national audience.

## 3. Product Categories

The platform focuses on four specific agricultural categories to maintain data quality:

1. **Herbal Products:** Bundles, dried herbs, and traditional varieties.
2. **Vegetables:** Seasonal local produce.
3. **Fruits:** Fresh local harvests.
4. **Rice:** Samba, Nadu, and heirloom varieties.

## 4. Operational Workflow

### 4.1 For Consumers (Anonymous Buyers)

* **No-Login Discovery:** Buyers search products by category and proximity (GPS) without creating an account.
* **Direct Contact:** The app displays the producer's business phone number and collection address for physical transaction coordination.
* **Local Bookmarking:** Favorite stores can be "Starred" and saved to the mobile device's **local storage** for quick access.

### 4.2 For Producers (Verified Farmers)

* **Account Verification Gate:** Producers must submit NIC photos and bank details; they cannot list items until an Admin grants "Verified" status.
* **Status Management:** Producers use a toggle to mark items as "Active" or "Sold Out" based on their physical inventory.

### 4.3 Payment & Fulfillment

* All financial transactions occur **physically** between the buyer and producer (Cash at Pickup or COD).
* The platform serves as the information connector and does not handle digital payments.

## 5. System Architecture

The system utilizes a **Three-Tier Architecture** to separate concerns and optimize performance.

1. **Client Tier:**
   * **Mobile (React Native):** Focused on portability for farmers and location-based discovery for buyers.
   * **Web (React):** Focused on data-heavy verification tasks for System Admins.
2. **Application Tier (Spring Boot):** Manages identity verification, listing fee audits, and lead analytics (tracking contact clicks).
3. **Data Tier (MongoDB):** A flexible NoSQL database storing producer profiles, verified listings, and append-only audit logs.
