#!/bin/bash
echo "=========================================="
echo "🧪 FlowSync Quick Test"
echo "=========================================="
echo ""
echo "1. Starting server test..."
echo "   Run: npm run dev"
echo ""
echo "2. Testing endpoints..."
BASE_URL="http://localhost:3000"
echo ""
echo "   Health Check:"
curl -s $BASE_URL/health | python3 -m json.tool 2>/dev/null || curl -s $BASE_URL/health
echo ""
echo "   Metrics:"
curl -s $BASE_URL/metrics | python3 -m json.tool 2>/dev/null || curl -s $BASE_URL/metrics
echo ""
echo "   List Workflows:"
curl -s $BASE_URL/workflows | python3 -m json.tool 2>/dev/null || curl -s $BASE_URL/workflows
echo ""
echo "=========================================="
echo "✅ If you see JSON responses, it's working!"
echo "🌐 Open http://localhost:3000 for Workbench"
echo "=========================================="
