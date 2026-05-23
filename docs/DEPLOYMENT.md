# Deployment Guide

This guide covers deploying the Pharmacy Management System to various environments.

## Table of Contents

- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Production Considerations](#production-considerations)
- [Environment Configuration](#environment-configuration)
- [Monitoring Setup](#monitoring-setup)

## Docker Deployment

### Building Docker Images

#### Build All Services

```bash
# From project root
docker build -t pharmacy-user-service:latest -f backend/user-service/Dockerfile .
docker build -t pharmacy-medicine-service:latest -f backend/medicine-service/Dockerfile .
docker build -t pharmacy-order-service:latest -f backend/order-service/Dockerfile .
docker build -t pharmacy-frontend:latest -f frontend/Dockerfile .
```

#### Multi-Architecture Builds

For ARM64 and AMD64 support:

```bash
# Enable buildx
docker buildx create --use

# Build and push multi-arch images
docker buildx build --platform linux/amd64,linux/arm64 \
  -t yourusername/pharmacy-user-service:latest \
  -f backend/user-service/Dockerfile \
  --push .
```

### Docker Compose Deployment

#### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    container_name: postgres-service
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  user-service:
    image: yourusername/pharmacy-user-service:latest
    container_name: user-service
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${DB_NAME}
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      CORS_ALLOWED_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      postgres:
        condition: service_healthy
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8081/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  medicine-service:
    image: yourusername/pharmacy-medicine-service:latest
    container_name: medicine-service
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${DB_NAME}
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      CORS_ALLOWED_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      postgres:
        condition: service_healthy
    restart: always

  order-service:
    image: yourusername/pharmacy-order-service:latest
    container_name: order-service
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${DB_NAME}
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      SERVICES_USER_SERVICE_URL: http://user-service:8081
      SERVICES_MEDICINE_SERVICE_URL: http://medicine-service:8082
      CORS_ALLOWED_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      - postgres
      - user-service
      - medicine-service
    restart: always

  frontend-service:
    image: yourusername/pharmacy-frontend:latest
    container_name: frontend-service
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - order-service
    restart: always

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend-service
    restart: always

volumes:
  postgres_data:
```

#### Deploy with Docker Compose

```bash
# Create .env file
cat > .env << EOF
DB_USER=admin
DB_PASSWORD=your_secure_password
DB_NAME=microservices_db
CORS_ORIGINS=https://yourdomain.com
EOF

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.25+)
- kubectl configured
- Nginx Ingress Controller installed

### Install Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### Deploy to Kubernetes

#### 1. Create Namespace

```bash
kubectl create namespace pharmacy-system
kubectl config set-context --current --namespace=pharmacy-system
```

#### 2. Create Secrets

```bash
# Database credentials
kubectl create secret generic postgres-secret \
  --from-literal=username=admin \
  --from-literal=password=your_secure_password \
  --from-literal=database=microservices_db

# Docker registry credentials (if using private registry)
kubectl create secret docker-registry regcred \
  --docker-server=docker.io \
  --docker-username=yourusername \
  --docker-password=yourpassword \
  --docker-email=your@email.com
```

#### 3. Deploy PostgreSQL

```bash
kubectl apply -f k8s/postgres/
```

Wait for PostgreSQL to be ready:
```bash
kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s
```

#### 4. Deploy Backend Services

```bash
kubectl apply -f k8s/user-service/
kubectl apply -f k8s/medicine-service/
kubectl apply -f k8s/order-service/
```

#### 5. Deploy Frontend

```bash
kubectl apply -f k8s/frontend-service/
```

#### 6. Deploy Ingress

```bash
kubectl apply -f k8s/ingress/
```

### Verify Deployment

```bash
# Check all pods
kubectl get pods

# Check services
kubectl get services

# Check ingress
kubectl get ingress

# Check pod logs
kubectl logs -f deployment/user-service

# Describe pod for troubleshooting
kubectl describe pod <pod-name>
```

### Access the Application

```bash
# Get Ingress IP
kubectl get ingress microservice-ingress

# Add to /etc/hosts (for local testing)
echo "<INGRESS-IP> pharmacy.local" | sudo tee -a /etc/hosts

# Access application
open http://pharmacy.local
```

## Kubernetes Manifests Examples

### User Service Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    app: user-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: yourusername/pharmacy-user-service:latest
        ports:
        - containerPort: 8081
        env:
        - name: SPRING_DATASOURCE_URL
          value: jdbc:postgresql://postgres-service:5432/microservices_db
        - name: SPRING_DATASOURCE_USERNAME
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: username
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8081
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8081
          initialDelaySeconds: 30
          periodSeconds: 5
```

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Production Considerations

### Security

1. **Use Secrets Management**
   - Kubernetes Secrets
   - HashiCorp Vault
   - AWS Secrets Manager
   - Azure Key Vault

2. **Enable HTTPS**
   - Use cert-manager for automatic SSL certificates
   - Let's Encrypt integration
   - Configure TLS in Ingress

3. **Network Policies**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: NetworkPolicy
   metadata:
     name: backend-network-policy
   spec:
     podSelector:
       matchLabels:
         tier: backend
     policyTypes:
     - Ingress
     ingress:
     - from:
       - podSelector:
           matchLabels:
             tier: frontend
   ```

4. **Pod Security Standards**
   - Use non-root containers
   - Read-only root filesystem
   - Drop unnecessary capabilities

### High Availability

1. **Multiple Replicas**
   ```bash
   kubectl scale deployment user-service --replicas=3
   ```

2. **Pod Disruption Budgets**
   ```yaml
   apiVersion: policy/v1
   kind: PodDisruptionBudget
   metadata:
     name: user-service-pdb
   spec:
     minAvailable: 1
     selector:
       matchLabels:
         app: user-service
   ```

3. **Multi-Zone Deployment**
   - Use node affinity
   - Spread pods across availability zones

### Database

1. **Use Managed Database**
   - AWS RDS
   - Google Cloud SQL
   - Azure Database for PostgreSQL

2. **Database Backups**
   ```bash
   # Automated backup with CronJob
   kubectl apply -f k8s/backup-cronjob.yaml
   ```

3. **Connection Pooling**
   - Configure HikariCP in Spring Boot
   - Set appropriate pool sizes

### Monitoring

1. **Prometheus + Grafana**
   ```bash
   # Install Prometheus Operator
   kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml
   
   # Deploy ServiceMonitor
   kubectl apply -f k8s/monitoring/service-monitor.yaml
   ```

2. **Logging**
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Fluentd for log aggregation
   - CloudWatch Logs (AWS)

3. **Distributed Tracing**
   - Jaeger
   - Zipkin
   - AWS X-Ray

### Performance

1. **Resource Limits**
   - Set appropriate CPU/memory requests and limits
   - Use Vertical Pod Autoscaler for recommendations

2. **Caching**
   - Redis for session management
   - CDN for static assets

3. **Database Optimization**
   - Proper indexing
   - Query optimization
   - Connection pooling

## Environment Configuration

### Development
```yaml
replicas: 1
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "250m"
```

### Staging
```yaml
replicas: 2
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"
```

### Production
```yaml
replicas: 3
resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

## Rolling Updates

```bash
# Update image
kubectl set image deployment/user-service \
  user-service=yourusername/pharmacy-user-service:v2.0.0

# Check rollout status
kubectl rollout status deployment/user-service

# Rollback if needed
kubectl rollout undo deployment/user-service

# View rollout history
kubectl rollout history deployment/user-service
```

## Troubleshooting

### Common Issues

1. **Pods not starting**
   ```bash
   kubectl describe pod <pod-name>
   kubectl logs <pod-name>
   ```

2. **Service not accessible**
   ```bash
   kubectl get endpoints
   kubectl describe service <service-name>
   ```

3. **Database connection issues**
   ```bash
   # Test database connectivity
   kubectl run -it --rm debug --image=postgres:16 --restart=Never -- \
     psql -h postgres-service -U admin -d microservices_db
   ```

4. **Ingress not working**
   ```bash
   kubectl describe ingress microservice-ingress
   kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
   ```

## Cleanup

### Docker Compose
```bash
docker-compose -f docker-compose.prod.yml down -v
```

### Kubernetes
```bash
# Delete all resources
kubectl delete -f k8s/

# Delete namespace
kubectl delete namespace pharmacy-system
```

## CI/CD Integration

See [CI/CD Documentation](./CICD.md) for automated deployment pipelines.

---

For more information:
- [Getting Started Guide](./GETTING_STARTED.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Monitoring Guide](./MONITORING.md)