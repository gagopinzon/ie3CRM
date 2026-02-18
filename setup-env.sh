#!/bin/bash

# Script para configurar el archivo .env.local
# Este script te guía paso a paso en la configuración

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Configuración de Variables de Entorno${NC}"
echo ""

# Verificar si ya existe .env.local
if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠️  El archivo .env.local ya existe${NC}"
    read -p "¿Deseas sobrescribirlo? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Operación cancelada."
        exit 0
    fi
fi

# Crear .env.local desde el ejemplo
if [ -f .env.local.example ]; then
    cp .env.local.example .env.local
    echo -e "${GREEN}✅ Archivo .env.local creado${NC}"
else
    echo -e "${YELLOW}⚠️  No se encontró .env.local.example, creando desde cero...${NC}"
    touch .env.local
fi

echo ""
echo "Ahora vamos a configurar las variables:"
echo ""

# MongoDB URI
echo -e "${BLUE}📊 MongoDB${NC}"
echo "Ingresa la URI de conexión de MongoDB:"
echo "Ejemplos:"
echo "  - Local: mongodb://localhost:27017/ie3"
echo "  - Atlas: mongodb+srv://usuario:password@cluster.mongodb.net/ie3"
read -p "MONGODB_URI: " mongodb_uri
if [ ! -z "$mongodb_uri" ]; then
    sed -i "s|MONGODB_URI=.*|MONGODB_URI=$mongodb_uri|" .env.local
fi

# NextAuth URL
echo ""
echo -e "${BLUE}🔐 NextAuth${NC}"
read -p "NEXTAUTH_URL (default: http://localhost:3000): " nextauth_url
if [ -z "$nextauth_url" ]; then
    nextauth_url="http://localhost:3000"
fi
sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=$nextauth_url|" .env.local

# NextAuth Secret
echo ""
echo "Generando NEXTAUTH_SECRET..."
secret=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$secret|" .env.local
echo -e "${GREEN}✅ NEXTAUTH_SECRET generado automáticamente${NC}"

# Oracle Cloud Storage (opcional)
echo ""
echo -e "${BLUE}☁️  Oracle Cloud Storage (Opcional)${NC}"
read -p "¿Deseas configurar Oracle Cloud Storage ahora? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    read -p "ORACLE_REGION (default: us-ashburn-1): " oracle_region
    if [ -z "$oracle_region" ]; then
        oracle_region="us-ashburn-1"
    fi
    sed -i "s|ORACLE_REGION=.*|ORACLE_REGION=$oracle_region|" .env.local

    read -p "ORACLE_NAMESPACE: " oracle_namespace
    if [ ! -z "$oracle_namespace" ]; then
        sed -i "s|ORACLE_NAMESPACE=.*|ORACLE_NAMESPACE=$oracle_namespace|" .env.local
    fi

    read -p "ORACLE_BUCKET_NAME (default: crm-documents): " oracle_bucket
    if [ -z "$oracle_bucket" ]; then
        oracle_bucket="crm-documents"
    fi
    sed -i "s|ORACLE_BUCKET_NAME=.*|ORACLE_BUCKET_NAME=$oracle_bucket|" .env.local

    read -p "ORACLE_ACCESS_KEY_ID: " oracle_key
    if [ ! -z "$oracle_key" ]; then
        sed -i "s|ORACLE_ACCESS_KEY_ID=.*|ORACLE_ACCESS_KEY_ID=$oracle_key|" .env.local
    fi

    read -p "ORACLE_SECRET_ACCESS_KEY: " oracle_secret
    if [ ! -z "$oracle_secret" ]; then
        sed -i "s|ORACLE_SECRET_ACCESS_KEY=.*|ORACLE_SECRET_ACCESS_KEY=$oracle_secret|" .env.local
    fi

    oracle_endpoint="https://objectstorage.${oracle_region}.oraclecloud.com"
    sed -i "s|ORACLE_ENDPOINT=.*|ORACLE_ENDPOINT=$oracle_endpoint|" .env.local
else
    echo -e "${YELLOW}⚠️  Oracle Cloud Storage no configurado. Puedes configurarlo más tarde editando .env.local${NC}"
fi

echo ""
echo -e "${GREEN}✅ Configuración completada!${NC}"
echo ""
echo "Archivo .env.local creado con las siguientes configuraciones:"
echo ""
echo "📝 Puedes editar .env.local manualmente si necesitas hacer cambios"
echo ""
echo "🚀 Para iniciar el proyecto, ejecuta:"
echo "   ./start.sh"
echo ""
