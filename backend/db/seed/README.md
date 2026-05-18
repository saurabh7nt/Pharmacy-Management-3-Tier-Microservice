# Database Seed Guide

This folder contains git-tracked SQL seed files that can be used to quickly populate the local PostgreSQL database after cloning the repository.

## Current Seed Files

- `medicines.sql` — inserts realistic medicine inventory records into the `medicines` table
- `admin-user.sql` — inserts one default admin user into the `users` table if it does not already exist

## Prerequisites

Make sure PostgreSQL is running and the database exists:

- Database: `microservices_db`
- Username: `admin`
- Password: `admin123`

This matches the current Spring Boot and Docker Compose configuration.

---

## Option 1: Load seed data using Docker Compose PostgreSQL container

If you are using the PostgreSQL container from `backend/docker-compose.yml`:

### Start PostgreSQL
```bash
cd backend
docker compose up -d postgres
```

### Copy the seed files into the container and run them
```bash
docker cp db/seed/medicines.sql microservices-postgres:/tmp/medicines.sql
docker cp db/seed/admin-user.sql microservices-postgres:/tmp/admin-user.sql

docker exec -it microservices-postgres psql -U admin -d microservices_db -f /tmp/medicines.sql
docker exec -it microservices-postgres psql -U admin -d microservices_db -f /tmp/admin-user.sql
```

### Verify inserted records
```bash
docker exec -it microservices-postgres psql -U admin -d microservices_db -c "SELECT id, name, category, price, quantity, available FROM medicines ORDER BY id;"
docker exec -it microservices-postgres psql -U admin -d microservices_db -c "SELECT id, username, email, role, active FROM users ORDER BY id;"
```

---

## Option 2: Load seed data using local psql

If PostgreSQL is running locally on your machine:

```bash
psql -h localhost -U admin -d microservices_db -f backend/db/seed/medicines.sql
psql -h localhost -U admin -d microservices_db -f backend/db/seed/admin-user.sql
```

### Verify inserted records
```bash
psql -h localhost -U admin -d microservices_db -c "SELECT id, name, category, price, quantity, available FROM medicines ORDER BY id;"
psql -h localhost -U admin -d microservices_db -c "SELECT id, username, email, role, active FROM users ORDER BY id;"
```

---

## Resetting medicine data before re-seeding

If you want to clear medicines and reload the seed:

### Using Docker container
```bash
docker exec -it microservices-postgres psql -U admin -d microservices_db -c "DELETE FROM medicines;"
docker exec -it microservices-postgres psql -U admin -d microservices_db -f /tmp/medicines.sql
```

### Using local psql
```bash
psql -h localhost -U admin -d microservices_db -c "DELETE FROM medicines;"
psql -h localhost -U admin -d microservices_db -f backend/db/seed/medicines.sql
```

---

## Recommended workflow after cloning

1. Start PostgreSQL
2. Start the Spring services once so Hibernate creates tables
3. Run the seed SQL files
4. Start or refresh the frontend

Recommended order:
```bash
cd backend
docker compose up -d postgres

cd user-service && ./mvnw spring-boot:run
cd ../medicine-service && ./mvnw spring-boot:run
cd ../order-service && ./mvnw spring-boot:run
```

Then load seed data:
```bash
cd /Users/saurabhtajane/Learn/capstone-project/backend
docker cp db/seed/medicines.sql microservices-postgres:/tmp/medicines.sql
docker cp db/seed/admin-user.sql microservices-postgres:/tmp/admin-user.sql

docker exec -it microservices-postgres psql -U admin -d microservices_db -f /tmp/medicines.sql
docker exec -it microservices-postgres psql -U admin -d microservices_db -f /tmp/admin-user.sql
```

Default admin seed credentials:
```text
username: admin
email: admin@pharmacy.local
password: Admin@123
role: ADMIN
```

---

## Notes

- The `medicines` table is currently created by JPA/Hibernate (`ddl-auto: update`)
- Seed data should be loaded after the table exists
- This approach is git-friendly and simple to rerun after fresh clones
- If you later want automatic bootstrapping, this can be evolved into startup migrations using Flyway or Liquibase