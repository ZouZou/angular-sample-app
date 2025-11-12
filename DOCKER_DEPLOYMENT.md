# Docker Deployment Guide

This guide explains how to deploy the Learning Management System using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

To check your versions:
```bash
docker --version
docker compose version
```

## Architecture

The application consists of three containerized services:

1. **Frontend** (Angular 20) - Served by Nginx on port 80
2. **Backend** (Node.js/Express) - API server on port 3000
3. **Database** (PostgreSQL 15) - Database server on port 5432

All services are connected via a Docker bridge network for secure communication.

## Quick Start

### 1. Build and Start All Services

```bash
docker compose up -d
```

This command will:
- Build the frontend and backend Docker images
- Pull the PostgreSQL image
- Create a dedicated Docker network
- Start all three containers in detached mode

### 2. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432

### 3. Check Service Status

```bash
docker compose ps
```

### 4. View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f db
```

## Detailed Commands

### Build Services

Build all services:
```bash
docker compose build
```

Build a specific service:
```bash
docker compose build frontend
docker compose build backend
```

Build without cache (clean build):
```bash
docker compose build --no-cache
```

### Start Services

Start all services:
```bash
docker compose up -d
```

Start specific services:
```bash
docker compose up -d db backend
```

Start with build:
```bash
docker compose up -d --build
```

### Stop Services

Stop all services (containers remain):
```bash
docker compose stop
```

Stop and remove containers:
```bash
docker compose down
```

Stop and remove containers + volumes (⚠️ deletes database data):
```bash
docker compose down -v
```

### Restart Services

Restart all services:
```bash
docker compose restart
```

Restart specific service:
```bash
docker compose restart backend
```

## Database Management

### Access PostgreSQL CLI

```bash
docker compose exec db psql -U postgres -d lms_db
```

### Backup Database

```bash
docker compose exec db pg_dump -U postgres lms_db > backup.sql
```

### Restore Database

```bash
docker compose exec -T db psql -U postgres lms_db < backup.sql
```

### View Database Logs

```bash
docker compose logs -f db
```

## Development Workflow

### Make Changes to Backend

1. Modify code in `backend/` directory
2. Rebuild and restart:
   ```bash
   docker compose up -d --build backend
   ```

### Make Changes to Frontend

1. Modify code in `src/` directory
2. Rebuild and restart:
   ```bash
   docker compose up -d --build frontend
   ```

### Execute Commands in Containers

Run command in backend container:
```bash
docker compose exec backend npm run seed
```

Run command in frontend container:
```bash
docker compose exec frontend nginx -t
```

Open shell in container:
```bash
docker compose exec backend sh
```

## Configuration

### Environment Variables

Modify environment variables in `docker-compose.yml` under each service's `environment` section:

```yaml
backend:
  environment:
    PORT: 3000
    DB_HOST: db
    JWT_SECRET: your-secret-key
    # ... other variables
```

### Database Credentials

**⚠️ Important for Production**: Change the default database credentials in `docker-compose.yml`:

```yaml
db:
  environment:
    POSTGRES_PASSWORD: YOUR_SECURE_PASSWORD
```

Also update the backend environment variables to match.

### Ports

To change exposed ports, modify the `ports` section in `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "8080:80"  # Access frontend on port 8080

backend:
  ports:
    - "3001:3000"  # Access backend on port 3001
```

## Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use secure JWT_SECRET (generate with: `openssl rand -base64 32`)
- [ ] Update CORS_ORIGIN to your production domain
- [ ] Use environment variables file for sensitive data
- [ ] Enable HTTPS/SSL (configure reverse proxy)
- [ ] Review and harden nginx configuration
- [ ] Set up database backups
- [ ] Configure proper logging
- [ ] Set resource limits in docker-compose.yml

### Using Environment File

Create a `.env` file in the project root:

```bash
cp .env.docker .env
```

Edit `.env` with your production values, then reference in docker-compose.yml:

```yaml
backend:
  env_file:
    - .env
```

### Resource Limits

Add resource limits to prevent containers from consuming too much:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```

## Troubleshooting

### Container Won't Start

Check logs:
```bash
docker compose logs backend
```

Check container status:
```bash
docker compose ps
```

### Database Connection Issues

1. Ensure database is healthy:
   ```bash
   docker compose ps db
   ```

2. Check database logs:
   ```bash
   docker compose logs db
   ```

3. Verify environment variables in docker-compose.yml

### Port Already in Use

If you see "port is already allocated" error:

1. Check what's using the port:
   ```bash
   lsof -i :80
   lsof -i :3000
   ```

2. Stop the conflicting service or change the port in docker-compose.yml

### Frontend Can't Connect to Backend

1. Check CORS settings in backend environment
2. Verify backend is running: `docker compose ps backend`
3. Test API directly: `curl http://localhost:3000/health`

### Database Data Persists After Restart

This is intentional. The database uses a Docker volume named `postgres_data`.

To start fresh:
```bash
docker compose down -v
docker compose up -d
```

### Build Fails

Clear Docker cache and rebuild:
```bash
docker compose down
docker system prune -f
docker compose build --no-cache
docker compose up -d
```

## Monitoring

### Check Container Health

```bash
docker compose ps
```

Healthy containers show "healthy" status.

### Resource Usage

```bash
docker stats
```

### Container Inspection

```bash
docker inspect lms-frontend
docker inspect lms-backend
docker inspect lms-database
```

## Cleanup

### Remove Stopped Containers

```bash
docker compose down
```

### Remove Images

```bash
docker compose down --rmi all
```

### Remove Volumes (⚠️ Deletes Data)

```bash
docker compose down -v
```

### Complete Cleanup

```bash
docker compose down -v --rmi all
docker system prune -a -f
```

## Advanced Configuration

### Using Multiple Compose Files

Development:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Production:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Scaling Services

Scale backend instances:
```bash
docker compose up -d --scale backend=3
```

Note: Requires load balancer configuration.

### Health Checks

All services include health checks. View status:
```bash
docker compose ps
```

## CI/CD Integration

### Build Images

```bash
docker compose build
```

### Run Tests

```bash
docker compose run --rm backend npm test
```

### Push to Registry

```bash
docker tag lms-frontend:latest your-registry/lms-frontend:v1.0.0
docker push your-registry/lms-frontend:v1.0.0
```

## Support

For issues or questions:
- Check the logs: `docker compose logs -f`
- Review this documentation
- Consult Docker documentation: https://docs.docker.com/

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)
- [Node.js Docker Hub](https://hub.docker.com/_/node)
