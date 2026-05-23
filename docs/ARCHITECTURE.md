# Architecture Overview

This document describes the architecture of the Pharmacy Management System.

## 3-Tier Microservices Architecture

The application follows a **3-tier microservices architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer (Tier 1)                 │
│                   React + Vite + Nginx                      │
│                      Port: 5173/80                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend Services (Tier 2)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ User Service │  │Medicine Svc  │  │ Order Service│       │
│  │  Port: 8081  │  │  Port: 8082  │  │  Port: 8083  │       │
│  │  Spring Boot │  │  Spring Boot │  │  Spring Boot │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (Tier 3)                  │
│                    PostgreSQL 16                            │
│                      Port: 5432                             │
└─────────────────────────────────────────────────────────────┘
```

## Microservices

### 1. User Service (Port 8081)
**Responsibilities:**
- User registration and authentication
- User profile management
- Role-based access control (ADMIN/CUSTOMER)
- User search and filtering

**Key Features:**
- RESTful API endpoints
- PostgreSQL database integration
- Input validation
- Pagination support
- CORS configuration

### 2. Medicine Service (Port 8082)
**Responsibilities:**
- Medicine inventory management
- Stock tracking and updates
- Medicine search and categorization
- Availability management

**Key Features:**
- CRUD operations for medicines
- Category-based filtering
- Stock management
- Search functionality
- Real-time availability tracking

### 3. Order Service (Port 8083)
**Responsibilities:**
- Order creation and management
- Order status tracking
- Integration with User and Medicine services
- Order history and analytics

**Key Features:**
- Inter-service communication
- Order lifecycle management
- Status tracking (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- User order history
- Order validation

### 4. Frontend Service (Port 5173/80)
**Responsibilities:**
- Customer portal for browsing and ordering medicines
- Admin dashboard for managing users, medicines, and orders
- Shopping cart functionality
- Responsive UI

**Key Features:**
- React-based SPA
- React Router for navigation
- Context API for state management
- Axios for API calls
- Responsive design

## Communication Patterns

### Synchronous Communication
- **REST APIs**: All services expose RESTful endpoints
- **HTTP/HTTPS**: Standard protocol for service-to-service communication
- **JSON**: Data exchange format

### Service Dependencies
```
Order Service
    ├── → User Service (validate users)
    └── → Medicine Service (check stock, update inventory)

Frontend
    ├── → User Service (authentication, user management)
    ├── → Medicine Service (browse medicines)
    └── → Order Service (place orders)
```

## Database Design

### Shared Database Pattern
All services share a single PostgreSQL database (`microservices_db`) with separate tables:

**User Service Tables:**
- `users` - User information and credentials

**Medicine Service Tables:**
- `medicines` - Medicine inventory and details

**Order Service Tables:**
- `orders` - Order information
- `order_items` - Order line items

### Why Shared Database?
- Simplified development and deployment
- ACID transactions across entities
- Reduced operational complexity
- Suitable for monolithic-to-microservices transition

**Note**: For production at scale, consider moving to database-per-service pattern.

## Deployment Architecture

### Docker Compose (Development)
```
docker-compose.yml
├── postgres (PostgreSQL 16)
├── user-service (Spring Boot)
├── medicine-service (Spring Boot)
├── order-service (Spring Boot)
└── frontend-service (React + Nginx)
```

### Kubernetes (Production)
```
Kubernetes Cluster
├── Namespace: default
├── StatefulSet: postgres
├── Deployment: user-service
├── Deployment: medicine-service
├── Deployment: order-service
├── Deployment: frontend-service
├── Services: ClusterIP for each service
└── Ingress: Nginx Ingress Controller
```

## Security Considerations

1. **CORS Configuration**: Configured per service
2. **Input Validation**: Jakarta Validation on all endpoints
3. **SQL Injection Prevention**: JPA/Hibernate parameterized queries
4. **Container Security**: Trivy scanning for vulnerabilities
5. **Secret Management**: Environment variables for sensitive data

## Scalability

### Horizontal Scaling
- Each microservice can be scaled independently
- Kubernetes Horizontal Pod Autoscaler (HPA) support
- Load balancing via Kubernetes Services

### Vertical Scaling
- Adjust resource limits in Kubernetes manifests
- JVM tuning for Spring Boot applications

## Monitoring & Observability

### Health Checks
- Spring Boot Actuator endpoints
- Kubernetes liveness and readiness probes

### Metrics
- Prometheus metrics exposure
- JVM metrics (memory, threads, GC)
- HTTP request metrics
- Database connection pool metrics

### Logging
- Structured logging with Spring Boot
- Container logs accessible via `kubectl logs`
- Centralized logging (future enhancement)

## Future Enhancements

1. **Service Mesh**: Implement Istio for advanced traffic management
2. **API Gateway**: Add Spring Cloud Gateway or Kong
3. **Event-Driven Architecture**: Introduce message queues (RabbitMQ/Kafka)
4. **Database per Service**: Migrate to independent databases
5. **Authentication**: Implement OAuth2/JWT
6. **Distributed Tracing**: Add Jaeger or Zipkin
7. **Circuit Breaker**: Implement Resilience4j
8. **Caching**: Add Redis for performance optimization