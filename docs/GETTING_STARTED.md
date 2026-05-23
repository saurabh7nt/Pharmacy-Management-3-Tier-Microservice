# Getting Started Guide

This guide will help you set up and run the Pharmacy Management System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17** or higher ([Download](https://adoptium.net/))
- **Maven 3.8+** ([Download](https://maven.apache.org/download.cgi))
- **Node.js 22** or higher ([Download](https://nodejs.org/))
- **Docker** and **Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/downloads))

### Verify Installation

```bash
java -version    # Should show Java 17+
mvn -version     # Should show Maven 3.8+
node -version    # Should show Node 22+
docker -version  # Should show Docker version
docker-compose -version
```

## Quick Start with Docker Compose (Recommended)

This is the fastest way to get the entire application running.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Pharmacy-Management-3-Tier-Microservice
```

### Step 2: Start All Services

```bash
docker-compose up -d
```

This command will:
- Pull/build all necessary Docker images
- Start PostgreSQL database
- Start all three backend microservices
- Start the frontend application

### Step 3: Wait for Services to Initialize

Check the logs to ensure all services are running:

```bash
docker-compose logs -f
```

Wait until you see messages like:
- `Started UserServiceApplication`
- `Started MedicineServiceApplication`
- `Started OrderServiceApplication`
- `frontend-service` is ready

Press `Ctrl+C` to exit log viewing.

### Step 4: Load Seed Data (Optional but Recommended)

Load sample medicines and admin user:

```bash
# Copy seed files to PostgreSQL container
docker cp backend/db/seed/medicines.sql postgres-service:/tmp/medicines.sql
docker cp backend/db/seed/admin-user.sql postgres-service:/tmp/admin-user.sql

# Execute seed files
docker exec -it postgres-service psql -U admin -d microservices_db -f /tmp/medicines.sql
docker exec -it postgres-service psql -U admin -d microservices_db -f /tmp/admin-user.sql
```

### Step 5: Access the Application

- **Frontend**: http://localhost:5173
- **User Service API**: http://localhost:8081
- **Medicine Service API**: http://localhost:8082
- **Order Service API**: http://localhost:8083

### Step 6: Login with Default Admin

After loading seed data, use these credentials:

```
Username: admin
Email: admin@pharmacy.local
Password: Admin@123
Role: ADMIN
```

### Stop Services

```bash
docker-compose down
```

To remove volumes (database data):
```bash
docker-compose down -v
```

## Local Development Setup (Without Docker)

For development with hot-reload and debugging capabilities.

### Step 1: Start PostgreSQL

You can use Docker for just the database:

```bash
docker run -d \
  --name postgres-local \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=microservices_db \
  -p 5432:5432 \
  postgres:16
```

Or install PostgreSQL locally and create the database:

```sql
CREATE DATABASE microservices_db;
CREATE USER admin WITH PASSWORD 'admin123';
GRANT ALL PRIVILEGES ON DATABASE microservices_db TO admin;
```

### Step 2: Build Backend Services

```bash
cd backend

# Build all services (from parent directory)
mvn clean install -DskipTests

# Or build individually
cd user-service && mvn clean install -DskipTests
cd ../medicine-service && mvn clean install -DskipTests
cd ../order-service && mvn clean install -DskipTests
```

### Step 3: Run Backend Services

Open three separate terminal windows:

**Terminal 1 - User Service:**
```bash
cd backend/user-service
mvn spring-boot:run
```

**Terminal 2 - Medicine Service:**
```bash
cd backend/medicine-service
mvn spring-boot:run
```

**Terminal 3 - Order Service:**
```bash
cd backend/order-service
mvn spring-boot:run
```

Wait for each service to start (look for "Started *ServiceApplication" messages).

### Step 4: Load Seed Data

```bash
# From project root
psql -h localhost -U admin -d microservices_db -f backend/db/seed/medicines.sql
psql -h localhost -U admin -d microservices_db -f backend/db/seed/admin-user.sql
```

### Step 5: Run Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:5173

### Step 6: Verify Everything is Running

Check health endpoints:
- http://localhost:8081/actuator/health
- http://localhost:8082/actuator/health
- http://localhost:8083/actuator/health

## IDE Setup

### IntelliJ IDEA

1. **Import Project**
   - File → Open → Select `backend/pom.xml`
   - Import as Maven project

2. **Configure JDK**
   - File → Project Structure → Project SDK → Select Java 17

3. **Run Configurations**
   - Create Spring Boot run configurations for each service
   - Set working directory to service folder

### VS Code

1. **Install Extensions**
   - Extension Pack for Java
   - Spring Boot Extension Pack
   - ES7+ React/Redux/React-Native snippets

2. **Open Workspace**
   - Open the project root folder

3. **Run Services**
   - Use integrated terminal for Maven commands
   - Use debugger for Spring Boot applications

## Testing the Application

### Test Backend APIs

Using cURL:

```bash
# Health check
curl http://localhost:8081/actuator/health

# Get all medicines
curl http://localhost:8082/api/medicines

# Register a user
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

### Test Frontend

1. Open http://localhost:5173
2. Navigate to different pages
3. Try registering a new user
4. Browse medicines
5. Add items to cart
6. Place an order

## Common Issues and Solutions

### Issue: Port Already in Use

**Error**: `Port 8081 is already in use`

**Solution**:
```bash
# Find process using the port
lsof -i :8081  # macOS/Linux
netstat -ano | findstr :8081  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: Database Connection Failed

**Error**: `Connection refused: localhost:5432`

**Solution**:
- Ensure PostgreSQL is running
- Check credentials in `application.yaml`
- Verify database exists: `psql -U admin -l`

### Issue: Maven Build Fails

**Error**: `Failed to execute goal`

**Solution**:
```bash
# Clean Maven cache
mvn clean

# Update dependencies
mvn dependency:purge-local-repository

# Rebuild
mvn clean install -U
```

### Issue: Frontend Build Fails

**Error**: `Module not found`

**Solution**:
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Clear cache
npm cache clean --force
```

### Issue: Docker Compose Fails

**Error**: `Cannot start service`

**Solution**:
```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Start again
docker-compose up -d
```

## Development Workflow

### Making Changes to Backend

1. Make code changes in your IDE
2. Maven will auto-compile (if using IDE)
3. Restart the specific service
4. Test the changes

### Making Changes to Frontend

1. Make code changes in your IDE
2. Vite will hot-reload automatically
3. Changes appear instantly in browser
4. No restart needed

### Database Changes

1. Modify entity classes
2. Hibernate will auto-update schema (ddl-auto: update)
3. For production, use Flyway/Liquibase migrations

## Next Steps

- [API Documentation](./API_DOCUMENTATION.md) - Learn about available endpoints
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to production
- [Architecture](./ARCHITECTURE.md) - Understand the system design
- [CI/CD Pipeline](./CICD.md) - Set up automated deployments

## Getting Help

If you encounter issues:

1. Check the [Common Issues](#common-issues-and-solutions) section
2. Review service logs: `docker-compose logs <service-name>`
3. Check health endpoints: `/actuator/health`
4. Open an issue on GitHub

## Useful Commands

### Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Rebuild a service
docker-compose build [service-name]

# Execute command in container
docker-compose exec [service-name] [command]
```

### Maven

```bash
# Build all modules
mvn clean install

# Skip tests
mvn clean install -DskipTests

# Run specific service
mvn spring-boot:run

# Run tests
mvn test

# Package as JAR
mvn package
```

### npm

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

### Backend Services

Create `.env` file or set environment variables:

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/microservices_db
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=admin123

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Order Service (additional)
SERVICES_USER_SERVICE_URL=http://localhost:8081
SERVICES_MEDICINE_SERVICE_URL=http://localhost:8082
```

### Frontend

Create `.env` file in frontend directory:

```bash
VITE_API_BASE_URL=http://localhost:8083
VITE_USER_SERVICE_URL=http://localhost:8081
VITE_MEDICINE_SERVICE_URL=http://localhost:8082
```

---

**Happy Coding! **