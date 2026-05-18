package com.example.medicine_service.repository;

import com.example.medicine_service.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    // Find medicines by category
    List<Medicine> findByCategory(String category);

    // Find medicines with quantity less than or equal to threshold
    List<Medicine> findByQuantityLessThanEqual(Integer threshold);

    // Search medicines by name or description containing keyword (case-insensitive)
    @Query("SELECT m FROM Medicine m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Medicine> searchByKeyword(@Param("keyword") String keyword);

    // Find available medicines
    List<Medicine> findByAvailableTrue();
}


