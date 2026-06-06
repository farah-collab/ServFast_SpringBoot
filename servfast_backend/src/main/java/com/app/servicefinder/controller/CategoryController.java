package com.app.servicefinder.controller;
 
import com.app.servicefinder.model.Category;
import com.app.servicefinder.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
 
    private final CategoryRepository categoryRepository;
 
    // GET /api/categories
    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }
 
    // POST /api/categories  (admin only - à sécuriser plus tard)
    @PostMapping
    public ResponseEntity<Category> create(@RequestBody Category category) {
        if (category.getName() != null) {
            java.util.Optional<Category> existing = categoryRepository.findByNameIgnoreCase(category.getName().trim());
            if (existing.isPresent()) {
                return ResponseEntity.ok(existing.get());
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryRepository.save(category));
    }
}