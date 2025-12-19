#!/bin/bash

# FlowSync Setup Verification Script
# Verifies that the project is properly set up

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Verifying FlowSync Setup..."
echo ""

ERRORS=0

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    VERSION=$(node -v)
    echo -e "${GREEN}✅ $VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    VERSION=$(npm -v)
    echo -e "${GREEN}✅ $VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check Python
echo -n "Checking Python... "
if command -v python3 &> /dev/null; then
    VERSION=$(python3 --version)
    echo -e "${GREEN}✅ $VERSION${NC}"
else
    echo -e "${RED}❌ Python3 not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check pip
echo -n "Checking pip... "
if command -v pip3 &> /dev/null || command -v pip &> /dev/null; then
    echo -e "${GREEN}✅ Installed${NC}"
else
    echo -e "${RED}❌ pip not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check node_modules
echo -n "Checking node_modules... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Installed${NC}"
else
    echo -e "${YELLOW}⚠️  Not installed (run: npm install)${NC}"
fi

# Check steps directory
echo -n "Checking steps directory... "
if [ -d "steps" ] && [ "$(find steps -name '*.step.*' | wc -l)" -gt 0 ]; then
    COUNT=$(find steps -name '*.step.*' | wc -l | tr -d ' ')
    echo -e "${GREEN}✅ Found $COUNT steps${NC}"
else
    echo -e "${RED}❌ Steps directory not found or empty${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check TypeScript steps
echo -n "Checking TypeScript steps... "
TS_COUNT=$(find steps -name '*.step.ts' | wc -l | tr -d ' ')
echo -e "${GREEN}✅ $TS_COUNT TypeScript steps${NC}"

# Check Python steps
echo -n "Checking Python steps... "
PY_COUNT=$(find steps -name '*.step.py' | wc -l | tr -d ' ')
echo -e "${GREEN}✅ $PY_COUNT Python steps${NC}"

# Check configuration files
echo -n "Checking package.json... "
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ Found${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -n "Checking tsconfig.json... "
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✅ Found${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -n "Checking requirements.txt... "
if [ -f "requirements.txt" ]; then
    echo -e "${GREEN}✅ Found${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check documentation
echo -n "Checking documentation... "
DOCS=("README.md" "QUICKSTART.md" "EXAMPLES.md" "ARCHITECTURE.md")
DOC_COUNT=0
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        DOC_COUNT=$((DOC_COUNT + 1))
    fi
done
echo -e "${GREEN}✅ $DOC_COUNT/${#DOCS[@]} documentation files${NC}"

# Summary
echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Setup verification complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Install Python dependencies: pip install -r requirements.txt"
    echo "2. Start development server: npm run dev"
    echo "3. Open Workbench: http://localhost:3000"
    echo "4. Run demo: ./demo.sh"
    echo "5. Test APIs: ./test-api.sh"
else
    echo -e "${RED}❌ Found $ERRORS error(s)${NC}"
    echo "Please fix the errors above before proceeding."
fi
