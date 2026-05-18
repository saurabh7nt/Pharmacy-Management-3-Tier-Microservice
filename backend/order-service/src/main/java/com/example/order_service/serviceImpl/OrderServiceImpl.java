package com.example.order_service.serviceImpl;

import com.example.common.dto.ApiResponse;
import com.example.common.dto.CreateOrderRequest;
import com.example.common.dto.MedicineResponse;
import com.example.common.dto.OrderItemRequest;
import com.example.common.dto.UserResponse;
import com.example.common.exception.ResourceNotFoundException;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.service.OrderService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final RestClient userServiceRestClient;
    private final RestClient medicineServiceRestClient;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            @Qualifier("userServiceRestClient") RestClient userServiceRestClient,
            @Qualifier("medicineServiceRestClient") RestClient medicineServiceRestClient) {
        this.orderRepository = orderRepository;
        this.userServiceRestClient = userServiceRestClient;
        this.medicineServiceRestClient = medicineServiceRestClient;
    }

    @Override
    public Order createOrder(CreateOrderRequest request) {
        // 1. Validate user exists
        validateUserExists(request.getUserId());

        // 2. Create order
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setStatus("PENDING");
        order.setTotalAmount(BigDecimal.ZERO);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // 3. Process each order item
        for (OrderItemRequest itemRequest : request.getItems()) {
            // Get medicine details and validate stock
            MedicineResponse medicine = getMedicineById(itemRequest.getMedicineId());
            
            // Check if sufficient stock is available
            if (medicine.getQuantity() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException(
                    "Insufficient stock for medicine: " + medicine.getName() +
                    ". Available: " + medicine.getQuantity() + ", Requested: " + itemRequest.getQuantity()
                );
            }

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setMedicineId(itemRequest.getMedicineId());
            orderItem.setMedicineName(medicine.getName());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(medicine.getPrice());
            orderItem.setSubtotal(medicine.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
            
            order.addItem(orderItem);
            orderItems.add(orderItem);
            
            totalAmount = totalAmount.add(orderItem.getSubtotal());

            // Update medicine stock
            updateMedicineStock(itemRequest.getMedicineId(), itemRequest.getQuantity(), "SUBTRACT");
        }

        order.setTotalAmount(totalAmount);
        
        // 4. Save order
        return orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> getOrdersByStatus(String status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Order> getOrdersByUserId(Long userId, Pageable pageable) {
        // Validate user exists
        validateUserExists(userId);
        return orderRepository.findByUserId(userId, pageable);
    }

    @Override
    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        // Validate status transition
        validateStatusTransition(order.getStatus(), status);

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Override
    public void cancelOrder(Long id) {
        Order order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        // Only allow cancellation of PENDING or CONFIRMED orders
        if (!order.getStatus().equals("PENDING") && !order.getStatus().equals("CONFIRMED")) {
            throw new IllegalArgumentException(
                "Cannot cancel order with status: " + order.getStatus()
            );
        }

        // Restore medicine stock
        for (OrderItem item : order.getItems()) {
            updateMedicineStock(item.getMedicineId(), item.getQuantity(), "ADD");
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getPurchaseHistory(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        // Validate user exists
        validateUserExists(userId);

        if (startDate == null || endDate == null) {
            return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        }

        return orderRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    // Helper methods for inter-service communication

    private void validateUserExists(Long userId) {
        try {
            userServiceRestClient.get()
                    .uri("/api/users/{id}", userId)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                        throw new ResourceNotFoundException("User", "id", userId);
                    })
                    .body(new ParameterizedTypeReference<ApiResponse<UserResponse>>() {});
        } catch (Exception e) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
    }

    private MedicineResponse getMedicineById(Long medicineId) {
        try {
            ApiResponse<MedicineResponse> response = medicineServiceRestClient.get()
                    .uri("/api/medicines/{id}", medicineId)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (request, resp) -> {
                        throw new ResourceNotFoundException("Medicine", "id", medicineId);
                    })
                    .body(new ParameterizedTypeReference<ApiResponse<MedicineResponse>>() {});

            if (response != null && response.getData() != null) {
                return response.getData();
            }
            throw new ResourceNotFoundException("Medicine", "id", medicineId);
        } catch (Exception e) {
            throw new ResourceNotFoundException("Medicine", "id", medicineId);
        }
    }

    private void updateMedicineStock(Long medicineId, Integer quantity, String operation) {
        try {
            Map<String, Object> stockUpdate = new HashMap<>();
            stockUpdate.put("quantity", quantity);
            stockUpdate.put("operation", operation);

            medicineServiceRestClient.patch()
                    .uri("/api/medicines/{id}/stock", medicineId)
                    .body(stockUpdate)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        throw new RuntimeException("Failed to update medicine stock");
                    })
                    .body(new ParameterizedTypeReference<ApiResponse<MedicineResponse>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to update medicine stock: " + e.getMessage());
        }
    }

    private void validateStatusTransition(String currentStatus, String newStatus) {
        // Define valid status transitions
        Map<String, List<String>> validTransitions = new HashMap<>();
        validTransitions.put("PENDING", List.of("CONFIRMED", "CANCELLED"));
        validTransitions.put("CONFIRMED", List.of("PROCESSING", "SHIPPED", "CANCELLED"));
        validTransitions.put("PROCESSING", List.of("SHIPPED", "CANCELLED"));
        validTransitions.put("SHIPPED", List.of("DELIVERED", "CANCELLED"));
        validTransitions.put("DELIVERED", List.of());
        validTransitions.put("CANCELLED", List.of());

        List<String> allowedTransitions = validTransitions.get(currentStatus);
        if (allowedTransitions == null || !allowedTransitions.contains(newStatus)) {
            throw new IllegalArgumentException(
                "Invalid status transition from " + currentStatus + " to " + newStatus
            );
        }
    }
}


