package com.app.servicefinder.repository;

import com.app.servicefinder.model.Enterprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnterpriseRepository extends JpaRepository<Enterprise, Long> {

    List<Enterprise> findBySectorIgnoreCase(String sector);

    List<Enterprise> findByCityIgnoreCase(String city);
}