package com.app.servicefinder.repository;

import com.app.servicefinder.model.serviceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceProviderRepository extends JpaRepository<serviceProvider, Long> {
}
