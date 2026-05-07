package com.example.lankaagridirect.Controllers;

import com.example.lankaagridirect.DTOs.response.MapProducerResponse;
import com.example.lankaagridirect.Services.ProducerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/map")
public class MapController {

    private final ProducerService producerService;

    public MapController(ProducerService producerService) {
        this.producerService = producerService;
    }

    @GetMapping("/producers")
    public ResponseEntity<List<MapProducerResponse>> getProducerLocations(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(producerService.getProducerLocationsForMap(district, province, category));
    }
}
