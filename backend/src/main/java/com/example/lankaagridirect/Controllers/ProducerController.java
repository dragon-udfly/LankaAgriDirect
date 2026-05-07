package com.example.lankaagridirect.Controllers;

import com.example.lankaagridirect.DTOs.response.MapProducerResponse;
import com.example.lankaagridirect.DTOs.response.ProducerPublicResponse;
import com.example.lankaagridirect.DTOs.response.ProductResponse;
import com.example.lankaagridirect.Services.ProducerService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/producers")
public class ProducerController {

    private final ProducerService producerService;

    public ProducerController(ProducerService producerService) {
        this.producerService = producerService;
    }

    @GetMapping
    public ResponseEntity<Page<ProducerPublicResponse>> getVerifiedProducers(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String province,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(producerService.getVerifiedProducers(district, province, page, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProducerPublicResponse> getProducerDetails(@PathVariable String id) {
        return ResponseEntity.ok(producerService.getProducerDetails(id));
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<List<ProductResponse>> getProducerProducts(
            @PathVariable String id,
            @RequestParam(defaultValue = "false") boolean includeSoldOut) {
        return ResponseEntity.ok(producerService.getProducerProducts(id, includeSoldOut));
    }
}
