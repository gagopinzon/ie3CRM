#!/bin/bash

# Script de inicio para IE3 - Ingeniería Especializada en Eficiencia Energética
# Este script inicia el servidor de desarrollo de Next.js

set -e  # Salir si hay algún error

echo "🚀 Iniciando IE3 - Ingeniería Especializada en Eficiencia Energética..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si existe .env.local o .env
if [ ! -f .env.local ] && [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Archivo .env.local o .env no encontrado${NC}"
    echo "📝 Creando .env.local desde .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Archivo .env.local creado${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANTE: Edita .env.local con tus credenciales antes de continuar${NC}"
        echo ""
        read -p "¿Deseas continuar? (s/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            echo "Operación cancelada."
            exit 1
        fi
    elif [ -f env.example ]; then
        cp env.example .env.local
        echo -e "${GREEN}✅ Archivo .env.local creado desde env.example${NC}"
    else
        echo -e "${RED}❌ Error: No se encontró .env.example ni env.example${NC}"
        exit 1
    fi
elif [ -f .env ] && [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  Se encontró .env pero se recomienda usar .env.local${NC}"
    echo "📝 ¿Deseas copiar .env a .env.local? (s/n): "
    read -p "" -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        cp .env .env.local
        echo -e "${GREEN}✅ .env copiado a .env.local${NC}"
    fi
fi

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules no encontrado${NC}"
    echo "📦 Instalando dependencias..."
    npm install
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
    echo ""
fi

# Verificar variables de entorno críticas
if [ -f .env.local ]; then
    source .env.local 2>/dev/null || true
elif [ -f .env ]; then
    source .env 2>/dev/null || true
fi

if [ -z "$MONGODB_URI" ]; then
    echo -e "${YELLOW}⚠️  MONGODB_URI no está configurado en .env.local${NC}"
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo -e "${YELLOW}⚠️  NEXTAUTH_SECRET no está configurado en .env.local${NC}"
    echo "🔐 Generando NEXTAUTH_SECRET..."
    SECRET=$(openssl rand -base64 32)
    if [ -z "$SECRET" ]; then
        SECRET=$(date +%s | sha256sum | base64 | head -c 32)
    fi
    echo "NEXTAUTH_SECRET=$SECRET" >> .env.local
    echo -e "${GREEN}✅ NEXTAUTH_SECRET generado y agregado a .env.local${NC}"
fi

echo ""
echo -e "${GREEN}✅ Verificaciones completadas${NC}"
echo ""

# Preguntar si desea ejecutar el seed
if [ "$1" != "--no-seed" ]; then
    echo "🌱 ¿Deseas ejecutar el seed de la base de datos? (s/n): "
    read -p "" -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "🌱 Ejecutando seed de la base de datos..."
        sleep 2  # Esperar un poco para que MongoDB esté listo si acaba de iniciar
        
        # Intentar ejecutar el seed (puede fallar si el servidor no está corriendo)
        curl -X POST http://localhost:3000/api/seed 2>/dev/null || {
            echo -e "${YELLOW}⚠️  No se pudo ejecutar el seed ahora. Puedes ejecutarlo manualmente después:${NC}"
            echo "   curl -X POST http://localhost:3000/api/seed"
            echo ""
        }
    fi
fi

echo ""
echo -e "${GREEN}🚀 Iniciando servidor de desarrollo...${NC}"
echo ""
echo "📝 El servidor estará disponible en: http://localhost:3000"
echo "📝 Usuario admin por defecto: admin@despacho.com / admin123"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar el servidor de desarrollo
npm run dev
