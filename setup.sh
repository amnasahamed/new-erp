#!/bin/bash

# Claps Learn ERP - Complete Setup Script
# This script sets up the entire ERP system with one command

set -e

echo "======================================"
echo "Claps Learn ERP - Complete Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if Docker is installed
print_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Check if Node.js is installed (for local development)
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION is installed"
else
    print_info "Node.js not found (optional for local development)"
fi

# Create .env file if it doesn't exist
print_info "Setting up environment variables..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    print_success "Created backend/.env from example"
else
    print_info "backend/.env already exists, skipping..."
fi

# Generate a random JWT secret
if grep -q "your-super-secret-jwt-key-change-this-in-production" backend/.env; then
    JWT_SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" backend/.env
    else
        # Linux
        sed -i "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" backend/.env
    fi
    print_success "Generated secure JWT secret"
fi

# Update DATABASE_URL in .env
if grep -q "username:password@localhost" backend/.env; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's|postgresql://username:password@localhost:5432/claps_learn_erp|postgresql://erp_user:erp_password@postgres:5432/claps_learn_erp|' backend/.env
    else
        sed -i 's|postgresql://username:password@localhost:5432/claps_learn_erp|postgresql://erp_user:erp_password@postgres:5432/claps_learn_erp|' backend/.env
    fi
    print_success "Updated DATABASE_URL for Docker"
fi

# Stop any running containers
print_info "Stopping any running containers..."
docker-compose down 2>/dev/null || true

# Build and start services
print_info "Building Docker images (this may take a few minutes)..."
docker-compose build

print_success "Docker images built successfully"

# Start services
print_info "Starting services..."
docker-compose up -d

print_success "Services started"

# Wait for database to be ready
print_info "Waiting for database to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_success "All services are running"
else
    print_error "Some services failed to start"
    echo "Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "======================================"
print_success "Setup Complete!"
echo "======================================"
echo ""
echo "Your Claps Learn ERP system is now running!"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  Health Check: http://localhost:3001/health"
echo ""
echo "Test Credentials:"
echo "  Admin:       admin@clapslearn.com       / 01-01-1990"
echo "  Coordinator: coordinator@clapslearn.com / 15-03-1985"
echo "  Teacher:     teacher@clapslearn.com     / 12-09-1992"
echo "  Parent:      parent@example.com         / 05-08-1985"
echo "  HR:          hr@clapslearn.com          / 20-06-1988"
echo "  Accountant:  accountant@clapslearn.com  / 10-12-1987"
echo ""
echo "Useful commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Stop system:   docker-compose down"
echo "  Restart:       docker-compose restart"
echo "  Update code:   git pull && docker-compose up -d --build"
echo ""
echo "Documentation:"
echo "  Main README:           README.md"
echo "  Backend README:        backend/README.md"
echo "  Validation Report:     VALIDATION_REPORT.md"
echo "  Validation Proof:      VALIDATION_PROOF.md"
echo ""
print_success "Happy learning! 🎓"
