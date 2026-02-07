#!/bin/bash

# TVS Procurement - Production Runner
# Uses PM2 to keep services alive

# 1. Install PM2 if not exists
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# 2. Kill existing processes
echo "Stopping existing services..."
pm2 delete all || true

# 3. Start services
echo "Starting services..."
pm2 start ecosystem.config.js

# 4. Save list
pm2 save

echo "----------------------------------------"
echo "✅ Services started!"
echo "Backend: http://localhost:8020 (or remote IP)"
echo "Frontend: http://localhost:3020 (or remote IP)"
echo "----------------------------------------"
echo "To view logs: pm2 logs"
echo "To stop: pm2 stop all"
