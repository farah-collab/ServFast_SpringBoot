package com.app.servicefinder.controller;

import com.app.servicefinder.dto.EnterpriseDTO;
import com.app.servicefinder.service.EnterpriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enterprises")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EnterpriseController {

    private final EnterpriseService enterpriseService;

    // GET /api/enterprises
    @GetMapping
    public ResponseEntity<List<EnterpriseDTO>> getAllEnterprises() {
        return ResponseEntity.ok(enterpriseService.getAllEnterprises());
    }

    // GET /api/enterprises/by-sector?sector=Tech
    @GetMapping("/by-sector")
    public ResponseEntity<List<EnterpriseDTO>> getBySector(@RequestParam String sector) {
        return ResponseEntity.ok(enterpriseService.getBySector(sector));
    }

    // GET /api/enterprises/by-city?city=Paris
    @GetMapping("/by-city")
    public ResponseEntity<List<EnterpriseDTO>> getByCity(@RequestParam String city) {
        return ResponseEntity.ok(enterpriseService.getByCity(city));
    }

    // POST /api/enterprises
    @PostMapping
    public ResponseEntity<EnterpriseDTO> createEnterprise(@RequestBody EnterpriseDTO dto) {
        return ResponseEntity.ok(enterpriseService.createEnterprise(dto));
    }

    // DELETE /api/enterprises/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnterprise(@PathVariable Long id) {
        enterpriseService.deleteEnterprise(id);
        return ResponseEntity.noContent().build();
    }
}