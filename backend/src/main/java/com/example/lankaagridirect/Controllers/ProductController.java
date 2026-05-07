package com.example.lankaagridirect.Controllers;

import com.example.lankaagridirect.DTOs.request.ProductCreateRequest;
import com.example.lankaagridirect.DTOs.request.ProductUpdateRequest;
import com.example.lankaagridirect.DTOs.request.SoldOutToggleRequest;
import com.example.lankaagridirect.DTOs.response.ApiResponse;
import com.example.lankaagridirect.DTOs.response.ProductResponse;
import com.example.lankaagridirect.Services.AuditLogService;
import com.example.lankaagridirect.Services.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;
    private final AuditLogService auditLogService;

    public ProductController(ProductService productService, AuditLogService auditLogService) {
        this.productService = productService;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(productService.getAllProducts(category, page, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createProduct(Authentication auth,
                                                      @Valid @RequestBody ProductCreateRequest req) {
        String producerId = (String) auth.getPrincipal();
        String id = productService.createProduct(producerId, req);
        auditLogService.logProducerAction(producerId, "CREATE_PRODUCT", "Created product: " + req.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Product created successfully.", id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateProduct(@PathVariable String id, Authentication auth,
                                                      @Valid @RequestBody ProductUpdateRequest req) {
        String producerId = (String) auth.getPrincipal();
        productService.updateProduct(id, producerId, req);
        auditLogService.logProducerAction(producerId, "UPDATE_PRODUCT", "Updated product ID: " + id);
        return ResponseEntity.ok(new ApiResponse("Product updated successfully."));
    }

    @PutMapping("/{id}/sold-out")
    public ResponseEntity<ApiResponse> toggleSoldOut(@PathVariable String id, Authentication auth,
                                                       @Valid @RequestBody SoldOutToggleRequest req) {
        String producerId = (String) auth.getPrincipal();
        productService.toggleSoldOut(id, producerId, req);
        String status = req.getIsSoldOut() ? "sold out" : "available";
        auditLogService.logProducerAction(producerId, "TOGGLE_SOLD_OUT",
                "Marked product ID: " + id + " as " + status);
        return ResponseEntity.ok(new ApiResponse("Product marked as " + status + "."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable String id, Authentication auth) {
        String actorId = (String) auth.getPrincipal();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        productService.deleteProduct(id, actorId, role);
        auditLogService.logProducerAction(actorId, "DELETE_PRODUCT", "Deleted product ID: " + id);
        return ResponseEntity.ok(new ApiResponse("Product deleted successfully."));
    }
}
