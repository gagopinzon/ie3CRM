# 👤 Gestión de Usuarios

## Usuarios Predefinidos

El sistema incluye los siguientes usuarios por defecto:

### 1. Administrador Principal
- **Email**: `admin@despacho.com`
- **Contraseña**: `admin123`
- **Rol**: Admin

### 2. Usuario MR Gago
- **Email**: `mrgago@gmail.com`
- **Contraseña**: `A4s5d6a4s5d6.0`
- **Rol**: Admin

## Crear Usuario Manualmente

### Opción 1: Script de Node.js (Recomendado)

```bash
# Ejecutar el script
./scripts/create-user.sh

# O directamente con npm
npm run create-user
```

Este script creará o actualizará el usuario `mrgago@gmail.com` con la contraseña especificada.

### Opción 2: A través del Seed

El usuario `mrgago@gmail.com` se crea automáticamente cuando ejecutas el seed de la base de datos:

```bash
# Ejecutar el seed
curl -X POST http://localhost:3000/api/seed
```

O desde el script de inicio:
```bash
./start.sh
# Selecciona 's' cuando pregunte si deseas ejecutar el seed
```

### Opción 3: API Endpoint (Solo para Admins)

Si ya estás autenticado como admin, puedes crear usuarios a través de la API:

```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_TOKEN" \
  -d '{
    "email": "nuevo@usuario.com",
    "password": "contraseña123",
    "name": "Nombre Usuario",
    "role": "engineer"
  }'
```

### Opción 4: Registro desde la UI

Los usuarios también pueden registrarse desde la página de registro:
- URL: `http://localhost:3000/register`
- Los nuevos usuarios se crean con rol `viewer` por defecto

## Roles Disponibles

- **admin**: Acceso completo al sistema
- **project_manager**: Puede gestionar proyectos
- **engineer**: Puede ver y trabajar en proyectos asignados
- **viewer**: Solo lectura

## Modificar Usuario Existente

Para actualizar un usuario existente (por ejemplo, cambiar la contraseña), puedes:

1. **Usar el script de creación**: El script actualiza el usuario si ya existe
2. **Modificar directamente en MongoDB**: 
   ```javascript
   // En MongoDB shell o Compass
   db.users.updateOne(
     { email: "mrgago@gmail.com" },
     { $set: { password: "nueva_contraseña_hasheada" } }
   )
   ```

## Cambiar Contraseña

Si necesitas cambiar la contraseña de un usuario:

1. Ejecuta el script `create-user.js` modificando la contraseña en el código
2. O usa la API (si implementas un endpoint de cambio de contraseña)
3. O modifica directamente en la base de datos

## Verificar Usuarios

Para ver los usuarios en la base de datos:

```bash
# Conectarse a MongoDB
mongosh

# O si usas el cliente antiguo
mongo

# Seleccionar la base de datos
use ie3

# Ver usuarios
db.users.find().pretty()
```

## Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt
- Nunca se muestran las contraseñas en texto plano
- Los usuarios con rol `viewer` tienen acceso limitado
- Solo los admins pueden crear nuevos usuarios a través de la API
