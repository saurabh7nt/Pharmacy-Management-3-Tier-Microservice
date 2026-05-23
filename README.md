# 🏥 Pharmacy Management System - 3-Tier Microservices Architecture

A modern, cloud-native pharmacy management system built with microservices architecture, featuring separate services for user management, medicine inventory, and order processing. The system includes a React-based frontend and is fully containerized with Docker and deployable to Kubernetes.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)

## 🏗️ Architecture Overview

This application follows a **3-tier microservices architecture**:

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

### Microservices

1. **User Service** (Port 8081)
   - User registration and authentication
   - User profile management
   - Role-based access control (ADMIN/CUSTOMER)
   - User search and filtering

2. **Medicine Service** (Port 8082)
   - Medicine inventory management
   - Stock tracking and updates
   - Medicine search and categorization
   - Availability management

3. **Order Service** (Port 8083)
   - Order creation and management
   - Order status tracking
   - Integration with User and Medicine services
   - Order history and analytics

4. **Frontend Service** (Port 5173/80)
   - Customer portal for browsing and ordering medicines
   - Admin dashboard for managing users, medicines, and orders
   - Shopping cart functionality
   - Responsive UI with React

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 4.0.6
- **Language**: Java 17
- **Build Tool**: Maven (Multi-module project)
- **Database**: PostgreSQL 16
- **ORM**: Spring Data JPA / Hibernate
- **API**: RESTful APIs
- **Validation**: Jakarta Validation
- **Monitoring**: Spring Boot Actuator + Prometheus

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.1.12
- **Routing**: React Router DOM 7.9.4
- **HTTP Client**: Axios 1.13.2
- **Web Server**: Nginx (Production)

### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Ingress**: Nginx Ingress Controller
- **CI/CD**: GitHub Actions
- **Security Scanning**: Trivy, Gitleaks
- **GitOps**: ArgoCD
- **Container Registry**: Docker Hub

## ✨ Features

### Customer Features
- 🔐 User registration and login
- 🔍 Browse and search medicines
- 🛒 Shopping cart management
- 📦 Place and track orders
- 📋 View order history
- 💊 View medicine details and availability

### Admin Features
- 👥 User management (CRUD operations)
- 💊 Medicine inventory management
- 📊 Order management and status updates
- 📈 Dashboard with analytics
- 🔍 Advanced search and filtering
- 📄 Pagination support

### Technical Features
- 🔄 RESTful API design
- 🔒 CORS configuration
- 📊 Health checks and metrics
- 🐳 Docker containerization
- ☸️ Kubernetes deployment
- 🔄 CI/CD automation
- 🔐 Security scanning
- 📦 Multi-stage Docker builds
- 🌐 Ingress routing

## 📁 Project Structure

```
Pharmacy-Management-3-Tier-Microservice/
├── backend/
│   ├── common/                      # Shared DTOs and exceptions
│   │   └── src/main/java/com/example/common/
│   │       ├── dto/                 # Data Transfer Objects
│   │       └── exception/           # Common exceptions
│   ├── user-service/                # User management microservice
│   │   ├── src/main/java/com/example/user_service/
│   │   │   ├── controller/          # REST controllers
│   │   │   ├── service/             # Business logic
│   │   │   ├── repository/          # Data access layer
│   │   │   ├── entity/              # JPA entities
│   │   │   └── dto/                 # Service-specific DTOs
│   │   └── Dockerfile
│   ├── medicine-service/            # Medicine inventory microservice
│   │   ├── src/main/java/com/example/medicine_service/
│   │   └── Dockerfile
│   ├── order-service/               # Order processing microservice
│   │   ├── src/main/java/com/example/order_service/
│   │   └── Dockerfile
│   ├── db/seed/                     # Database seed files
│   │   ├── medicines.sql
│   │   ├── admin-user.sql
│   │   └── README.md
│   └── pom.xml                      # Parent POM
├── frontend/
│   ├── src/
│   │   ├── api/                     # API client configuration
│   │   ├── components/              # Reusable React components
│   │   ├── context/                 # React Context providers
│   │   ├── pages/                   # Page components
│   │   ├── styles/                  # CSS styles
│   │   └── utils/                   # Utility functions
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── k8s/                             # Kubernetes manifests
│   ├── frontend-service/
│   ├── user-service/
│   ├── medicine-service/
│   ├── order-service/
│   ├── postgres/
│   └── ingress/
├── .github/workflows/               # CI/CD pipelines
│   ├── frontend-service-ci.yml
│   ├── users-service-ci.yml
│   ├── medicine-service-ci.yml
│   └── order-service-ci.yml
├── docker-compose.yml               # Local development setup
└── README.md
```

## 📋 Prerequisites

- **Java 17** or higher
- **Maven 3.8+**
- **Node.js 22** or higher
- **Docker** and **Docker Compose**
- **PostgreSQL 16** (if running locally without Docker)
- **Kubernetes cluster** (for K8s deployment)
- **kubectl** (for K8s deployment)

## 🚀 Getting Started

### Option 1: Docker Compose (Recommended for Development)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Pharmacy-Management-3-Tier-Microservice
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to be ready** (check logs)
   ```bash
   docker-compose logs -f
   ```

