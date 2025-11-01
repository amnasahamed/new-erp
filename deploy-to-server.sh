#!/bin/bash
# Deployment Script for ERP System
# Run this on your server: root@157.173.97.181

set -e  # Exit on error

echo "========================================="
echo "ERP System Deployment Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Docker
echo -e "${YELLOW}Step 1: Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo -e "${GREEN}Docker is already installed${NC}"
    docker --version
fi

# Step 2: Check Docker Compose
echo ""
echo -e "${YELLOW}Step 2: Checking Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Installing...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo -e "${GREEN}Docker Compose is already installed${NC}"
    docker-compose --version
fi

# Step 3: Check running containers and ports
echo ""
echo -e "${YELLOW}Step 3: Checking for port conflicts...${NC}"
echo "Currently running Docker containers:"
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

echo ""
echo "Checking if ports 3000, 3001, 5432 are available..."

check_port() {
    PORT=$1
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}⚠️  Port $PORT is already in use!${NC}"
        echo "Process using port $PORT:"
        lsof -i :$PORT
        return 1
    else
        echo -e "${GREEN}✓ Port $PORT is available${NC}"
        return 0
    fi
}

PORT_3000_OK=true
PORT_3001_OK=true
PORT_5432_OK=true

check_port 3000 || PORT_3000_OK=false
check_port 3001 || PORT_3001_OK=false
check_port 5432 || PORT_5432_OK=false

# Step 4: Suggest port changes if needed
if [ "$PORT_3000_OK" = false ] || [ "$PORT_3001_OK" = false ] || [ "$PORT_5432_OK" = false ]; then
    echo ""
    echo -e "${YELLOW}=========================================${NC}"
    echo -e "${YELLOW}PORT CONFLICTS DETECTED${NC}"
    echo -e "${YELLOW}=========================================${NC}"
    echo ""
    echo "You have two options:"
    echo ""
    echo "Option 1: Stop the conflicting containers"
    echo "  Run: docker stop <container-name>"
    echo ""
    echo "Option 2: Use different ports (recommended)"
    echo "  Edit docker-compose.yml and change:"
    if [ "$PORT_3000_OK" = false ]; then
        echo "    - Frontend: '8000:3000' instead of '3000:3000'"
    fi
    if [ "$PORT_3001_OK" = false ]; then
        echo "    - Backend: '8001:3001' instead of '3001:3001'"
    fi
    if [ "$PORT_5432_OK" = false ]; then
        echo "    - PostgreSQL: '5433:5432' instead of '5432:5432'"
    fi
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled. Please fix port conflicts and try again."
        exit 1
    fi
fi

# Step 5: Clone repository
echo ""
echo -e "${YELLOW}Step 4: Setting up repository...${NC}"
REPO_DIR="/opt/claps-erp"

if [ -d "$REPO_DIR" ]; then
    echo "Repository already exists. Updating..."
    cd $REPO_DIR
    git fetch origin
    git checkout claude/erp-builder-validation-checklist-011CUdKmkU5UsP92WUgTqffA
    git pull origin claude/erp-builder-validation-checklist-011CUdKmkU5UsP92WUgTqffA
else
    echo "Cloning repository..."
    git clone https://github.com/amnasahamed/new-erp.git $REPO_DIR
    cd $REPO_DIR
    git checkout claude/erp-builder-validation-checklist-011CUdKmkU5UsP92WUgTqffA
fi

# Step 6: Make setup.sh executable
echo ""
echo -e "${YELLOW}Step 5: Running setup script...${NC}"
chmod +x setup.sh

# Step 7: Run setup
echo ""
echo -e "${GREEN}Starting ERP installation...${NC}"
./setup.sh

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Your ERP system is now running!"
echo ""
echo "Access URLs:"
echo "  Frontend: http://157.173.97.181:3000"
echo "  Backend API: http://157.173.97.181:3001/api"
echo ""
echo "Test Credentials:"
echo "  Admin: admin@clapslearn.com / 01-01-1990"
echo "  Coordinator: coordinator@clapslearn.com / 15-03-1985"
echo "  Teacher: teacher@clapslearn.com / 10-05-1992"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop system: docker-compose down"
echo "  Restart: docker-compose restart"
echo ""
