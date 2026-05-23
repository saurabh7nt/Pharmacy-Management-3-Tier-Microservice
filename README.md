# Pharmacy Management System - 3-Tier Microservices Architecture

[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Deployable-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-6DB33F?logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A modern, cloud-native pharmacy management system built with microservices architecture, featuring separate services for user management, medicine inventory, and order processing. The system includes a React-based frontend and is fully containerized with Docker and deployable to Kubernetes.

## Quick Links

- [📖 Getting Started](./docs/GETTING_STARTED.md) - Setup and run the application
- [🏗️ Architecture](./docs/ARCHITECTURE.md) - System design and architecture
- [🛠️ Tech Stack](./docs/TECH_STACK.md) - Technologies and tools used
- [📚 API Documentation](./docs/API_DOCUMENTATION.md) - Complete API reference
- [🚢 Deployment Guide](./docs/DEPLOYMENT.md) - Deploy to production
- [🔄 CI/CD Pipeline](./docs/CICD.md) - Automated deployment pipeline

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)

## Overview

This Pharmacy Management System demonstrates a production-ready microservices architecture with:

- **3-Tier Architecture**: Frontend, Backend Services, Database
- **Microservices**: Independent, scalable services
- **Containerization**: Docker and Docker Compose
- **Orchestration**: Kubernetes with Helm charts
- **CI/CD**: Automated pipelines with GitHub Actions
- **Security**: Vulnerability scanning with Trivy and Gitleaks
- **Monitoring**: Prometheus metrics and health checks
- **GitOps**: ArgoCD for declarative deployments

## Features

### User Management
- User registration and authentication
- Role-based access control (ADMIN/CUSTOMER)
- Profile management
- User search and filtering

### Medicine Inventory
- Complete medicine catalog
- Stock management
- Category-based organization
- Search and filter capabilities
- Availability tracking

### Order Processing
- Shopping cart functionality
- Order placement and tracking
- Order history
- Status management (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- Integration with user and medicine services

### Frontend
- Modern React-based UI
- Responsive design
- Customer portal
- Admin dashboard
- Real-time updates

### Technical Features
- RESTful APIs
- Pagination support
- Health checks and metrics
- CORS configuration
- Multi-stage Docker builds
- Kubernetes-ready deployments
- Automated CI/CD pipelines

## Architecture

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

**[Architecture →](./docs/ARCHITECTURE.md)**

## 🛠️ Tech Stack

### Backend
- **Spring Boot 4.0.6** - Enterprise Java framework
- **Java 17** - Programming language
- **PostgreSQL 16** - Relational database
- **Maven** - Build and dependency management
- **Spring Data JPA** - Data access layer
- **Lombok** - Reduce boilerplate code

### Frontend
- **React 19.2.0** - UI library
- **Vite 7.1.12** - Build tool
- **React Router 7.9.4** - Routing
- **Axios 1.13.2** - HTTP client
- **Nginx** - Web server (production)

### DevOps
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **GitHub Actions** - CI/CD
- **ArgoCD** - GitOps
- **Trivy** - Security scanning
- **Prometheus** - Metrics

**[View complete tech stack →](./docs/TECH_STACK.md)**

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Java 17+ (for local development)
- Node.js 22+ (for local development)
- Maven 3.8+ (for local development)

### Run with Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Pharmacy-Management-3-Tier-Microservice

# Start all services
docker-compose up -d

# Load seed data (optional)
docker cp backend/db/seed/medicines.sql postgres-service:/tmp/medicines.sql
docker cp backend/db/seed/admin-user.sql postgres-service:/tmp/admin-user.sql
docker exec -it postgres-service psql -U admin -d microservices_db -f /tmp/medicines.sql
docker exec -it postgres-service psql -U admin -d microservices_db -f /tmp/admin-user.sql

# Access the application
# Frontend: http://localhost:5173
# User Service: http://localhost:8081
# Medicine Service: http://localhost:8082
# Order Service: http://localhost:8083
```

### Default Admin Credentials

After loading seed data:
```
Username: admin
Email: admin@pharmacy.local
Password: Admin@123
Role: ADMIN
```

**[Detailed setup instructions →](./docs/GETTING_STARTED.md)**

## Project Structure

```
Pharmacy-Management-3-Tier-Microservice/
├── backend/
│   ├── common/                      # Shared DTOs and exceptions
│   ├── user-service/                # User management microservice
│   ├── medicine-service/            # Medicine inventory microservice
│   ├── order-service/               # Order processing microservice
│   ├── db/seed/                     # Database seed files
│   └── pom.xml                      # Parent POM
├── frontend/
│   ├── src/
│   │   ├── api/                     # API clients
│   │   ├── components/              # React components
│   │   ├── pages/                   # Page components
│   │   └── context/                 # State management
│   ├── Dockerfile
│   └── package.json
├── k8s/                             # Kubernetes manifests
│   ├── user-service/
│   ├── medicine-service/
│   ├── order-service/
│   ├── frontend-service/
│   ├── postgres/
│   └── ingress/
├── .github/workflows/               # CI/CD pipelines
├── docs/                            # Documentation
├── docker-compose.yml
└── README.md
```

## Documentation

### Core Documentation
- **[Getting Started Guide](./docs/GETTING_STARTED.md)** - Setup, installation, and first steps
- **[Architecture Documentation](./docs/ARCHITECTURE.md)** - System design, patterns, and decisions
- **[Technology Stack](./docs/TECH_STACK.md)** - Detailed tech stack information

### Development
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference for all services
- **[Database Seed Guide](./backend/db/seed/README.md)** - How to load sample data

### Operations
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Docker and Kubernetes deployment
- **[CI/CD Pipeline](./docs/CICD.md)** - Automated build and deployment

## API Endpoints

### User Service (Port 8081)
- `POST /api/users/register` - Register new user
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users` - Get all users (paginated)
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Medicine Service (Port 8082)
- `POST /api/medicines` - Create medicine
- `GET /api/medicines/{id}` - Get medicine by ID
- `GET /api/medicines` - Get all medicines (paginated)
- `PUT /api/medicines/{id}` - Update medicine
- `PATCH /api/medicines/{id}/stock` - Update stock

### Order Service (Port 8083)
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/user/{userId}` - Get user orders
- `PUT /api/orders/{id}/status` - Update order status

**[Complete API documentation →](./docs/API_DOCUMENTATION.md)**

## Security

- **Trivy Scanning** - Vulnerability detection in code and images
- **Gitleaks** - Secret detection in commits
- **CORS Configuration** - Cross-origin request handling
- **Input Validation** - Jakarta Validation on all endpoints
- **Security Updates** - Regular dependency updates

## Monitoring

All services expose health and metrics endpoints:

- `/actuator/health` - Service health status
- `/actuator/metrics` - Application metrics
- `/actuator/prometheus` - Prometheus-formatted metrics
