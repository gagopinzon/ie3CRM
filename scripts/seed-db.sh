#!/bin/bash

# Script para ejecutar el seed de la base de datos

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌱 Ejecutando seed de la base de datos...${NC}"
echo ""

# Verificar que .env existe
if [ ! -f .env ] && [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  No se encontró .env o .env.local${NC}"
    exit 1
fi

# Ejecutar el seed usando la API
echo "Ejecutando seed..."
curl -X POST http://localhost:3000/api/seed 2>/dev/null || {
    echo -e "${YELLOW}⚠️  No se pudo ejecutar el seed a través de la API${NC}"
    echo "Asegúrate de que el servidor esté corriendo en http://localhost:3000"
    echo ""
    echo "O ejecuta manualmente después de iniciar el servidor:"
    echo "  curl -X POST http://localhost:3000/api/seed"
}
