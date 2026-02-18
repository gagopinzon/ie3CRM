#!/bin/bash

# Script para probar la conexión a MongoDB

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Probando conexión a MongoDB...${NC}"
echo ""

node scripts/test-mongodb-connection.js
