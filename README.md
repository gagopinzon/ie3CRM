# ie3CRM

# IE3 - Ingeniería Especializada en Eficiencia Energética

Sistema de gestión de proyectos de ingeniería especializada en eficiencia energética con tablero Kanban, gestión de documentos, calendario y autenticación segura.

## Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: NextAuth.js
- **Almacenamiento**: Oracle Cloud Storage

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:

**Opción 1: Script interactivo (recomendado)**
```bash
./setup-env.sh
```

**Opción 2: Manualmente**
```bash
cp env.example .env.local
# Edita .env.local con tus credenciales
```

**Documentación completa:** Ver [CONFIGURACION_ENV.md](CONFIGURACION_ENV.md) para una guía detallada.

3. Ejecutar en desarrollo:

**Opción 1: Usando el script de inicio (recomendado)**
```bash
./start.sh
```

**Opción 2: Manualmente**
```bash
npm run dev
```

**Opción 3: Script simple de desarrollo**
```bash
./start-dev.sh
```

La aplicación estará disponible en `http://localhost:3000`

## Scripts de Inicio

- **`start.sh`**: Script completo que verifica dependencias, configura variables de entorno y ofrece ejecutar el seed
- **`start-dev.sh`**: Script simple para desarrollo rápido
- **`start-prod.sh`**: Script para producción (construye y ejecuta)

## Producción

Para ejecutar en producción:
```bash
./start-prod.sh
```

## Estructura del Proyecto

```
ie3/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Backend)
│   ├── (auth)/           # Rutas de autenticación
│   ├── (dashboard)/      # Rutas protegidas del dashboard
│   └── layout.tsx        # Layout principal
├── components/            # Componentes React reutilizables
├── lib/                   # Utilidades y configuraciones
├── models/                # Modelos de Mongoose
├── shared/                # Tipos y utilidades compartidas
└── public/                # Archivos estáticos
```

## Funcionalidades

- ✅ Autenticación y autorización con NextAuth.js
- ✅ Gestión de proyectos con tablero Kanban
- ✅ Gestión de documentos con Oracle Cloud Storage
- ✅ Calendario de eventos y recordatorios
- ✅ Dashboard con métricas y gráficos
