# 🚀 Lanka Agri-Direct: Installation Guide

Welcome to the **Lanka Agri-Direct** project! This guide will walk you through the step-by-step process to set up the complete environment, including Docker, environment variables, the web admin dashboard, and the mobile application.

---

## 1. Prerequisites

Before you begin, please ensure your system has the following installed:
- **Docker & Docker Compose** (for running the database, backend, and admin web)
- **Node.js** (v22+ required for frontend and mobile app)
- **Git** (to clone the repository)

---

## 2. Setting Up Environment Variables

The project requires several environment variables for database connections, JWT authentication, and image storage (Cloudinary). 

> [!IMPORTANT]
> You must create a `.env` file in the **root directory** of the project (`LankaAgriDirect/LankaAgriDirect/.env`) before running any containers.

Create the `.env` file and add the following configuration:

```env
# Database Configuration
SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/lankaagridirect_db

# JWT Security
JWT_SECRET=your_secure_jwt_secret_key_here

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
*Note: Replace the placeholder values with your actual Cloudinary credentials and a secure JWT secret.*

---

## 3. Setting Up the Project via Docker

The easiest way to run the core backend, database, and admin dashboard is via Docker Compose.

1. **Open your terminal** and navigate to the project root directory where the `docker-compose.yml` is located.
2. **Build and start the containers** in detached mode by running the following command:
   ```bash
   docker-compose up -d --build
   ```
3. Docker will download the MongoDB image, build the Spring Boot backend, and build the React Admin web interface. 

> [!TIP]
> The database will automatically seed a default admin user (`admin` / `admin123`) upon initialization.

### Accessing the Applications:
- **Admin Dashboard:** Open your browser and go to [http://localhost:5173](http://localhost:5173)
- **Backend API:** Running on `http://localhost:8080` (API Health Check: `http://localhost:8080/api/v1/health`)
- **MongoDB:** Exposed on port `27017`

---

## 4. Running the Mobile App (Expo)

The mobile application is built using React Native and Expo. It has been configured to support both mobile devices and web browsers.

1. **Navigate to the mobile app directory:**
   ```bash
   cd mobile-app
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Run the mobile app on the web:**
   To launch the mobile interface in your web browser, use the web command:
   ```bash
   npm run web
   ```
   *This will start the Expo development server and open the mobile app UI in your default browser.*

### Fixing Mobile End Issues

If you encounter scrolling issues or UI bugs on the mobile web end, keep the following fixes in mind:
- **Scrolling on Web:** The application uses a custom bounded `Wrapper` and `ScrollView` with `height: '100vh'` to ensure forms (like Register and Account Settings) are scrollable on browsers. If a new screen isn't scrolling, wrap it in a container with bounded height.
- **API Connection:** The `axiosInstance.js` automatically routes API requests to `http://localhost:8080` when run on the web. Ensure your backend Docker container is running before attempting to log in or register.

---

> [!NOTE]
> If you need to stop the Docker containers at any time, simply run `docker-compose down` from the root directory.
