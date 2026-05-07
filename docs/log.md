# Changelog

## 2026-05-07
- Initialized React Native project (`LankaAgriDirectApp`) inside the `mobile-app` directory using React Native CLI (`npx @react-native-community/cli init`).
- Installed `axios` in the `mobile-app` directory.
- Added `lombok` dependency to the `backend` Spring Boot application (`pom.xml`).
- **Phase 1 — Backend Foundation:**
  - Updated `pom.xml`: added Spring Security, JWT (jjwt 0.12.6), Validation, and Cloudinary dependencies.
  - Updated `application.properties` with full configuration (MongoDB, JWT, Cloudinary, CORS).
  - Refactored `Producer.java` with Lombok `@Data` (reduced 279 → ~55 lines).
  - Created models: `Product`, `Admin`, `Category`, `LeadAnalytic`, `AuditLog`, `ProducerAuditLog`.
  - Created repositories: `ProducerRepository`, `ProductRepository`, `AdminRepository`, `CategoryRepository`, `LeadAnalyticRepository`, `AuditLogRepository`, `ProducerAuditLogRepository`.
- **Phase 2 — Backend API:**
  - Created security layer: `JwtUtil`, `JwtAuthFilter`, `SecurityConfig` (RBAC + CORS).
  - Created exception handling: `GlobalExceptionHandler`, `ResourceNotFoundException`, `AccessDeniedException`, `DuplicateResourceException`, `BusinessRuleException`.
  - Created 11 request DTOs and 8 response DTOs.
  - Created services: `AuthService`, `ProductService`, `ProducerService`, `AdminService`, `CategoryService`, `AnalyticsService`, `AuditLogService`.
  - Created controllers: `AuthController`, `ProductController`, `ProducerController`, `AdminController`, `AnalyticsController`, `MapController`.
  - Replaced placeholder `LADController` with health check endpoint.
- **Phase 3 — Mobile App (React Native):**
  - Installed navigation, AsyncStorage, gesture-handler, reanimated, vector-icons, image-picker packages.
  - Created API layer: `axiosInstance.js`, `authApi.js`, `productApi.js`, `producerApi.js`, `analyticsApi.js`.
  - Created `AuthContext.js` with JWT token persistence via AsyncStorage.
  - Created design token system (`theme/colors.js`) and reusable components: `AppButton`, `AppInput`, `AlertBox`, `ProductCard`, `VerificationBanner`.
  - Created screens: `LoginScreen`, `HomeScreen`, `ProductDetailScreen`, `BookmarksScreen`, `DashboardScreen`, `MyProductsScreen`, `AddProductScreen`.
  - Created navigators: `BuyerNavigator`, `ProducerNavigator`, `AppNavigator`. Updated `App.tsx`.
- **Phase 4 — Admin Web Dashboard (React + Vite + TypeScript):**
  - Scaffolded `admin-web/` using Vite `react-ts` template.
  - Installed `axios`, `recharts`.
  - Created typed API client (`adminApi.ts`) covering all admin endpoints.
  - Created pages: `LoginPage`, `DashboardPage`, `ProducersPage`, `ProductsPage`, `AuditLogsPage`.
  - Created `Sidebar` component, `AuthContext.tsx`, and global CSS design system.
- **Dockerization (Admin Web):**
  - Added `Dockerfile`, `.dockerignore`, and `nginx.conf` to `admin-web/` to containerize the Vite React application.
  - Updated root `docker-compose.yml` to include `admin-web` service alongside backend and mongodb.
- **Fixes & Enhancements:**
  - Updated `axiosInstance.js` in mobile app to dynamically switch API URLs based on `Platform.OS === 'web'`, enabling Expo web browser preview support.
  - Updated `walkthrough.md` with explicit property configurations for `application.properties`.
  - Bumped Node.js version from 18 to 22 in `admin-web/Dockerfile` to satisfy latest Vite requirements.
- **Expo Web Migration (Mobile App):**
  - Converted bare React Native CLI app to an Expo project to support running in a web browser without breaking existing mobile-specific functionality.
  - Aligned dependencies in `package.json` to React Native 0.76.6 and Expo 52 compatible versions, effectively resolving Metro bundler incompatibilities.
  - Added `@expo/metro-runtime` and `react-native-web`.
  - Updated `babel.config.js`, `app.json`, and `metro.config.js` to rely on Expo presets.
  - Set `"main": "expo/AppEntry.js"` in `package.json` to fix blank white screen on web, ensuring proper web DOM initialization.
- **Project Configuration:**
  - Added `docs/log.md` to `.gitignore`.
  - Updated `backend/src/main/resources/application.properties` to use the `SPRING_DATA_MONGODB_URI` environment variable, fixing the "Connection Refused" error between the backend and MongoDB containers.


