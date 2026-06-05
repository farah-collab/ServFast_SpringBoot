package com.app.servicefinder.service;

import com.app.servicefinder.dto.EnterpriseDTO;
import com.app.servicefinder.model.Enterprise;
import com.app.servicefinder.repository.EnterpriseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnterpriseService {

    private final EnterpriseRepository enterpriseRepository;

    // ── Récupérer toutes les entreprises ──
    public List<EnterpriseDTO> getAllEnterprises() {
        return enterpriseRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Récupérer par secteur ──
    public List<EnterpriseDTO> getBySector(String sector) {
        return enterpriseRepository.findBySectorIgnoreCase(sector)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Récupérer par ville ──
    public List<EnterpriseDTO> getByCity(String city) {
        return enterpriseRepository.findByCityIgnoreCase(city)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Créer une entreprise ──
    public EnterpriseDTO createEnterprise(EnterpriseDTO dto) {
        Enterprise enterprise = Enterprise.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .city(dto.getCity())
                .sector(dto.getSector())
                .logoUrl(dto.getLogoUrl())
                .imageUrl(dto.getImageUrl())
                .websiteUrl(dto.getWebsiteUrl())
                .employeeCount(dto.getEmployeeCount())
                .build();

        return toDTO(enterpriseRepository.save(enterprise));
    }

    // ── Supprimer une entreprise ──
    public void deleteEnterprise(Long id) {
        enterpriseRepository.deleteById(id);
    }

    // ── Mapper Entity → DTO ──
    private EnterpriseDTO toDTO(Enterprise e) {
        return EnterpriseDTO.builder()
                .id(e.getId())
                .name(e.getName())
                .description(e.getDescription())
                .city(e.getCity())
                .sector(e.getSector())
                .logoUrl(e.getLogoUrl())
                .imageUrl(e.getImageUrl())
                .websiteUrl(e.getWebsiteUrl())
                .employeeCount(e.getEmployeeCount())
                .build();
    }
}