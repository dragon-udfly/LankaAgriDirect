# Lanka Agri-Direct (v1.0)

Lanka Agri-Direct is a **Verified Direct-to-Consumer (D2C) Directory** designed to connect small-scale farmers and home gardeners across Sri Lanka directly with consumers. By establishing an account-level verification gate, the platform fosters a high-trust environment where buyers can find fresh produce without intermediaries.

## System Architecture

The platform utilizes a **Three-Tier Architecture** optimized for different user roles and device capabilities:

* **User Interface (Mobile):** Built with **React Native** for Producers (on-the-go stock management) and Buyers (location-based discovery).
* **Admin Interface (Web):** Built with **React** for a desktop-optimized verification and moderation experience.
* **Backend Application:** Powered by **Spring Boot (Java)** to handle business logic, security, and Lead Analytics.
* **Data Tier:** **MongoDB (NoSQL)** for flexible agricultural data storage and nationwide geospatial indexing.

## 🚀 Key Features

### For Buyers (Anonymous)

* **Nationwide Discovery:** Search for fresh produce across all 25 districts of Sri Lanka using GPS proximity filters.
* **Direct Connect:** View verified producer contact details and collection addresses for physical transactions.
* **Local Favorites:** "Star" or bookmark producers to your phone's **local storage** for quick access (no account required).
* **National Map:** Interactive location-based view of verified farm stalls.

### For Producers (Verified Farmers)

* **Verification Gate:** Mandatory registration requiring NIC and bank detail uploads for Admin approval before listing privileges are granted.
* **Instant Listing:** Once account verification is complete, product listings go live immediately without further fees or manual audits.
* **Sold Out Toggle:** A simple manual switch to instantly hide a listing from the public feed once physical stock is depleted.

### For Admins & Moderators

* **Verification Dashboard:** A dedicated web portal to review producer identity documents and verify accounts.
* **Role-Based Access (RBAC):** Distinct permissions for "Admin" (system reports/user management) and "Moderator" (content moderation/verification) roles.
* **Audit Logging:** An append-only system to track all administrative actions for security and transparency.

## Tech Stack

* **Frontend:** React Native (Mobile), React (Web)
* **Backend:** Spring Boot (Java)
* **Database:** MongoDB
* **Security:** JWT Authentication, BCrypt Password Hashing
* **Storage:** Localized App Data (AsyncStorage) for Buyer favorites

## Data Categories

The platform manages four primary agricultural categories:

1. **Herbal Products**
2. **Vegetables**
3. **Fruits**
4. **Rice**

## Constraints & Assumptions

* **Language:** The interface is in **English**.
* **Payments:** No digital payment processing; all transactions are physical (Cash/COD).
* **Data Integrity:** Relies on producers manually updating their "Sold Out" status.
* **Localization:** Geographically constrained to Sri Lanka.
