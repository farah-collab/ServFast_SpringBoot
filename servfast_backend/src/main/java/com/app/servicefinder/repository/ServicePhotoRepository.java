package com.app.servicefinder.repository;
 
import com.app.servicefinder.model.ServicePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository
public interface ServicePhotoRepository extends JpaRepository<ServicePhoto, Long> {
    List<ServicePhoto> findByServiceId(Long serviceId);
    void deleteByServiceId(Long serviceId);
}