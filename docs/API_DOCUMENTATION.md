# API Documentation

Complete API reference for all microservices in the Pharmacy Management System.

## Base URLs

- **User Service**: `http://localhost:8081`
- **Medicine Service**: `http://localhost:8082`
- **Order Service**: `http://localhost:8083`

## Common Response Format

All APIs return responses in the following format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## User Service API

Base URL: `http://localhost:8081/api/users`

### 1. Register User

**Endpoint**: `POST /api/users/register`

**Description**: Register a new user in the system.

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "fullName": "John Doe",
  "phoneNumber": "1234567890",
  "address": "123 Main St, City",
  "role": "CUSTOMER"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "1234567890",
    "address": "123 Main St, City",
    "role": "CUSTOMER",
    "active": true,
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### 2. Get User by ID

**Endpoint**: `GET /api/users/{id}`

**Description**: Retrieve user details by ID.

**Path Parameters**:
- `id` (Long): User ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "1234567890",
    "address": "123 Main St, City",
    "role": "CUSTOMER",
    "active": true,
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### 3. Get User by Email

**Endpoint**: `GET /api/users/email/{email}`

**Description**: Retrieve user details by email address.

**Path Parameters**:
- `email` (String): User email

**Response**: `200 OK`

### 4. Get All Users

**Endpoint**: `GET /api/users`

**Description**: Retrieve all users with pagination.

**Query Parameters**:
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size
- `sortBy` (String, default: "createdAt"): Sort field
- `sortDir` (String, default: "desc"): Sort direction (asc/desc)

**Example**: `GET /api/users?page=0&size=10&sortBy=createdAt&sortDir=desc`

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "fullName": "John Doe",
        "role": "CUSTOMER",
        "active": true,
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
}
```

### 5. Get Users by Role

**Endpoint**: `GET /api/users/role/{role}`

**Description**: Retrieve users by role with pagination.

**Path Parameters**:
- `role` (String): User role (ADMIN, CUSTOMER)

**Query Parameters**:
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size

**Response**: `200 OK` (Paginated response)

### 6. Search Users

**Endpoint**: `GET /api/users/search`

**Description**: Search users by keyword (searches in username, email, fullName).

**Query Parameters**:
- `keyword` (String, required): Search keyword
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size

**Example**: `GET /api/users/search?keyword=john&page=0&size=10`

**Response**: `200 OK` (Paginated response)

### 7. Update User

**Endpoint**: `PUT /api/users/{id}`

**Description**: Update user information.

**Path Parameters**:
- `id` (Long): User ID

**Request Body**:
```json
{
  "fullName": "John Updated Doe",
  "phoneNumber": "9876543210",
  "address": "456 New St, City",
  "active": true
}
```

**Response**: `200 OK`

### 8. Delete User

**Endpoint**: `DELETE /api/users/{id}`

**Description**: Soft delete a user (sets active to false).

**Path Parameters**:
- `id` (Long): User ID

**Response**: `200 OK`
```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully"
}
```

### 9. Check Email Exists

**Endpoint**: `GET /api/users/check/email`

**Description**: Check if an email is already registered.

**Query Parameters**:
- `email` (String, required): Email to check

**Example**: `GET /api/users/check/email?email=john@example.com`

**Response**: `200 OK`
```json
{
  "success": true,
  "data": true
}
```

### 10. Check Username Exists

**Endpoint**: `GET /api/users/check/username`

**Description**: Check if a username is already taken.

**Query Parameters**:
- `username` (String, required): Username to check

**Response**: `200 OK`

---

## Medicine Service API

Base URL: `http://localhost:8082/api/medicines`

### 1. Create Medicine

**Endpoint**: `POST /api/medicines`

**Description**: Add a new medicine to inventory.

**Request Body**:
```json
{
  "name": "Paracetamol 500mg",
  "description": "Pain reliever and fever reducer",
  "category": "Pain Relief",
  "manufacturer": "PharmaCorp",
  "price": 5.99,
  "quantity": 100,
  "expiryDate": "2025-12-31",
  "available": true
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Paracetamol 500mg",
    "description": "Pain reliever and fever reducer",
    "category": "Pain Relief",
    "manufacturer": "PharmaCorp",
    "price": 5.99,
    "quantity": 100,
    "expiryDate": "2025-12-31",
    "available": true,
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### 2. Get Medicine by ID

**Endpoint**: `GET /api/medicines/{id}`

**Description**: Retrieve medicine details by ID.

**Path Parameters**:
- `id` (Long): Medicine ID

**Response**: `200 OK`

### 3. Get All Medicines

**Endpoint**: `GET /api/medicines`

**Description**: Retrieve all medicines with pagination.

**Query Parameters**:
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size
- `sortBy` (String, default: "name"): Sort field
- `sortDir` (String, default: "asc"): Sort direction

**Response**: `200 OK` (Paginated response)

### 4. Get Medicines by Category

**Endpoint**: `GET /api/medicines/category/{category}`

**Description**: Retrieve medicines by category.

**Path Parameters**:
- `category` (String): Medicine category

**Query Parameters**:
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size

**Response**: `200 OK` (Paginated response)

### 5. Search Medicines

**Endpoint**: `GET /api/medicines/search`

**Description**: Search medicines by keyword (searches in name, description, manufacturer).

**Query Parameters**:
- `keyword` (String, required): Search keyword
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size

**Example**: `GET /api/medicines/search?keyword=paracetamol&page=0&size=10`

**Response**: `200 OK` (Paginated response)

### 6. Get Available Medicines

**Endpoint**: `GET /api/medicines/available`

**Description**: Retrieve only available medicines (available=true, quantity>0).

**Query Parameters**:
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size

**Response**: `200 OK` (Paginated response)

### 7. Update Medicine

**Endpoint**: `PUT /api/medicines/{id}`

**Description**: Update medicine information.

**Path Parameters**:
- `id` (Long): Medicine ID

**Request Body**:
```json
{
  "name": "Paracetamol 500mg Updated",
  "description": "Updated description",
  "category": "Pain Relief",
  "manufacturer": "PharmaCorp",
  "price": 6.99,
  "quantity": 150,
  "expiryDate": "2025-12-31",
  "available": true
}
```

**Response**: `200 OK`

### 8. Update Medicine Stock

**Endpoint**: `PATCH /api/medicines/{id}/stock`

**Description**: Update only the stock quantity of a medicine.

**Path Parameters**:
- `id` (Long): Medicine ID

**Request Body**:
```json
{
  "quantity": 50,
  "operation": "ADD"
}
```

Operations: `ADD`, `SUBTRACT`, `SET`

**Response**: `200 OK`

### 9. Delete Medicine

**Endpoint**: `DELETE /api/medicines/{id}`

**Description**: Delete a medicine from inventory.

**Path Parameters**:
- `id` (Long): Medicine ID

**Response**: `200 OK`

---

## Order Service API

Base URL: `http://localhost:8083/api/orders`

