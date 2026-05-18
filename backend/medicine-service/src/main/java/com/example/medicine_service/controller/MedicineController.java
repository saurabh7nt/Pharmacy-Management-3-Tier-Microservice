package com.example.medicine_service.controller;

import com.example.common.dto.ApiResponse;
import com.example.medicine_service.entity.Medicine;
import com.example.medicine_service.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    /**
     * POST /api/medicines - Add new medicine
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Medicine>> createMedicine(@Valid @RequestBody Medicine medicine) {
        Medicine createdMedicine = medicineService.createMedicine(medicine);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdMedicine));
    }

    /**
     * GET /api/medicines/{id} - Get medicine by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Medicine>> getMedicineById(@PathVariable Long id) {
        Medicine medicine = medicineService.getMedicineById(id);
        return ResponseEntity.ok(ApiResponse.success(medicine));
    }

    /**
     * GET /api/medicines - Get all medicines with pagination and optional category filter
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllMedicines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Medicine> medicinePage;
        
        if (category != null && !category.trim().isEmpty()) {
            medicinePage = medicineService.getMedicinesByCategory(category, pageable);
        } else {
            medicinePage = medicineService.getAllMedicines(pageable);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("medicines", medicinePage.getContent());
        response.put("currentPage", medicinePage.getNumber());
        response.put("totalItems", medicinePage.getTotalElements());
        response.put("totalPages", medicinePage.getTotalPages());
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PUT /api/medicines/{id} - Update medicine
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Medicine>> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody Medicine medicine) {
        Medicine updatedMedicine = medicineService.updateMedicine(id, medicine);
        return ResponseEntity.ok(ApiResponse.success(updatedMedicine));
    }

    /**
     * DELETE /api/medicines/{id} - Delete medicine
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok(ApiResponse.success("Medicine deleted successfully"));
    }

    /**
     * PATCH /api/medicines/{id}/stock - Update stock
     * Request body: {"quantity": 10, "operation": "ADD"} or {"quantity": 5, "operation": "SUBTRACT"}
     */
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<Medicine>> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> stockUpdate) {
        
        Integer quantity = (Integer) stockUpdate.get("quantity");
        String operation = (String) stockUpdate.get("operation");
        
        if (quantity == null || operation == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Both 'quantity' and 'operation' are required"));
        }
        
        Medicine updatedMedicine = medicineService.updateStock(id, quantity, operation);
        return ResponseEntity.ok(ApiResponse.success(updatedMedicine));
    }

    /**
     * GET /api/medicines/low-stock - Get low stock items
     */
    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<Medicine>>> getLowStockMedicines(
            @RequestParam(defaultValue = "10") Integer threshold) {
        List<Medicine> lowStockMedicines = medicineService.getLowStockMedicines(threshold);
        return ResponseEntity.ok(ApiResponse.success(lowStockMedicines));
    }

    /**
     * GET /api/medicines/search - Search medicines
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Medicine>>> searchMedicines(
            @RequestParam String keyword) {
        List<Medicine> medicines = medicineService.searchMedicines(keyword);
        return ResponseEntity.ok(ApiResponse.success(medicines));
    }
}


