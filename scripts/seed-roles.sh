#!/bin/bash

# Script para sembrar roles iniciales en la base de datos

echo "🌱 Sembrando roles iniciales..."

# Verificar si existe .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local no encontrado, usando .env"
    if [ ! -f .env ]; then
        echo "❌ Error: No se encontró archivo .env o .env.local"
        exit 1
    fi
fi

# Ejecutar el script de seed
node scripts/seed-roles.js

if [ $? -eq 0 ]; then
    echo "✅ Roles sembrados exitosamente"
else
    echo "❌ Error al sembrar roles"
    exit 1
fi
