#!/bin/bash

# Script simplificado para configurar Oracle Cloud Storage
# Solo actualiza las variables básicas, el private key se configura manualmente

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Configurando Oracle Cloud Storage${NC}"
echo ""

# Verificar que .env.local existe
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local no existe, creando desde env.example...${NC}"
    if [ -f env.example ]; then
        cp env.example .env.local
    else
        echo -e "${RED}❌ Error: env.example no encontrado${NC}"
        exit 1
    fi
fi

# Datos del usuario
ORACLE_REGION="us-sanjose-1"
ORACLE_NAMESPACE="axj9sziuwe9i"
ORACLE_BUCKET_NAME="IE3"
ORACLE_ENDPOINT="https://objectstorage.us-sanjose-1.oraclecloud.com"
ORACLE_ACCESS_KEY_ID="85:0f:db:b7:b0:03:77:dc:12:7d:72:a0:80:a5:6d:53"

# Actualizar variables
sed -i "s|ORACLE_REGION=.*|ORACLE_REGION=$ORACLE_REGION|" .env.local
sed -i "s|ORACLE_NAMESPACE=.*|ORACLE_NAMESPACE=$ORACLE_NAMESPACE|" .env.local
sed -i "s|ORACLE_BUCKET_NAME=.*|ORACLE_BUCKET_NAME=$ORACLE_BUCKET_NAME|" .env.local
sed -i "s|ORACLE_ENDPOINT=.*|ORACLE_ENDPOINT=$ORACLE_ENDPOINT|" .env.local
sed -i "s|ORACLE_ACCESS_KEY_ID=.*|ORACLE_ACCESS_KEY_ID=$ORACLE_ACCESS_KEY_ID|" .env.local

echo -e "${GREEN}✅ Variables básicas configuradas:${NC}"
echo "  - Región: $ORACLE_REGION"
echo "  - Namespace: $ORACLE_NAMESPACE"
echo "  - Bucket: $ORACLE_BUCKET_NAME"
echo "  - Access Key ID: $ORACLE_ACCESS_KEY_ID"
echo ""

echo -e "${YELLOW}⚠️  Falta configurar ORACLE_SECRET_ACCESS_KEY${NC}"
echo ""
echo "Para configurar el private key:"
echo "1. Encuentra el archivo API_key_private.pem que descargaste"
echo "2. Abre .env.local con un editor de texto"
echo "3. Busca la línea: ORACLE_SECRET_ACCESS_KEY="
echo "4. Copia TODO el contenido del archivo .pem (incluyendo BEGIN y END)"
echo "5. Pégalo como valor de ORACLE_SECRET_ACCESS_KEY"
echo ""
echo "O ejecuta: find ~ -name '*private*.pem' para buscar el archivo"
echo ""
