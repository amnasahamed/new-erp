# Server Deployment Guide

Deploy your ERP system to production server: **157.173.97.181**

## Quick Deployment (Recommended)

### Step 1: Copy deployment script to server

```bash
# On your local machine
scp deploy-to-server.sh root@157.173.97.181:/root/
```

### Step 2: Run deployment script on server

```bash
# SSH into server
ssh root@157.173.97.181

# Run deployment script
chmod +x /root/deploy-to-server.sh
/root/deploy-to-server.sh
```

The script will:
- ✅ Install Docker if needed
- ✅ Check for port conflicts
- ✅ Clone your repository
- ✅ Run the setup script
- ✅ Start all services

## Manual Deployment

If you prefer to do it manually:

### Step 1: SSH into server

```bash
ssh root@157.173.97.181
```

### Step 2: Check for port conflicts

```bash
# Check running Docker containers
docker ps

# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL
```

**If ports are in use**, you have two options:

**Option A: Stop conflicting containers**
```bash
docker ps  # Find container names
docker stop <container-name>
```

**Option B: Use different ports**

Edit `docker-compose.yml` and change:
```yaml
# Frontend - change from:
ports:
  - "3000:3000"
# To:
ports:
  - "8000:3000"

# Backend - change from:
ports:
  - "3001:3001"
# To:
ports:
  - "8001:3001"

# PostgreSQL - change from:
ports:
  - "5432:5432"
# To:
ports:
  - "5433:5432"
```

### Step 3: Install Docker (if not installed)

```bash
# Check if Docker is installed
docker --version

# If not installed:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### Step 4: Clone repository

```bash
# Clone to /opt directory
cd /opt
git clone https://github.com/amnasahamed/new-erp.git
cd new-erp

# Checkout the deployment branch
git checkout claude/erp-builder-validation-checklist-011CUdKmkU5UsP92WUgTqffA
```

### Step 5: Deploy

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

### Step 6: Verify deployment

```bash
# Check containers are running
docker ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Test backend API
curl http://localhost:3001/api/health
```

## Access Your ERP System

After deployment, access at:
- **Frontend**: http://157.173.97.181:3000
- **Backend API**: http://157.173.97.181:3001/api

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clapslearn.com | 01-01-1990 |
| Coordinator | coordinator@clapslearn.com | 15-03-1985 |
| Teacher | teacher@clapslearn.com | 10-05-1992 |
| Parent | parent@clapslearn.com | 20-07-1988 |
| HR | hr@clapslearn.com | 05-11-1987 |
| Accountant | accountant@clapslearn.com | 25-09-1989 |

## Post-Deployment

### Useful Commands

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database!)
docker-compose down -v

# Update to latest code
git pull origin claude/erp-builder-validation-checklist-011CUdKmkU5UsP92WUgTqffA
docker-compose up -d --build
```

### Configure Firewall (if needed)

```bash
# Allow ports through firewall
ufw allow 3000/tcp  # Frontend
ufw allow 3001/tcp  # Backend API
```

### Set up SSL/HTTPS (Optional but recommended)

#### Option 1: Using Nginx Reverse Proxy

```bash
# Install Nginx
apt update
apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
cat > /etc/nginx/sites-available/erp << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d your-domain.com
```

#### Option 2: Using Cloudflare

1. Add your domain to Cloudflare
2. Point A record to: 157.173.97.181
3. Enable Cloudflare proxy (orange cloud)
4. SSL will be automatic

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Connect to database directly
docker-compose exec postgres psql -U erp_user -d claps_learn_erp
```

### Frontend Can't Connect to Backend

```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check environment variables
docker-compose exec frontend env | grep NEXT_PUBLIC

# Rebuild frontend with correct API URL
docker-compose up -d --build frontend
```

### Containers Won't Start

```bash
# Check logs
docker-compose logs

# Remove and recreate
docker-compose down
docker-compose up -d

# If database issues, reset (⚠️ deletes data!)
docker-compose down -v
./setup.sh
```

## Monitoring

### View System Resources

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

### Set up Auto-restart

Containers are configured with `restart: always` in docker-compose.yml, so they will automatically restart on:
- Server reboot
- Container crash
- Docker daemon restart

## Backup

### Database Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U erp_user claps_learn_erp > backup-$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T postgres psql -U erp_user claps_learn_erp < backup-20241030.sql
```

### Full Backup

```bash
# Backup entire volume
docker run --rm -v new-erp_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres-backup.tar.gz /data
```

## Production Checklist

Before going live:

- [ ] Change default JWT_SECRET in backend/.env
- [ ] Change database password
- [ ] Disable test user accounts
- [ ] Set up SSL certificate
- [ ] Configure firewall
- [ ] Set up automated backups
- [ ] Configure monitoring/alerting
- [ ] Update CORS settings for production domain
- [ ] Set NODE_ENV=production

## Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Check container status: `docker ps -a`
3. Check system resources: `docker stats`
4. Restart services: `docker-compose restart`
5. Review troubleshooting section above

---

**Your ERP system is ready for production!** 🚀
