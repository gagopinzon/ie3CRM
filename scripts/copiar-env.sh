#!/bin/bash

# Script para copiar .env a .env.local

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ ! -f .env ]; then
    echo "❌ Error: No se encontró el archivo .env"
    exit 1
fi

if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local ya existe${NC}"
    read -p "¿Deseas sobrescribirlo? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Operación cancelada."
        exit 0
    fi
fi

cp .env .env.local
echo -e "${GREEN}✅ .env copiado a .env.local${NC}"
echo ""
echo "Ahora puedes ejecutar: ./scripts/create-user.sh"
