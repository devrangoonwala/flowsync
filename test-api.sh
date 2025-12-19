#!/bin/bash

# Quick API Test Script for FlowSync
# Tests all endpoints to ensure they're working

BASE_URL="http://localhost:3000"

echo "🧪 Testing FlowSync API Endpoints..."
echo ""

# Test 1: Health check via metrics
echo "1️⃣  Testing GET /metrics"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/metrics")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Metrics endpoint working"
else
    echo "❌ Metrics endpoint failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 2: Create workflow
echo "2️⃣  Testing POST /workflows"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workflow",
    "description": "A test workflow",
    "steps": [
      {"id": "step-1", "type": "api", "config": {}}
    ]
  }')
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
if [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Create workflow working"
    WORKFLOW_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   Workflow ID: $WORKFLOW_ID"
else
    echo "❌ Create workflow failed (HTTP $HTTP_CODE)"
    WORKFLOW_ID=""
fi
echo ""

# Test 3: List workflows
echo "3️⃣  Testing GET /workflows"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/workflows")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ List workflows working"
    COUNT=$(echo "$RESPONSE" | grep -o '"count":[0-9]*' | cut -d: -f2)
    echo "   Total workflows: $COUNT"
else
    echo "❌ List workflows failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 4: Execute workflow (if we have a workflow ID)
if [ -n "$WORKFLOW_ID" ]; then
    echo "4️⃣  Testing POST /workflows/$WORKFLOW_ID/execute"
    RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/workflows/$WORKFLOW_ID/execute" \
      -H "Content-Type: application/json" \
      -d '{"input": {"test": true}}')
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    if [ "$HTTP_CODE" = "202" ]; then
        echo "✅ Execute workflow working"
        EXECUTION_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   Execution ID: $EXECUTION_ID"
    else
        echo "❌ Execute workflow failed (HTTP $HTTP_CODE)"
        EXECUTION_ID=""
    fi
    echo ""
    
    # Test 5: Get execution status
    if [ -n "$EXECUTION_ID" ]; then
        echo "5️⃣  Testing GET /executions/$EXECUTION_ID"
        sleep 1
        RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/executions/$EXECUTION_ID")
        HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ Get execution status working"
        else
            echo "❌ Get execution status failed (HTTP $HTTP_CODE)"
        fi
        echo ""
    fi
fi

# Test 6: Trigger background job
echo "6️⃣  Testing POST /jobs"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/jobs" \
  -H "Content-Type: application/json" \
  -d '{"type": "data_processing", "data": {}, "duration": 1000}')
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
if [ "$HTTP_CODE" = "202" ]; then
    echo "✅ Trigger background job working"
else
    echo "❌ Trigger background job failed (HTTP $HTTP_CODE)"
fi
echo ""

echo "🎉 API Testing Complete!"
echo ""
echo "💡 Tip: Run 'npm run dev' and open http://localhost:3000 to see the Workbench"
