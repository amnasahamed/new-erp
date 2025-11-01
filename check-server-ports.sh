#!/bin/bash
# Quick Port Check Script
# Run this first to check for conflicts before deploying

echo "==========================================="
echo "Checking Server Ports"
echo "==========================================="
echo ""

# Check Docker containers
echo "Currently running Docker containers:"
echo ""
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}" || echo "Docker not running or not installed"

echo ""
echo "==========================================="
echo "Checking Required Ports"
echo "==========================================="
echo ""

check_port() {
    PORT=$1
    SERVICE=$2

    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "❌ Port $PORT ($SERVICE) - IN USE"
        echo "   Process:"
        lsof -i :$PORT | grep LISTEN
        echo ""
        return 1
    else
        echo "✅ Port $PORT ($SERVICE) - AVAILABLE"
        return 0
    fi
}

ALL_CLEAR=true

check_port 3000 "Frontend" || ALL_CLEAR=false
check_port 3001 "Backend API" || ALL_CLEAR=false
check_port 5432 "PostgreSQL" || ALL_CLEAR=false

echo ""
echo "==========================================="

if [ "$ALL_CLEAR" = true ]; then
    echo "✅ ALL PORTS AVAILABLE - Ready to deploy!"
    echo ""
    echo "Next step: Run deployment script"
    echo "  ./deploy-to-server.sh"
else
    echo "⚠️  PORT CONFLICTS DETECTED"
    echo ""
    echo "Options:"
    echo ""
    echo "1. Stop conflicting containers:"
    echo "   docker stop <container-name>"
    echo ""
    echo "2. Use different ports in docker-compose.yml:"
    echo "   Change '3000:3000' to '8000:3000' for frontend"
    echo "   Change '3001:3001' to '8001:3001' for backend"
    echo "   Change '5432:5432' to '5433:5432' for postgres"
    echo ""
fi

echo "==========================================="
