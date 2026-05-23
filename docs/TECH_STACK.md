# Technology Stack

This document provides detailed information about the technologies used in the Pharmacy Management System.

## Backend Technologies

### Framework & Language
- **Spring Boot**: 4.0.6
  - Enterprise-grade Java framework
  - Auto-configuration and dependency injection
  - Production-ready features
  
- **Java**: 17 (LTS)
  - Modern Java features
  - Records, pattern matching, sealed classes
  - Enhanced performance

### Build Tool
- **Apache Maven**: 3.8+
  - Multi-module project structure
  - Dependency management
  - Build lifecycle management
  - Parent POM for shared configuration

### Database
- **PostgreSQL**: 16
  - ACID compliance
  - Advanced SQL features
  - JSON support
  - Excellent performance

### ORM & Data Access
- **Spring Data JPA**
  - Repository pattern
  - Query derivation
  - Pagination and sorting
  
- **Hibernate**
  - JPA implementation
  - Automatic schema generation
  - Lazy loading and caching

### Validation
- **Jakarta Validation** (Bean Validation 3.0)
  - Declarative validation
  - Custom validators
  - Method-level validation

### Utilities
- **Lombok**
  - Reduces boilerplate code
  - @Data, @Builder, @Slf4j annotations
  - Compile-time code generation

### Monitoring & Metrics
- **Spring Boot Actuator**
  - Health checks
  - Application metrics
  - Environment information
  
- **Micrometer + Prometheus**
  - Metrics collection
  - Time-series data
  - Grafana integration ready

## Frontend Technologies

### Core Framework
- **React**: 19.2.0
  - Component-based architecture
  - Virtual DOM
  - Hooks API
  - Modern React features

### Build Tool
- **Vite**: 7.1.12
  - Lightning-fast HMR (Hot Module Replacement)
  - Optimized production builds
  - Native ES modules
  - Plugin ecosystem

### Routing
- **React Router DOM**: 7.9.4
  - Client-side routing
  - Nested routes
  - Route parameters
  - Navigation guards

### HTTP Client
- **Axios**: 1.13.2
  - Promise-based HTTP client
  - Request/response interceptors
  - Automatic JSON transformation
  - Error handling

### State Management
- **React Context API**
  - Built-in state management
  - Cart context
  - Notification context
  - No external dependencies

### Web Server (Production)
- **Nginx**
  - High-performance web server
  - Reverse proxy
  - Static file serving
  - Gzip compression

## DevOps & Infrastructure

### Containerization
- **Docker**
  - Container runtime
  - Multi-stage builds
  - Image optimization
  - Docker Compose for local development

### Container Orchestration
- **Kubernetes**
  - Container orchestration
  - Auto-scaling
  - Self-healing
  - Rolling updates
  - Service discovery

### Ingress Controller
- **Nginx Ingress Controller**
  - HTTP/HTTPS routing
  - Path-based routing
  - SSL/TLS termination
  - Load balancing

### CI/CD
- **GitHub Actions**
  - Automated workflows
  - Multi-stage pipelines
  - Matrix builds
  - Secrets management

### Security Scanning
- **Trivy**
  - Vulnerability scanning
  - Container image scanning
  - Filesystem scanning
  - SARIF report generation
  
- **Gitleaks**
  - Secret detection
  - Pre-commit hooks
  - CI/CD integration

### GitOps
- **ArgoCD**
  - Declarative GitOps
  - Automated deployments
  - Rollback capabilities
  - Multi-cluster support

### Container Registry
- **Docker Hub**
  - Public/private repositories
  - Multi-architecture images (amd64, arm64)
  - Automated builds
  - Webhooks

## Development Tools

### Version Control
- **Git**
  - Distributed version control
  - Branch management
  - Pull requests

### IDE Support
- **VS Code** (recommended)
  - Java Extension Pack
  - Spring Boot Extension Pack
  - ES7+ React/Redux/React-Native snippets
  - Docker extension

### API Testing
- **Postman** / **cURL**
  - API endpoint testing
  - Request collections
  - Environment variables

## Dependencies Overview

### Backend Common Dependencies
```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    
    <!-- Monitoring -->
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
    
    <!-- Utilities -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
</dependencies>
```

### Frontend Dependencies
```json
{
  "dependencies": {
    "axios": "^1.13.2",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.9.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.0",
    "vite": "^7.1.12"
  }
}
```

## System Requirements

### Development Environment
- **Java Development Kit (JDK)**: 17 or higher
- **Maven**: 3.8 or higher
- **Node.js**: 22 or higher
- **npm**: 10 or higher
- **Docker**: 20.10 or higher
- **Docker Compose**: 2.0 or higher

### Production Environment
- **Kubernetes**: 1.25 or higher
- **kubectl**: Compatible with cluster version
- **PostgreSQL**: 16 or higher
- **Nginx Ingress Controller**: Latest stable

### Hardware Requirements (Minimum)
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Disk**: 20 GB free space
- **Network**: Stable internet connection

### Recommended for Production
- **CPU**: 8+ cores
- **RAM**: 16+ GB
- **Disk**: 100+ GB SSD
- **Network**: High-bandwidth, low-latency

## Browser Support

### Frontend Compatibility
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions

### Mobile Support
- **iOS Safari**: 14+
- **Chrome Mobile**: Latest
- **Samsung Internet**: Latest

## Performance Characteristics

### Backend Services
- **Startup Time**: ~10-15 seconds per service
- **Memory Footprint**: ~300-500 MB per service
- **Request Latency**: <100ms (average)
- **Throughput**: 1000+ requests/second per service

### Frontend
- **Initial Load**: <2 seconds
- **Time to Interactive**: <3 seconds
- **Bundle Size**: ~200 KB (gzipped)

## Security Features

### Backend
- HTTPS support
- CORS configuration
- Input validation
- SQL injection prevention
- Dependency vulnerability scanning

### Frontend
- XSS prevention
- CSRF protection
- Secure HTTP headers
- Content Security Policy ready

## Future Technology Considerations

### Potential Additions
1. **Redis**: Caching layer
2. **Kafka/RabbitMQ**: Event streaming
3. **Elasticsearch**: Search optimization
4. **Keycloak**: Identity and access management
5. **Grafana**: Metrics visualization
6. **Jaeger**: Distributed tracing
7. **Vault**: Secrets management