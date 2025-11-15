# Deployment Guide

## Table of Contents

- [Overview](#overview)
- [Docker Deployment](#docker-deployment)
- [Production Environment Setup](#production-environment-setup)
- [Manual Deployment](#manual-deployment)
- [Cloud Deployment Options](#cloud-deployment-options)
- [CI/CD Pipeline](#cicd-pipeline)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Rollback Procedures](#rollback-procedures)

---

## Overview

This guide covers deploying the Angular LMS application to production environments using various methods including Docker, cloud platforms, and manual deployment.

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Load Balancer / CDN             │
│         (Optional)                       │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         Nginx (Reverse Proxy)           │
│  - Serves Angular static files          │
│  - Proxies /api/* to backend            │
│  - SSL termination                      │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│      Node.js Backend (Express)          │
│  - RESTful API                          │
│  - Business logic                       │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│      PostgreSQL Database                │
│  - Data persistence                     │
│  - Backup & replication                 │
└─────────────────────────────────────────┘
```

---

## Docker Deployment

Docker is the recommended deployment method as it provides consistency across environments.

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 20GB disk space

### Quick Start

#### 1. Clone and Configure

```bash
git clone https://github.com/yourusername/angular-sample-app.git
cd angular-sample-app
```

#### 2. Configure Environment Variables

Edit `docker-compose.yml` and update:

```yaml
services:
  backend:
    environment:
      # Database
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: lms_db
      DB_USER: lms_user
      DB_PASSWORD: CHANGE_THIS_PASSWORD  # ⚠️ Change in production

      # JWT
      JWT_SECRET: CHANGE_THIS_TO_RANDOM_STRING  # ⚠️ Change in production
      JWT_EXPIRES_IN: 7d

      # CORS
      CORS_ORIGIN: http://your-domain.com  # ⚠️ Update with your domain

  postgres:
    environment:
      POSTGRES_USER: lms_user
      POSTGRES_PASSWORD: CHANGE_THIS_PASSWORD  # ⚠️ Must match DB_PASSWORD
      POSTGRES_DB: lms_db
```

#### 3. Build and Start Services

```bash
# Build all services
docker compose build

# Start all services in background
docker compose up -d

# View logs
docker compose logs -f
```

#### 4. Access Application

- Frontend: http://localhost
- Backend API: http://localhost:3000/api
- Database: localhost:5432

### Docker Commands Reference

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f [service-name]

# Restart a service
docker compose restart backend

# View running containers
docker compose ps

# Execute command in container
docker compose exec backend npm run seed

# Rebuild and restart
docker compose up -d --build

# Remove containers and volumes (⚠️ deletes database)
docker compose down -v

# View resource usage
docker stats
```

### Production Docker Configuration

For production, create a separate `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-prod.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro  # SSL certificates
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: lms_db
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
      CORS_ORIGIN: https://your-domain.com
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: lms_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups  # For database backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

Run with:
```bash
docker compose -f docker-compose.prod.yml up -d
```

### SSL Configuration (Production)

#### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certificates will be saved to:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
```

#### Update Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Production Environment Setup

### Environment Variables

Create a `.env.production` file (never commit this):

```env
# Application
NODE_ENV=production

# Database
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=lms_db
DB_USER=lms_user
DB_PASSWORD=strong_random_password_here

# JWT
JWT_SECRET=your_very_strong_random_secret_key_min_32_chars
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-domain.com

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_password

# Storage (optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your-lms-bucket
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (min 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Set `synchronize: false` in TypeORM config
- [ ] Enable database backups
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting
- [ ] Remove development dependencies from production build
- [ ] Set secure HTTP headers
- [ ] Configure CORS for production domain only

### TypeORM Production Configuration

Update `backend/src/config/database.ts`:

```typescript
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../entities/*.{js,ts}'],
  synchronize: false, // ⚠️ MUST be false in production
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  migrations: [__dirname + '/../migrations/*.{js,ts}'],
  migrationsRun: true
});
```

---

## Manual Deployment

### Server Requirements

- Ubuntu 20.04+ or similar Linux distribution
- 2GB RAM minimum (4GB recommended)
- 20GB disk space
- Node.js 18+
- PostgreSQL 15+
- Nginx
- PM2 (process manager)

### Step-by-Step Deployment

#### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

#### 2. Configure PostgreSQL

```bash
# Login as postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE lms_db;
CREATE USER lms_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
\q
```

#### 3. Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/angular-sample-app.git
sudo chown -R $USER:$USER angular-sample-app
cd angular-sample-app

# Install dependencies
npm run install:all

# Configure environment
cd backend
cp .env.example .env
nano .env  # Edit with production values

# Build frontend
cd ..
npm run build

# Build backend
cd backend
npm run build
```

#### 4. Configure PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'lms-backend',
    cwd: '/var/www/angular-sample-app/backend',
    script: 'dist/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/lms/backend-error.log',
    out_file: '/var/log/lms/backend-out.log',
    time: true
  }]
};
```

Start with PM2:

```bash
# Create log directory
sudo mkdir -p /var/log/lms
sudo chown $USER:$USER /var/log/lms

# Start application
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs

# View logs
pm2 logs lms-backend
```

#### 5. Configure Nginx

Create `/etc/nginx/sites-available/lms`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    root /var/www/angular-sample-app/dist/myapp;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Cloud Deployment Options

### AWS Deployment

#### Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init -p node.js-18 lms-app

# Create environment
eb create lms-production

# Deploy
eb deploy

# Open application
eb open
```

#### Using EC2 + RDS

1. **Launch EC2 Instance** (t3.medium or larger)
2. **Create RDS PostgreSQL Instance**
3. **Configure Security Groups** (allow ports 80, 443, 5432)
4. **Follow Manual Deployment steps** on EC2
5. **Point RDS endpoint** in environment variables

### DigitalOcean Deployment

#### Using App Platform

1. Connect GitHub repository
2. Configure build settings:
   - **Frontend**:
     - Build Command: `npm run build`
     - Output Directory: `dist/myapp`
   - **Backend**:
     - Build Command: `cd backend && npm run build`
     - Run Command: `cd backend && npm start`
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

#### Using Droplet

1. Create Ubuntu 20.04 droplet (2GB RAM minimum)
2. Follow [Manual Deployment](#manual-deployment) steps
3. Configure domain DNS to point to droplet IP

### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create lms-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_here

# Deploy
git push heroku main

# Open app
heroku open
```

### Vercel (Frontend Only)

Vercel is great for deploying the Angular frontend:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

For backend, use separate service (Heroku, Railway, etc.)

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm run install:all

      - name: Run frontend tests
        run: npm test -- --watch=false --browsers=ChromeHeadless

      - name: Run backend tests
        run: cd backend && npm test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm run install:all

      - name: Build frontend
        run: npm run build

      - name: Build backend
        run: cd backend && npm run build

      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          source: "dist/,backend/dist/"
          target: "/var/www/angular-sample-app"

      - name: Restart application
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/angular-sample-app
            pm2 restart lms-backend
```

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm run install:all
    - npm test -- --watch=false --browsers=ChromeHeadless
    - cd backend && npm test

build:
  stage: build
  image: node:18
  script:
    - npm run install:all
    - npm run build
    - cd backend && npm run build
  artifacts:
    paths:
      - dist/
      - backend/dist/

deploy:
  stage: deploy
  only:
    - main
  script:
    - apt-get update -qq && apt-get install -y -qq sshpass
    - sshpass -p "$SERVER_PASSWORD" scp -r dist/ backend/dist/ $SERVER_USER@$SERVER_HOST:/var/www/angular-sample-app/
    - sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_HOST "cd /var/www/angular-sample-app && pm2 restart lms-backend"
```

---

## Post-Deployment

### Database Migration

```bash
# SSH into server
ssh user@your-server.com

# Navigate to backend directory
cd /var/www/angular-sample-app/backend

# Run migrations
npm run typeorm migration:run

# Verify
npm run typeorm migration:show
```

### Seed Initial Data

```bash
cd /var/www/angular-sample-app/backend
npm run seed
```

### Verification Checklist

- [ ] Frontend loads successfully
- [ ] API endpoints respond correctly
- [ ] Database connection established
- [ ] User registration works
- [ ] User login works
- [ ] Course enrollment works
- [ ] Quiz submission works
- [ ] SSL certificate valid
- [ ] Logs are being generated
- [ ] Monitoring alerts configured

---

## Monitoring & Maintenance

### Application Monitoring

**PM2 Monitoring:**
```bash
pm2 monit
pm2 status
pm2 logs lms-backend --lines 100
```

**Nginx Logs:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backup

**Automated Daily Backup:**

Create `/usr/local/bin/backup-lms-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="lms_db_$DATE.sql"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U lms_user lms_db > $BACKUP_DIR/$FILENAME

# Compress
gzip $BACKUP_DIR/$FILENAME

# Delete backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $FILENAME.gz"
```

Make executable and add to crontab:

```bash
sudo chmod +x /usr/local/bin/backup-lms-db.sh

# Run daily at 2 AM
crontab -e
# Add line:
0 2 * * * /usr/local/bin/backup-lms-db.sh >> /var/log/lms-backup.log 2>&1
```

### Health Checks

Add health check endpoint to backend:

```typescript
// backend/src/app.ts
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### Performance Monitoring

Consider integrating:
- **New Relic** - Application performance monitoring
- **DataDog** - Infrastructure monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay

---

## Rollback Procedures

### Quick Rollback

```bash
# Using Git
cd /var/www/angular-sample-app
git log --oneline  # Find previous commit
git checkout <previous-commit-hash>
npm run build
cd backend && npm run build
pm2 restart lms-backend
sudo systemctl reload nginx
```

### Database Rollback

```bash
# Restore from backup
gunzip /backups/postgres/lms_db_2024-01-25.sql.gz
psql -U lms_user lms_db < /backups/postgres/lms_db_2024-01-25.sql
```

### PM2 Rollback

```bash
# Revert to previous version
pm2 delete lms-backend
pm2 start /path/to/previous/ecosystem.config.js
```

---

## Troubleshooting Production Issues

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs lms-backend --err

# Check Node.js process
ps aux | grep node

# Check port availability
lsof -i :3000
```

### Database Connection Issues

```bash
# Test database connection
psql -U lms_user -h localhost -d lms_db

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### High Memory Usage

```bash
# Check memory
free -h

# Check PM2 processes
pm2 status

# Restart with cluster mode
pm2 restart lms-backend --instances max
```

---

**Last Updated:** 2024-01-26
