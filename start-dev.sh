#!/bin/bash

# Script de inicio para desarrollo
# Inicia el servidor de desarrollo de Next.js

set -e

echo "🚀 Iniciando servidor de desarrollo..."
echo ""

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Verificar .env.local o .env
if [ ! -f .env.local ] && [ ! -f .env ]; then
    echo "⚠️  Creando .env.local desde .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "✅ .env.local creado. Por favor, configura tus variables de entorno."
    elif [ -f env.example ]; then
        cp env.example .env.local
        echo "✅ .env.local creado desde env.example."
    fi
elif [ -f .env ] && [ ! -f .env.local ]; then
    echo "⚠️  Se encontró .env (se recomienda usar .env.local)"
fi

echo "✅ Iniciando servidor en http://localhost:3000"
echo ""

npm run dev
