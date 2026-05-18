package com.example.order_service.service;

import com.example.common.dto.CreateOrderRequest;
import com.example.order_service.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public interface OrderService {

    /**
     * Create a new order
     * @param request Order creation request with userId and items
     * @return Created order
     */
    Order createOrder(CreateOrderRequest request);

    /**
     * Get order by ID
     * @param id Order ID
     * @return Order object
     */
    Order getOrderById(Long id);

    /**
     * Get all orders with pagination
     * @param pageable Pagination parameters
     * @return Page of orders
     */
    Page<Order> getAllOrders(Pageable pageable);

    /**
     * Get orders by status with pagination
     * @param status Order status
     * @param pageable Pagination parameters
     * @return Page of orders
     */
    Page<Order> getOrdersByStatus(String status, Pageable pageable);

    /**
     * Get orders by user ID with pagination
     * @param userId User ID
     * @param pageable Pagination parameters
     * @return Page of orders
     */
    Page<Order> getOrdersByUserId(Long userId, Pageable pageable);

    /**
     * Update order status
     * @param id Order ID
     * @param status New status
     * @return Updated order
     */
    Order updateOrderStatus(Long id, String status);

    /**
     * Cancel order
     * @param id Order ID
     */
    void cancelOrder(Long id);

    /**
     * Get purchase history for a user within date range
     * @param userId User ID
     * @param startDate Start date
     * @param endDate End date
     * @return List of orders
     */
    List<Order> getPurchaseHistory(Long userId, LocalDateTime startDate, LocalDateTime endDate);
}


