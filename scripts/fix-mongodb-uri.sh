#!/bin/bash

# Script para corregir la URI de MongoDB

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Corrigiendo URI de MongoDB${NC}"
echo ""

node scripts/fix-mongodb-uri.js
