package com.example.medicine_service.serviceImpl;

import com.example.common.exception.ResourceNotFoundException;
import com.example.medicine_service.entity.Medicine;
import com.example.medicine_service.repository.MedicineRepository;
import com.example.medicine_service.service.MedicineService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineServiceImpl(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @Override
    public Medicine createMedicine(Medicine medicine) {
        // Set timestamps
        medicine.setId(null); // Ensure new entity
        medicine.setCreatedAt(LocalDateTime.now());
        medicine.setUpdatedAt(LocalDateTime.now());
        
        // Set availability based on quantity
        medicine.setAvailable(medicine.getQuantity() != null && medicine.getQuantity() > 0);
        
        return medicineRepository.save(medicine);
    }

    @Override
    @Transactional(readOnly = true)
    public Medicine getMedicineById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Medicine> getAllMedicines(Pageable pageable) {
        return medicineRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Medicine> getMedicinesByCategory(String category, Pageable pageable) {
        List<Medicine> medicines = medicineRepository.findByCategory(category);
        
        // Convert List to Page
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), medicines.size());
        
        List<Medicine> pageContent = medicines.subList(start, end);
        return new PageImpl<>(pageContent, pageable, medicines.size());
    }

    @Override
    public Medicine updateMedicine(Long id, Medicine medicine) {
        Medicine existingMedicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));

        // Update fields
        existingMedicine.setName(medicine.getName());
        existingMedicine.setDescription(medicine.getDescription());
        existingMedicine.setPrice(medicine.getPrice());
        existingMedicine.setQuantity(medicine.getQuantity());
        existingMedicine.setCategory(medicine.getCategory());
        existingMedicine.setManufacturer(medicine.getManufacturer());
        existingMedicine.setExpiryDate(medicine.getExpiryDate());
        existingMedicine.setUpdatedAt(LocalDateTime.now());
        
        // Update availability based on quantity
        existingMedicine.setAvailable(medicine.getQuantity() != null && medicine.getQuantity() > 0);

        return medicineRepository.save(existingMedicine);
    }

    @Override
    public void deleteMedicine(Long id) {
        Medicine existingMedicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));

        medicineRepository.delete(existingMedicine);
    }

    @Override
    public Medicine updateStock(Long id, Integer quantity, String operation) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));

        Integer currentQuantity = medicine.getQuantity() != null ? medicine.getQuantity() : 0;
        Integer newQuantity;

        if ("ADD".equalsIgnoreCase(operation)) {
            newQuantity = currentQuantity + quantity;
        } else if ("SUBTRACT".equalsIgnoreCase(operation)) {
            newQuantity = currentQuantity - quantity;
            if (newQuantity < 0) {
                throw new IllegalArgumentException("Insufficient stock. Current quantity: " + currentQuantity);
            }
        } else {
            throw new IllegalArgumentException("Invalid operation. Use 'ADD' or 'SUBTRACT'");
        }

        medicine.setQuantity(newQuantity);
        medicine.setAvailable(newQuantity > 0);
        medicine.setUpdatedAt(LocalDateTime.now());

        return medicineRepository.save(medicine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Medicine> getLowStockMedicines(Integer threshold) {
        if (threshold == null || threshold < 0) {
            threshold = 10; // Default threshold
        }
        return medicineRepository.findByQuantityLessThanEqual(threshold);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Medicine> searchMedicines(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return medicineRepository.findAll();
        }
        return medicineRepository.searchByKeyword(keyword.trim());
    }
}


