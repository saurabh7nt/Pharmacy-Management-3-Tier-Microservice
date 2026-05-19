# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/common/pom.xml common/
COPY backend/user-service/pom.xml user-service/
COPY backend/medicine-service/pom.xml medicine-service/
COPY backend/order-service/pom.xml order-service/
RUN mvn dependency:go-offline -pl medicine-service -am
COPY backend/common/src common/src
COPY backend/medicine-service/src medicine-service/src
RUN mvn clean package -pl medicine-service -am -Dmaven.test.skip=true

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/medicine-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]