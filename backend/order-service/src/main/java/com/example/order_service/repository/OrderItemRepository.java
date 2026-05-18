package com.example.order_service.repository;

import com.example.order_service.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Find all items for a specific order
    List<OrderItem> findByOrderId(Long orderId);

    // Find all items for a specific medicine
    List<OrderItem> findByMedicineId(Long medicineId);
}


