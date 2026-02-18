#!/bin/bash

# Script para crear el usuario mrgago@gmail.com

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}👤 Creando usuario mrgago@gmail.com${NC}"
echo ""

# Verificar que existe algún archivo .env
if [ ! -f .env.local ] && [ ! -f .env ]; then
    echo -e "${RED}❌ Error: No se encontró .env.local ni .env${NC}"
    echo "Por favor, configura primero el archivo .env o .env.local"
    exit 1
fi

# Informar qué archivo se está usando
if [ -f .env.local ]; then
    echo -e "${GREEN}✅ Usando .env.local${NC}"
elif [ -f .env ]; then
    echo -e "${YELLOW}⚠️  Usando .env (se recomienda renombrarlo a .env.local)${NC}"
fi

# Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules no encontrado, instalando dependencias...${NC}"
    npm install
fi

# Ejecutar el script de Node.js
echo -e "${GREEN}🚀 Ejecutando script de creación de usuario...${NC}"
echo ""

node scripts/create-user.js

echo ""
echo -e "${GREEN}✅ Proceso completado${NC}"
echo ""
echo "Puedes iniciar sesión con:"
echo "  Email: mrgago@gmail.com"
echo "  Contraseña: A4s5d6a4s5d6.0"
