# 🔧 Configuración de Oracle Cloud Storage

## 📋 Información Extraída de tu Pre-Authenticated Request

De tu URL:
```
https://objectstorage.us-sanjose-1.oraclecloud.com/p/-FOr66lDGv19tGD6VXeVSBVSnMqImI94teL-EWL3NqirAxP0iz3iLf0JJv08JPTw/n/axj9sziuwe9i/b/IE3/o/
```

He extraído:
- **Región**: `us-sanjose-1`
- **Namespace**: `axj9sziuwe9i`
- **Bucket**: `IE3`
- **Endpoint**: `https://objectstorage.us-sanjose-1.oraclecloud.com`

## ⚠️ Importante: Pre-Authenticated Request vs API Keys

Tu URL es un **Pre-Authenticated Request**, que es una URL temporal para acceso directo. Sin embargo, para que la aplicación funcione correctamente, necesitas crear **API Keys** en Oracle Cloud.

## 🔑 Cómo Obtener las API Keys

### Paso 1: Ir a Oracle Cloud Console
1. Inicia sesión en [Oracle Cloud Console](https://cloud.oracle.com)
2. Ve a **Identity** > **Users**
3. Selecciona tu usuario

### Paso 2: Crear API Key
1. En la sección **API Keys**, haz clic en **Add API Key**
2. Selecciona **Paste Public Key** o **Generate API Key Pair**
3. Si eliges "Generate API Key Pair", se descargará un archivo con:
   - `API_key_public.pem`
   - `API_key_private.pem`
4. **IMPORTANTE**: Copia el **Fingerprint** y el **Configuration File Preview**

### Paso 3: Obtener las Credenciales
Después de crear la API Key, verás algo como:

```
Fingerprint: aa:bb:cc:dd:ee:ff:...
```

Y en la configuración verás:
```
[USER_OCID]
fingerprint=aa:bb:cc:dd:ee:ff:...
key_file=~/.oci/oci_api_key.pem
tenancy=ocid1.tenancy.oc1..xxxxx
user=ocid1.user.oc1..xxxxx
region=us-sanjose-1
```

**Pero para nuestra aplicación necesitas:**
- **Access Key ID**: Es el fingerprint o un ID que Oracle te proporciona
- **Secret Access Key**: Es la clave privada del archivo `.pem` o el contenido del archivo privado

## 📝 Configuración Final del .env.local

Basándome en tu URL, tu configuración debería quedar así:

```env
# ============================================
# Oracle Cloud Storage - Almacenamiento de Archivos
# ============================================
ORACLE_REGION=us-sanjose-1
ORACLE_NAMESPACE=axj9sziuwe9i
ORACLE_BUCKET_NAME=IE3
ORACLE_ACCESS_KEY_ID=tu-access-key-id-aqui
ORACLE_SECRET_ACCESS_KEY=tu-secret-access-key-aqui
ORACLE_ENDPOINT=https://objectstorage.us-sanjose-1.oraclecloud.com
```

## 🔍 Alternativa: Usar Pre-Authenticated Requests

Si prefieres usar Pre-Authenticated Requests en lugar de API Keys, necesitarías modificar el código para generar estas URLs dinámicamente. Sin embargo, esto es más complejo y menos flexible.

**Recomendación**: Usa API Keys para la aplicación, ya que permiten:
- Subir archivos
- Eliminar archivos
- Generar URLs firmadas dinámicamente
- Mejor control de permisos

## 🚀 Pasos Rápidos

1. **Copia la configuración base** (ya tienes región, namespace y bucket)
2. **Crea API Keys** en Oracle Cloud Console
3. **Agrega las credenciales** a tu `.env.local`:
   ```env
   ORACLE_REGION=us-sanjose-1
   ORACLE_NAMESPACE=axj9sziuwe9i
   ORACLE_BUCKET_NAME=IE3
   ORACLE_ACCESS_KEY_ID=el-fingerprint-o-id-que-te-dio-oracle
   ORACLE_SECRET_ACCESS_KEY=el-contenido-del-archivo-private-key.pem
   ORACLE_ENDPOINT=https://objectstorage.us-sanjose-1.oraclecloud.com
   ```

## 📸 Ubicación en Oracle Cloud Console

Para encontrar las API Keys:
```
Oracle Cloud Console
  └─ Identity & Security
      └─ Identity
          └─ Users
              └─ [Tu Usuario]
                  └─ API Keys
                      └─ Add API Key
```

## ⚡ Nota Rápida

Si ya tienes un archivo `.pem` de una API Key anterior:
- El **Access Key ID** puede ser el fingerprint
- El **Secret Access Key** es el contenido completo del archivo `.pem` privado (incluyendo las líneas `-----BEGIN RSA PRIVATE KEY-----` y `-----END RSA PRIVATE KEY-----`)
