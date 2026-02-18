#!/bin/bash

# Script de inicio para producción
# Construye y inicia el servidor de producción

set -e

echo "🏗️  Construyendo aplicación para producción..."
echo ""

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Verificar .env.local
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local no encontrado"
    echo "Por favor, crea el archivo .env.local con tus variables de entorno"
    exit 1
fi

# Construir la aplicación
echo "🔨 Construyendo aplicación..."
npm run build

echo ""
echo "✅ Construcción completada"
echo "🚀 Iniciando servidor de producción en http://localhost:3000"
echo ""

npm start
