# 🔧 Configuración de MongoDB Atlas

## Problema Actual

Tu URI tiene un placeholder que necesita ser reemplazado:
```
mongodb+srv://mrgago_db_user:<db_password>@cluster0.tuqmfjm.mongodb.net/?appName=Cluster0
```

## Solución Paso a Paso

### Paso 1: Obtener tu Contraseña Real

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Inicia sesión en tu cuenta
3. Ve a **Database Access** (en el menú lateral)
4. Busca el usuario `mrgago_db_user`
5. Haz clic en **Edit** o en el icono de lápiz
6. Si no recuerdas la contraseña, haz clic en **Edit Password**
7. Genera una nueva contraseña o usa la que ya tienes

### Paso 2: Formatear la URI Correctamente

Tu URI debe quedar así (reemplaza `TU_CONTRASEÑA_REAL`):

```env
MONGODB_URI=mongodb+srv://mrgago_db_user:TU_CONTRASEÑA_REAL@cluster0.tuqmfjm.mongodb.net/ie3?retryWrites=true&w=majority
```

**Notas importantes:**
- Reemplaza `<db_password>` con tu contraseña real
- Agrega el nombre de la base de datos: `/ie3` (o el nombre que prefieras)
- Si tu contraseña tiene caracteres especiales, deben estar escapados (el script lo hace automáticamente)

### Paso 3: Agregar tu IP a la Whitelist

1. En MongoDB Atlas, ve a **Network Access** (en el menú lateral)
2. Haz clic en **Add IP Address**
3. Tienes dos opciones:

   **Opción A: Agregar tu IP actual**
   - Haz clic en **Add Current IP Address**
   - Esto agregará automáticamente tu IP actual

   **Opción B: Permitir acceso desde cualquier IP (solo para desarrollo)**
   - Ingresa `0.0.0.0/0`
   - ⚠️ **ADVERTENCIA**: Esto permite acceso desde cualquier IP. Solo úsalo en desarrollo, no en producción.

4. Haz clic en **Confirm**

### Paso 4: Obtener la URI Completa desde Atlas

Alternativamente, puedes obtener la URI completa desde Atlas:

1. Ve a **Database** en el menú lateral
2. Haz clic en **Connect** en tu cluster
3. Selecciona **Connect your application**
4. Selecciona **Node.js** como driver
5. Copia la connection string que aparece
6. Reemplaza `<password>` con tu contraseña real
7. Agrega el nombre de la base de datos al final: `/ie3`

### Paso 5: Actualizar tu .env

Abre tu archivo `.env` y actualiza la línea `MONGODB_URI`:

```env
MONGODB_URI=mongodb+srv://mrgago_db_user:TU_CONTRASEÑA_REAL@cluster0.tuqmfjm.mongodb.net/ie3?retryWrites=true&w=majority
```

**Si tu contraseña tiene caracteres especiales**, ejecuta:
```bash
./scripts/fix-mongodb-uri.sh
```

Esto escapará automáticamente los caracteres especiales.

### Paso 6: Probar la Conexión

Una vez configurado, prueba la conexión:

```bash
./scripts/create-user.sh
```

## Ejemplo de URI Correcta

```env
# Sin caracteres especiales en la contraseña
MONGODB_URI=mongodb+srv://mrgago_db_user:miPassword123@cluster0.tuqmfjm.mongodb.net/crm-despacho-ingenieros?retryWrites=true&w=majority

# Con caracteres especiales (será escapado automáticamente)
MONGODB_URI=mongodb+srv://mrgago_db_user:mi@Pass#123@cluster0.tuqmfjm.mongodb.net/crm-despacho-ingenieros?retryWrites=true&w=majority
```

## Verificar tu IP Actual

Si necesitas saber cuál es tu IP actual para agregarla a la whitelist:

```bash
curl ifconfig.me
```

O visita: https://whatismyipaddress.com/

## Solución Rápida

1. **Obtén tu contraseña** de MongoDB Atlas
2. **Agrega tu IP** a la whitelist (o usa `0.0.0.0/0` para desarrollo)
3. **Actualiza tu .env** con la contraseña real
4. **Ejecuta el script de corrección** si hay caracteres especiales:
   ```bash
   ./scripts/fix-mongodb-uri.sh
   ```
5. **Prueba la conexión**:
   ```bash
   ./scripts/create-user.sh
   ```

## Troubleshooting

### Error: "IP not whitelisted"
- Ve a Network Access en MongoDB Atlas
- Agrega tu IP o usa `0.0.0.0/0` para desarrollo

### Error: "Authentication failed"
- Verifica que la contraseña sea correcta
- Asegúrate de que el usuario existe en Database Access

### Error: "Password contains unescaped characters"
- Ejecuta: `./scripts/fix-mongodb-uri.sh`
- Esto escapará automáticamente los caracteres especiales
