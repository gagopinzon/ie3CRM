# 📝 Guía de Configuración de Variables de Entorno

Esta guía te ayudará a configurar correctamente el archivo `.env.local` para IE3 - Ingeniería Especializada en Eficiencia Energética.

## 🚀 Inicio Rápido

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edita `.env.local` con tus valores reales

3. Ejecuta el proyecto:
   ```bash
   ./start.sh
   ```

## 📋 Variables Requeridas

### 1. MongoDB (Obligatorio)

```env
MONGODB_URI=mongodb://localhost:27017/ie3
```

**Opciones:**

#### MongoDB Local
```env
MONGODB_URI=mongodb://localhost:27017/ie3
```

#### MongoDB con Autenticación
```env
MONGODB_URI=mongodb://usuario:password@localhost:27017/crm-despacho-ingenieros
```

#### MongoDB Atlas (Cloud)
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/crm-despacho-ingenieros?retryWrites=true&w=majority
```

**Cómo obtener MongoDB Atlas:**
1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un cluster
4. Crea un usuario de base de datos
5. Obtén la connection string
6. Agrega tu IP a la whitelist

---

### 2. NextAuth.js (Obligatorio)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key-super-segura
```

**NEXTAUTH_URL:**
- Desarrollo: `http://localhost:3000`
- Producción: `https://tu-dominio.com`

**NEXTAUTH_SECRET:**
Genera un secret seguro con uno de estos métodos:

**Opción 1: OpenSSL**
```bash
openssl rand -base64 32
```

**Opción 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Opción 3: Online**
- Ve a [generate-secret.vercel.app](https://generate-secret.vercel.app/32)

---

### 3. Oracle Cloud Storage (Opcional para desarrollo)

Si no tienes Oracle Cloud Storage configurado, puedes dejar estos valores y la aplicación funcionará (pero no podrás subir archivos hasta configurarlo).

```env
ORACLE_REGION=us-ashburn-1
ORACLE_NAMESPACE=tu-namespace
ORACLE_BUCKET_NAME=crm-documents
ORACLE_ACCESS_KEY_ID=tu-access-key-id
ORACLE_SECRET_ACCESS_KEY=tu-secret-key
ORACLE_ENDPOINT=https://objectstorage.us-ashburn-1.oraclecloud.com
```

**Cómo configurar Oracle Cloud Storage:**

1. **Crear un Bucket:**
   - Ve a Oracle Cloud Console
   - Object Storage > Buckets
   - Crea un nuevo bucket llamado `crm-documents`
   - Anota el namespace (aparece en los detalles del bucket)

2. **Crear API Keys:**
   - Ve a Identity > Users
   - Selecciona tu usuario
   - API Keys > Add API Key
   - Descarga o copia el Access Key ID y Secret Access Key

3. **Obtener la Región:**
   - La región aparece en la URL o en los detalles del bucket
   - Ejemplos: `us-ashburn-1`, `us-phoenix-1`, `eu-frankfurt-1`

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE

1. **NUNCA subas `.env.local` a Git**
   - Ya está en `.gitignore`
   - Verifica que no esté en el repositorio

2. **En Producción:**
   - Usa variables de entorno del servidor
   - O un gestor de secretos (AWS Secrets Manager, Vault, etc.)
   - No uses archivos `.env` en producción

3. **Rotación de Secrets:**
   - Cambia `NEXTAUTH_SECRET` periódicamente
   - Rota las API keys de Oracle Cloud

---

## ✅ Verificación

Después de configurar, verifica que todo esté correcto:

```bash
# Verificar que el archivo existe
ls -la .env.local

# Verificar formato (no debe mostrar errores)
node -e "require('dotenv').config({ path: '.env.local' }); console.log('✅ Formato correcto')"
```

---

## 🆘 Solución de Problemas

### Error: "MONGODB_URI is not defined"
- Verifica que el archivo se llame exactamente `.env.local`
- Verifica que no haya espacios alrededor del `=`
- Reinicia el servidor después de cambiar variables

### Error: "NEXTAUTH_SECRET is not defined"
- El script `start.sh` genera uno automáticamente
- O genera uno manualmente con los comandos arriba

### Error de conexión a MongoDB
- Verifica que MongoDB esté corriendo: `mongosh` o `mongo`
- Verifica la URI de conexión
- Si usas MongoDB Atlas, verifica que tu IP esté en la whitelist

### Error al subir archivos
- Verifica las credenciales de Oracle Cloud Storage
- Verifica que el bucket exista
- Verifica los permisos del usuario de Oracle Cloud

---

## 📞 Ayuda Adicional

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica que todas las variables estén definidas
3. Asegúrate de que los servicios externos (MongoDB, Oracle) estén accesibles
