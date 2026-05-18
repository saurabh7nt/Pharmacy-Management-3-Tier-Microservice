package com.example.medicine_service.service;

import com.example.medicine_service.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface MedicineService {

    /**
     * Add a new medicine to the inventory
     * @param medicine Medicine object to be added
     * @return Created medicine
     */
    Medicine createMedicine(Medicine medicine);

    /**
     * Get medicine by ID
     * @param id Medicine ID
     * @return Medicine object
     */
    Medicine getMedicineById(Long id);

    /**
     * Get all medicines with pagination
     * @param pageable Pagination parameters
     * @return Page of medicines
     */
    Page<Medicine> getAllMedicines(Pageable pageable);

    /**
     * Get all medicines by category with pagination
     * @param category Medicine category
     * @param pageable Pagination parameters
     * @return Page of medicines
     */
    Page<Medicine> getMedicinesByCategory(String category, Pageable pageable);

    /**
     * Update medicine details
     * @param id Medicine ID
     * @param medicine Updated medicine object
     * @return Updated medicine
     */
    Medicine updateMedicine(Long id, Medicine medicine);

    /**
     * Delete medicine by ID
     * @param id Medicine ID
     */
    void deleteMedicine(Long id);

    /**
     * Update medicine stock quantity
     * @param id Medicine ID
     * @param quantity Quantity to add or subtract
     * @param operation Operation type: "ADD" or "SUBTRACT"
     * @return Updated medicine
     */
    Medicine updateStock(Long id, Integer quantity, String operation);

    /**
     * Get medicines with low stock
     * @param threshold Stock threshold
     * @return List of medicines with low stock
     */
    List<Medicine> getLowStockMedicines(Integer threshold);

    /**
     * Search medicines by keyword
     * @param keyword Search keyword
     * @return List of matching medicines
     */
    List<Medicine> searchMedicines(String keyword);
}


