#!/bin/bash

# FlowSync Full-Stack Startup Script

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   FlowSync Full-Stack Application    ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if FlowSync backend is running
echo -e "${YELLOW}Checking FlowSync backend...${NC}"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 3000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend not running. Starting it...${NC}"
    echo ""
    echo "Starting FlowSync backend in background..."
    cd "$(dirname "$0")"
    npm run dev > /tmp/flowsync-backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    
    echo "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend started!${NC}"
            break
        fi
        sleep 1
    done
fi

echo ""
echo -e "${YELLOW}Starting frontend server...${NC}"

# Check if port 8080 is available
if lsof -ti:8080 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8080 is in use. Using port 8081 instead.${NC}"
    FRONTEND_PORT=8081
else
    FRONTEND_PORT=8080
fi

cd "$(dirname "$0")"

# Start frontend
echo "Starting frontend on port $FRONTEND_PORT..."
npx http-server public -p $FRONTEND_PORT -c-1 > /tmp/flowsync-frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 2

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✅ Full-Stack App Running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend API:  ${BLUE}http://localhost:3000${NC}"
echo -e "Frontend UI:  ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
echo -e "Workbench:    ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for interrupt
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait

