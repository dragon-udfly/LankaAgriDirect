package com.example.lankaagridirect.Controllers;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.lankaagridirect.DTOs.request.AddEmailRequest;
import com.example.lankaagridirect.DTOs.request.AnnouncementRequest;
import com.example.lankaagridirect.DTOs.request.BlockProducerRequest;
import com.example.lankaagridirect.DTOs.request.CategoryRequest;
import com.example.lankaagridirect.DTOs.request.ChangePasswordRequest;
import com.example.lankaagridirect.DTOs.request.CreateAdminRequest;
import com.example.lankaagridirect.DTOs.request.SuspendProductRequest;
import com.example.lankaagridirect.DTOs.response.AnalyticsResponse;
import com.example.lankaagridirect.DTOs.response.ApiResponse;
import com.example.lankaagridirect.DTOs.response.ProducerAdminResponse;
import com.example.lankaagridirect.DTOs.response.ProductStatsResponse;
import com.example.lankaagridirect.DTOs.response.UserStatsResponse;
import com.example.lankaagridirect.Models.AuditLog;
import com.example.lankaagridirect.Models.Category;
import com.example.lankaagridirect.Models.ProducerAuditLog;
import com.example.lankaagridirect.Models.Product;
import com.example.lankaagridirect.Services.AdminService;
import com.example.lankaagridirect.Services.AnalyticsService;
import com.example.lankaagridirect.Services.AuditLogService;
import com.example.lankaagridirect.Services.CategoryService;
import com.example.lankaagridirect.Services.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final AuditLogService auditLogService;
    private final AnalyticsService analyticsService;

    public AdminController(AdminService adminService, ProductService productService,
                           CategoryService categoryService, AuditLogService auditLogService,
                           AnalyticsService analyticsService) {
        this.adminService = adminService;
        this.productService = productService;
        this.categoryService = categoryService;
        this.auditLogService = auditLogService;
        this.analyticsService = analyticsService;
    }

    // ─── Producer Management ──────────────────────────────────────────────────
    @GetMapping("/producers")
    public ResponseEntity<Page<ProducerAdminResponse>> getAllProducers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(adminService.getAllProducers(status, district, page, limit));
    }

    @GetMapping("/producers/{id}")
    public ResponseEntity<ProducerAdminResponse> getProducerById(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getProducerById(id));
    }

    @PutMapping("/producers/{id}/verify")
    public ResponseEntity<ApiResponse> verifyProducer(@PathVariable String id, Authentication auth) {
        adminService.verifyProducer(id, (String) auth.getPrincipal());
        return ResponseEntity.ok(new ApiResponse("Producer verified successfully."));
    }

    @PutMapping("/producers/{id}/block")
    public ResponseEntity<ApiResponse> blockProducer(@PathVariable String id, Authentication auth,
                                                      @Valid @RequestBody BlockProducerRequest req) {
        adminService.blockProducer(id, (String) auth.getPrincipal(), req.getReason());
        return ResponseEntity.ok(new ApiResponse("Producer blocked successfully."));
    }

    @PutMapping("/producers/{id}/unblock")
    public ResponseEntity<ApiResponse> unblockProducer(@PathVariable String id, Authentication auth) {
        adminService.unblockProducer(id, (String) auth.getPrincipal());
        return ResponseEntity.ok(new ApiResponse("Producer unblocked successfully."));
    }

    @DeleteMapping("/producers/{id}")
    public ResponseEntity<ApiResponse> deleteProducer(@PathVariable String id, Authentication auth) {
        adminService.deleteProducer(id, (String) auth.getPrincipal());
        return ResponseEntity.ok(new ApiResponse("Producer deleted successfully."));
    }

    @GetMapping("/producers/{id}/audit-logs")
    public ResponseEntity<Page<ProducerAuditLog>> getProducerLogs(
            @PathVariable String id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(auditLogService.getProducerLogs(id, PageRequest.of(page - 1, limit)));
    }

    // ─── Category Management ──────────────────────────────────────────────────
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAll());
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse> createCategory(Authentication auth,
                                                       @Valid @RequestBody CategoryRequest req) {
        String id = categoryService.create(req);
        auditLogService.logAdminAction((String) auth.getPrincipal(), "CREATE_CATEGORY",
                "Created category: " + req.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Category created successfully.", id));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse> updateCategory(@PathVariable String id, Authentication auth,
                                                       @Valid @RequestBody CategoryRequest req) {
        categoryService.update(id, req);
        auditLogService.logAdminAction((String) auth.getPrincipal(), "UPDATE_CATEGORY",
                "Updated category ID: " + id);
        return ResponseEntity.ok(new ApiResponse("Category updated successfully."));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable String id, Authentication auth) {
        categoryService.delete(id);
        auditLogService.logAdminAction((String) auth.getPrincipal(), "DELETE_CATEGORY",
                "Deleted category ID: " + id);
        return ResponseEntity.ok(new ApiResponse("Category deleted successfully."));
    }

    // ─── Content Moderation ───────────────────────────────────────────────────
    @GetMapping("/products")
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(productService.adminGetAllProducts(status, category, page, limit));
    }

    @PutMapping("/products/{id}/suspend")
    public ResponseEntity<ApiResponse> suspendProduct(@PathVariable String id, Authentication auth,
                                                       @Valid @RequestBody SuspendProductRequest req) {
        productService.suspendProduct(id);
        auditLogService.logAdminAction((String) auth.getPrincipal(), "SUSPEND_PRODUCT",
                "Suspended product ID: " + id + ". Reason: " + req.getReason());
        return ResponseEntity.ok(new ApiResponse("Product suspended successfully."));
    }

    @PutMapping("/products/{id}/activate")
    public ResponseEntity<ApiResponse> activateProduct(@PathVariable String id, Authentication auth) {
        productService.activateProduct(id);
        auditLogService.logAdminAction((String) auth.getPrincipal(), "ACTIVATE_PRODUCT",
                "Activated product ID: " + id);
        return ResponseEntity.ok(new ApiResponse("Product activated successfully."));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable String id, Authentication auth) {
        String adminId = (String) auth.getPrincipal();
        productService.deleteProduct(id, adminId, "ADMIN");
        auditLogService.logAdminAction(adminId, "DELETE_PRODUCT", "Deleted product ID: " + id);
        return ResponseEntity.ok(new ApiResponse("Product deleted successfully."));
    }

    // ─── Reports ──────────────────────────────────────────────────────────────
    @GetMapping("/reports/users")
    public ResponseEntity<UserStatsResponse> getUserStats() {
        return ResponseEntity.ok(adminService.getUserStats());
    }

    @GetMapping("/reports/products")
    public ResponseEntity<ProductStatsResponse> getProductStats() {
        return ResponseEntity.ok(adminService.getProductStats());
    }

    @GetMapping("/reports/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalyticsSummary(
            @RequestParam(required = false) String producerId) {
        return ResponseEntity.ok(analyticsService.getProducerAnalytics(
                producerId != null ? producerId : ""));
    }

    // ─── Audit Logs ───────────────────────────────────────────────────────────
    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @RequestParam(required = false) String adminId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(auditLogService.getAdminLogs(adminId, null, null,
                PageRequest.of(page - 1, limit)));
    }

    // ─── Announcements (placeholder — extend with FCM/push later) ────────────
    @PostMapping("/announcements")
    public ResponseEntity<ApiResponse> sendAnnouncement(Authentication auth,
                                                         @Valid @RequestBody AnnouncementRequest req) {
        auditLogService.logAdminAction((String) auth.getPrincipal(), "SEND_ANNOUNCEMENT",
                "Sent announcement: '" + req.getTitle() + "' to roles: " + req.getTargetRoles());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Announcement recorded. Push notification service integration pending."));
    }

    // ─── Admin Account Management ─────────────────────────────────────────────
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(Authentication auth,
                                                       @Valid @RequestBody ChangePasswordRequest req) {
        adminService.changeAdminPassword((String) auth.getPrincipal(), 
                req.getCurrentPassword(), req.getNewPassword());
        return ResponseEntity.ok(new ApiResponse("Password changed successfully."));
    }

    @PostMapping("/add-email")
    public ResponseEntity<ApiResponse> addEmail(Authentication auth,
                                                 @Valid @RequestBody AddEmailRequest req) {
        adminService.addAdminEmail((String) auth.getPrincipal(), req.getEmail());
        return ResponseEntity.ok(new ApiResponse("Email added successfully. Please verify your email."));
    }

    @PostMapping("/create-admin")
    public ResponseEntity<ApiResponse> createAdmin(Authentication auth,
                                                    @Valid @RequestBody CreateAdminRequest req) {
        String newAdminId = adminService.createNewAdmin((String) auth.getPrincipal(),
                req.getName(), req.getEmail(), req.getPassword(), req.getRole());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Admin created successfully.", newAdminId));
    }
}
