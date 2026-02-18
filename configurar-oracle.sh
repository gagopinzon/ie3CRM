#!/bin/bash

# Script para configurar Oracle Cloud Storage en .env.local
# Basado en la información proporcionada por el usuario

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

# Datos extraídos de la configuración del usuario
ORACLE_REGION="us-sanjose-1"
ORACLE_NAMESPACE="axj9sziuwe9i"
ORACLE_BUCKET_NAME="IE3"
ORACLE_ENDPOINT="https://objectstorage.us-sanjose-1.oraclecloud.com"
ORACLE_ACCESS_KEY_ID="85:0f:db:b7:b0:03:77:dc:12:7d:72:a0:80:a5:6d:53"

echo -e "${GREEN}✅ Configurando variables de Oracle Cloud Storage...${NC}"
echo ""

# Actualizar las variables en .env.local
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

# Buscar el archivo private key
echo -e "${BLUE}🔍 Buscando archivo private key...${NC}"

PRIVATE_KEY_FILE=""
SEARCH_PATHS=(
    "$HOME/Downloads/API_key_private.pem"
    "$HOME/Descargas/API_key_private.pem"
    "$HOME/Downloads/*private*.pem"
    "$HOME/Descargas/*private*.pem"
    "$HOME/*.pem"
)

for path in "${SEARCH_PATHS[@]}"; do
    if ls $path 2>/dev/null; then
        PRIVATE_KEY_FILE=$(ls $path 2>/dev/null | head -1)
        break
    fi
done

if [ -z "$PRIVATE_KEY_FILE" ]; then
    echo -e "${YELLOW}⚠️  No se encontró el archivo private key automáticamente${NC}"
    echo ""
    read -p "Ingresa la ruta completa al archivo API_key_private.pem: " PRIVATE_KEY_FILE
    
    if [ ! -f "$PRIVATE_KEY_FILE" ]; then
        echo -e "${RED}❌ Error: El archivo no existe en esa ruta${NC}"
        echo ""
        echo "Por favor, encuentra el archivo y ejecuta este script de nuevo,"
        echo "o configura manualmente ORACLE_SECRET_ACCESS_KEY en .env.local"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Archivo encontrado: $PRIVATE_KEY_FILE${NC}"
echo ""

# Leer el contenido del private key
PRIVATE_KEY_CONTENT=$(cat "$PRIVATE_KEY_FILE")

# Verificar que tiene el formato correcto
if [[ ! "$PRIVATE_KEY_CONTENT" =~ "BEGIN RSA PRIVATE KEY" ]]; then
    echo -e "${YELLOW}⚠️  Advertencia: El archivo no parece ser un private key válido${NC}"
    read -p "¿Deseas continuar de todos modos? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Actualizar ORACLE_SECRET_ACCESS_KEY en .env.local
# Usar un archivo temporal para manejar correctamente el contenido multilínea
TEMP_FILE=$(mktemp)

# Copiar todo excepto la línea ORACLE_SECRET_ACCESS_KEY
grep -v "^ORACLE_SECRET_ACCESS_KEY=" .env.local > "$TEMP_FILE"

# Agregar la nueva línea con el private key
# Usar printf para preservar los saltos de línea correctamente
{
    echo ""
    echo "# Oracle Cloud Storage - Private Key"
    echo -n "ORACLE_SECRET_ACCESS_KEY="
    # Agregar el contenido del private key con comillas para preservar saltos de línea
    echo '"""'
    cat "$PRIVATE_KEY_FILE"
    echo '"""'
} >> "$TEMP_FILE"

mv "$TEMP_FILE" .env.local

echo -e "${GREEN}✅ Private key configurado en .env.local${NC}"
echo ""
echo -e "${GREEN}✅ Configuración completada!${NC}"
echo ""
echo "Tu archivo .env.local ahora tiene:"
echo "  ✅ ORACLE_REGION=$ORACLE_REGION"
echo "  ✅ ORACLE_NAMESPACE=$ORACLE_NAMESPACE"
echo "  ✅ ORACLE_BUCKET_NAME=$ORACLE_BUCKET_NAME"
echo "  ✅ ORACLE_ENDPOINT=$ORACLE_ENDPOINT"
echo "  ✅ ORACLE_ACCESS_KEY_ID=$ORACLE_ACCESS_KEY_ID"
echo "  ✅ ORACLE_SECRET_ACCESS_KEY=[configurado]"
echo ""
echo "🚀 Ya puedes iniciar la aplicación con: ./start.sh"
