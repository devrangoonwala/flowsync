#!/bin/bash

# FlowSync Demo Script
# This script demonstrates the FlowSync workflow orchestration platform

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   FlowSync Demo - Workflow Platform   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if server is running
echo -e "${YELLOW}Checking if server is running...${NC}"
if ! curl -s "$BASE_URL/metrics" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Server not running. Please start with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is running!${NC}"
echo ""

# Step 1: Create a workflow
echo -e "${BLUE}Step 1: Creating a workflow...${NC}"
WORKFLOW_RESPONSE=$(curl -s -X POST "$BASE_URL/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Content Processing Pipeline",
    "description": "Processes content through AI analysis and generates reports",
    "steps": [
      {
        "id": "validate-input",
        "type": "api",
        "config": {"validation": "strict"}
      },
      {
        "id": "ai-analysis",
        "type": "ai",
        "config": {"model": "gpt-4", "task": "analyze"}
      },
      {
        "id": "generate-report",
        "type": "job",
        "config": {"type": "report_generation"}
      }
    ]
  }')

WORKFLOW_ID=$(echo $WORKFLOW_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Workflow created!${NC}"
echo "Workflow ID: $WORKFLOW_ID"
echo "Response: $WORKFLOW_RESPONSE"
echo ""

# Wait a moment for AI analysis
echo -e "${YELLOW}Waiting for AI agents to analyze workflow...${NC}"
sleep 2

# Step 2: List workflows
echo -e "${BLUE}Step 2: Listing all workflows...${NC}"
curl -s "$BASE_URL/workflows" | python3 -m json.tool
echo ""

# Step 3: Execute workflow
echo -e "${BLUE}Step 3: Executing workflow...${NC}"
EXECUTION_RESPONSE=$(curl -s -X POST "$BASE_URL/workflows/$WORKFLOW_ID/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "data": "Sample content for processing",
      "options": {
        "async": true,
        "priority": "high"
      }
    }
  }')

EXECUTION_ID=$(echo $EXECUTION_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Workflow execution started!${NC}"
echo "Execution ID: $EXECUTION_ID"
echo ""

# Step 4: Check execution status
echo -e "${BLUE}Step 4: Checking execution status...${NC}"
sleep 2
curl -s "$BASE_URL/executions/$EXECUTION_ID" | python3 -m json.tool
echo ""

# Step 5: Trigger background job
echo -e "${BLUE}Step 5: Triggering background job...${NC}"
JOB_RESPONSE=$(curl -s -X POST "$BASE_URL/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "data_processing",
    "data": {
      "records": 1000,
      "format": "json"
    },
    "duration": 3000
  }')
echo -e "${GREEN}✅ Background job triggered!${NC}"
echo "$JOB_RESPONSE" | python3 -m json.tool
echo ""

# Step 6: Get metrics
echo -e "${BLUE}Step 6: Getting system metrics...${NC}"
curl -s "$BASE_URL/metrics" | python3 -m json.tool
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Demo Complete! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 to view Workbench"
echo "2. Explore the Flow View to see workflow connections"
echo "3. Check the Debug Panel for real-time logs"
echo "4. Review EXAMPLES.md for more use cases"