### 1. Create Order

**Endpoint**: `POST /api/orders`

**Description**: Create a new order.

**Request Body**:
```json
{
  "userId": 1,
  "items": [
    {
      "medicineId": 1,
      "quantity": 2,
      "price": 5.99
    },
    {
      "medicineId": 2,
      "quantity": 1,
      "price": 12.99
    }
  ],
  "shippingAddress": "123 Main St, City",
  "notes": "Please deliver before 5 PM"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "orderNumber": "ORD-20240101-001",
    "items": [
      {
        "id": 1,
        "medicineId": 1,
        "medicineName": "Paracetamol 500mg",
        "quantity": 2,
        "price": 5.99,
        "subtotal": 11.98
      }
    ],
    "totalAmount": 24.97,
    "status": "PENDING",
    "shippingAddress": "123 Main St, City",
    "notes": "Please deliver before 5 PM",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### 2. Get Order by ID

**Endpoint**: `GET /api/orders/{id}`

**Description**: Retrieve order details by ID.

**Path Parameters**:
- `id` (Long): Order ID

**Response**: `200 OK`

### 3. Get All Orders

**Endpoint**: `GET /api/orders`

**Description**: Retrieve all orders with pagination.

**Query Parameters**:
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size
- `sortBy` (String, default: "createdAt"): Sort field
- `sortDir` (String, default: "desc"): Sort direction

**Response**: `200 OK` (Paginated response)

### 4. Get Orders by User

**Endpoint**: `GET /api/orders/user/{userId}`

**Description**: Retrieve all orders for a specific user.

**Path Parameters**:
- `userId` (Long): User ID

**Query Parameters**:
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size

**Response**: `200 OK` (Paginated response)

### 5. Get Orders by Status

**Endpoint**: `GET /api/orders/status/{status}`

**Description**: Retrieve orders by status.

**Path Parameters**:
- `status` (String): Order status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)

**Query Parameters**:
- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size

**Response**: `200 OK` (Paginated response)

### 6. Update Order Status

**Endpoint**: `PUT /api/orders/{id}/status`

**Description**: Update the status of an order.

**Path Parameters**:
- `id` (Long): Order ID

**Request Body**:
```json
{
  "status": "CONFIRMED",
  "notes": "Order confirmed and processing"
}
```

**Response**: `200 OK`

### 7. Cancel Order

**Endpoint**: `DELETE /api/orders/{id}`

**Description**: Cancel an order (sets status to CANCELLED).

**Path Parameters**:
- `id` (Long): Order ID

**Response**: `200 OK`

---

## Health Check Endpoints

All services expose Spring Boot Actuator endpoints:

### Health Check

**Endpoint**: `GET /actuator/health`

**Response**: `200 OK`
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP"
    }
  }
}
```

### Application Info

**Endpoint**: `GET /actuator/info`

### Metrics

**Endpoint**: `GET /actuator/metrics`

**Endpoint**: `GET /actuator/metrics/{metricName}`

Example metrics:
- `jvm.memory.used`
- `http.server.requests`
- `jdbc.connections.active`

### Prometheus Metrics

**Endpoint**: `GET /actuator/prometheus`

Returns metrics in Prometheus format for scraping.

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Resource Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

## Common Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Resource Not Found (404)
```json
{
  "success": false,
  "error": "User not found with id: 999",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Duplicate Resource (409)
```json
{
  "success": false,
  "error": "Email already exists: john@example.com",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Testing with cURL

### Register a User
```bash
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123",
    "fullName": "Test User",
    "phoneNumber": "1234567890",
    "address": "123 Test St"
  }'
```

### Get All Medicines
```bash
curl http://localhost:8082/api/medicines?page=0&size=10
```

### Create an Order
```bash
curl -X POST http://localhost:8083/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "items": [
      {
        "medicineId": 1,
        "quantity": 2,
        "price": 5.99
      }
    ],
    "shippingAddress": "123 Main St"
  }'
```

## Postman Collection

A Postman collection with all API endpoints is available in the repository:
- Location: `docs/postman/Pharmacy-Management-APIs.postman_collection.json`
- Import this file into Postman for easy API testing

---

For more information, see:
- [Getting Started Guide](./GETTING_STARTED.md)
- [Architecture Documentation](./ARCHITECTURE.md)