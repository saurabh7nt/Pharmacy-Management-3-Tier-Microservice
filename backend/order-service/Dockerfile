# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY common/pom.xml common/
COPY user-service/pom.xml user-service/
COPY medicine-service/pom.xml medicine-service/
COPY order-service/pom.xml order-service/
RUN mvn dependency:go-offline -pl order-service -am
COPY common/src common/src
COPY order-service/src order-service/src
RUN mvn clean package -pl order-service -am -Dmaven.test.skip=true

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/order-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
