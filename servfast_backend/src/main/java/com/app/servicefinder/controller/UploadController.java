package com.app.servicefinder.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    // Dans application.properties : app.upload-dir=uploads
    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    /**
     * POST /api/upload
     * Reçoit un fichier image, le sauvegarde sur le disque,
     * retourne { "url": "/uploads/nom-du-fichier.jpg" }
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("file") MultipartFile file) throws IOException {

        // Vérifier le type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Seules les images sont acceptées."));
        }

        // Vérifier la taille (5 Mo max)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "L'image ne doit pas dépasser 5 Mo."));
        }

        // Créer le dossier si inexistant
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Générer un nom unique
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;

        // Sauvegarder le fichier
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retourner l'URL relative
        String url = "/uploads/" + fileName;
        return ResponseEntity.ok(Map.of("url", url));
    }
}