4. **Load seed data** (optional but recommended)
   ```bash
   # Copy seed files to PostgreSQL container
   docker cp backend/db/seed/medicines.sql postgres-service:/tmp/medicines.sql
   docker cp backend/db/seed/admin-user.sql postgres-service:/tmp/admin-user.sql

   # Execute seed files
   docker exec -it postgres-service psql -U admin -d microservices_db -f /tmp/medicines.sql
   docker exec -it postgres-service psql -U admin -d microservices_db -f /tmp/admin-user.sql
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - User Service: http://localhost:8081
   - Medicine Service: http://localhost:8082
   - Order Service: http://localhost:8083

6. **Default Admin Credentials** (after loading seed data)
   ```
   Username: admin
   Email: admin@pharmacy.local
   Password: Admin@123
   Role: ADMIN
   ```

### Option 2: Local Development (Without Docker)

1. **Start PostgreSQL**
   ```bash
   # Using Docker
   docker run -d \
     --name postgres-local \
     -e POSTGRES_USER=admin \
     -e POSTGRES_PASSWORD=admin123 \
     -e POSTGRES_DB=microservices_db \
     -p 5432:5432 \
     postgres:16
   ```

2. **Build and run backend services**
   ```bash
   cd backend

   # Build all services
   mvn clean install

   # Run each service in separate terminals
   cd user-service && mvn spring-boot:run
   cd medicine-service && mvn spring-boot:run
   cd order-service && mvn spring-boot:run
   ```

3. **Run frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Load seed data**
   ```bash
   psql -h localhost -U admin -d microservices_db -f backend/db/seed/medicines.sql
   psql -h localhost -U admin -d microservices_db -f backend/db/seed/admin-user.sql
   ```

### Option 3: Kubernetes Deployment

1. **Apply Kubernetes manifests**
   ```bash
   kubectl apply -f k8s/postgres/
   kubectl apply -f k8s/user-service/
   kubectl apply -f k8s/medicine-service/
   kubectl apply -f k8s/order-service/
   kubectl apply -f k8s/frontend-service/
   kubectl apply -f k8s/ingress/
   ```

2. **Verify deployments**
   ```bash
   kubectl get pods
   kubectl get services
   kubectl get ingress
   ```

3. **Access via Ingress**
   - Configure your `/etc/hosts` or DNS to point to the Ingress IP
   - Access the application through the configured domain

## 📚 API Documentation

### User Service API (Port 8081)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| GET | `/api/users/{id}` | Get user by ID |
| GET | `/api/users/email/{email}` | Get user by email |
| GET | `/api/users` | Get all users (paginated) |
| GET | `/api/users/role/{role}` | Get users by role |
| GET | `/api/users/search?keyword={keyword}` | Search users |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user (soft delete) |
| GET | `/api/users/check/email?email={email}` | Check if email exists |
| GET | `/api/users/check/username?username={username}` | Check if username exists |

### Medicine Service API (Port 8082)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/medicines` | Create new medicine |
| GET | `/api/medicines/{id}` | Get medicine by ID |
| GET | `/api/medicines` | Get all medicines (paginated) |
| GET | `/api/medicines/category/{category}` | Get medicines by category |
| GET | `/api/medicines/search?keyword={keyword}` | Search medicines |
| GET | `/api/medicines/available` | Get available medicines |
| PUT | `/api/medicines/{id}` | Update medicine |
| PATCH | `/api/medicines/{id}/stock` | Update medicine stock |
| DELETE | `/api/medicines/{id}` | Delete medicine |

### Order Service API (Port 8083)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/{id}` | Get order by ID |
| GET | `/api/orders` | Get all orders (paginated) |
| GET | `/api/orders/user/{userId}` | Get orders by user |
| GET | `/api/orders/status/{status}` | Get orders by status |
| PUT | `/api/orders/{id}/status` | Update order status |
| DELETE | `/api/orders/{id}` | Cancel order |

### Health Check Endpoints

All services expose actuator endpoints:
- `/actuator/health` - Health status
- `/actuator/info` - Application info
- `/actuator/metrics` - Prometheus metrics
- `/actuator/beans` - Spring beans

## 🚢 Deployment

### Docker Images

The project uses multi-stage Docker builds for optimized images:

```bash
# Build images
docker build -t pharmacy-user-service -f backend/user-service/Dockerfile .
docker build -t pharmacy-medicine-service -f backend/medicine-service/Dockerfile .
docker build -t pharmacy-order-service -f backend/order-service/Dockerfile .
docker build -t pharmacy-frontend -f frontend/Dockerfile .
```

### Environment Variables

#### Backend Services
- `SPRING_DATASOURCE_URL` - PostgreSQL connection URL
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `CORS_ALLOWED_ORIGINS` - Allowed CORS origins

#### Order Service (Additional)
- `SERVICES_USER_SERVICE_URL` - User service URL
- `SERVICES_MEDICINE_SERVICE_URL` - Medicine service URL

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflows for automated CI/CD:

### Pipeline Stages

1. **Security Scanning**
   - Gitleaks: Secret detection
   - Trivy: Vulnerability scanning (filesystem and images)

2. **Code Build**
   - Maven build for backend services
   - npm build for frontend

3. **Docker Build & Push**
   - Multi-platform builds (amd64, arm64)
   - Push to Docker Hub

4. **Image Scanning**
   - Trivy scan on built images
   - Fail on HIGH/CRITICAL vulnerabilities

5. **GitOps Update**
   - Update image tags in ArgoCD repository
   - Trigger automatic deployment

### Workflows

- `frontend-service-ci.yml` - Frontend CI/CD
- `users-service-ci.yml` - User service CI/CD
- `medicine-service-ci.yml` - Medicine service CI/CD
- `order-service-ci.yml` - Order service CI/CD

## 📊 Monitoring

### Prometheus Metrics

All backend services expose Prometheus metrics at `/actuator/metrics`:

- JVM metrics (memory, threads, GC)
- HTTP request metrics
- Database connection pool metrics
- Custom application metrics

### Health Checks

Health endpoints available at `/actuator/health`:
- Database connectivity
- Disk space
- Application status

## 🔒 Security

- **Trivy scanning** for vulnerabilities
- **Gitleaks** for secret detection
- **CORS configuration** for cross-origin requests
- **Input validation** using Jakarta Validation
