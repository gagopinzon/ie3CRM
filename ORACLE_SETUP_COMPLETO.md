# 🔧 Configuración Completa de Oracle Cloud Storage

## ✅ Información que ya tienes

De tu configuración de Oracle Cloud:

```
Fingerprint: 85:0f:db:b7:b0:03:77:dc:12:7d:72:a0:80:a5:6d:53
User OCID: ocid1.user.oc1..aaaaaaaa43hihlc4oe5adelhxfqd2qxlqnt3g2cscxsflx4rruoc3xka7xyq
Tenancy OCID: ocid1.tenancy.oc1..aaaaaaaarkbuuaiqfjycz3mq7cyn556ytu7tjfdmc3w6sadlyk2xc7biitla
Region: us-sanjose-1
```

Y de tu Pre-Authenticated Request:
```
Namespace: axj9sziuwe9i
Bucket: IE3
```

## 📝 Configuración del .env.local

Tu archivo `.env.local` debe quedar así:

```env
# Oracle Cloud Storage
ORACLE_REGION=us-sanjose-1
ORACLE_NAMESPACE=axj9sziuwe9i
ORACLE_BUCKET_NAME=IE3
ORACLE_ENDPOINT=https://objectstorage.us-sanjose-1.oraclecloud.com

# API Keys (de la configuración que te dio Oracle)
ORACLE_ACCESS_KEY_ID=85:0f:db:b7:b0:03:77:dc:12:7d:72:a0:80:a5:6d:53
ORACLE_SECRET_ACCESS_KEY=-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCvcJD9BgS3B9LP
/2BiFP/fL++yGqY4rF/zohft0KKR3Bbv6JCcrtH2PhZqNFRNv54Ej8n90Y3Zg5mX
2+L+U1ajd8sht0Gimg0fw4p8ysBfZYkj/WU746ilRBxUML1AwPN6zj+ZCFtLElux
ltv+vavQD9hXvcVSTy5vUW2an7J5JpVTUFr87PFFewrVsEuyk5D+lllJVHi1EtHa
izAYVBfNrJLfONHmDsPixSUxd9CDqD1YmkHNA1My9X24eoq615Z4yptlTAqDJgPr
iv7ZzBGbZqOawdtHI0ETs9SmdZt5UC5dJUwh/pkpLNqqMkkUlwFrl9YjJlmWuXkb
bEkqMbWRAgMBAAECggEAHB0HvuQmAUaJq7catNz0m8lMude3Z0GIJryE5SEXzBPe
wRcdhV4mWzVb1i0IjWT1Z3m7PqdD+eUyybj8yRCFw7BApuh85heVns9w88pxxVe6
AEBs5on2znT5rSwaR7Qj0DwYyOcj6gXJF8469rliPPctDfJlGmmB4WjFDZAlw2/9
KZtcWOxPf8inqlAvwoBaNCnGac1e+UDj+RLqt6EJ5K4H90M72NSm61Kk9cz3ptSK
ANMYxXsqRMc9PLATqGgnEHHELvTgFfVY8Yf4hwC1Kkm1p//LslDHc8rud3Zjq2Kv
h9vpH3PlWHvx8txUvgiPD8mEnXXezy3EH6QWT+xYOQKBgQDovpTtjtJtxsUx8OV+
4vsuAV/OprRNKC2rUxTFZU9u3Invr0579XK0xYTPatqJwsg99d5fs5qL3/34BYwL
LT1XUViDHsNtodeNxHCXnyPVqlRJ3ry1C28l3r2gdkEErn5hib3KfLxGKTpnRSbT
c8YPHFPUsHen6xTXoq6HMitcuwKBgQDA+Cy6yygCAXYLIlJUnnMr1luUWOq+Il+7
wwQ+RbiFHZl7CEAQg7ubqy5KKXAMG+Q4AMNaKbG39+izeryRMJZPhTm4s+ihS9hD
YT4jMgvt3U44WJQAfvh2jitvdj34f3zyvfd/ax8CAy6Z10PsuNHMIL3UIgii0vjw
53QLfM+YIwKBgDOi9M+vvCf2zZFC7Oe13Bxc2bCzc5UasOcty5Hv5CuoakHvFu6R
ih1pJQoPnuSpflugzPFWm5ck3ufD80oXg2B3/7c3gAw2t+gQCRrah8zDuWeaLyvL
maFBRbjwA4TSYd+p+52NBwhZ5Uc8JF0NdoertT2e2S08Dqe4xBfinZQ5AoGARAc5
vaBhOlPJiaNP4wT5FTs8jc/K8bysg0T8+fcaVdNZiEYgT7IhMX/nkb2KArrSeevK
8r5AKNr87kkWsRiv5NjSwIqsODDEzPw7K605B2I9cR/JDWO1tBXquiC1OCW5ptnR
ptnc1JjKlPGOwKVnUM86HM7ivIQjvsnZ3zLg/IECgYAwmyXa2IKzbexws40nC8Sa
oRq0dl03kn2e6pmh3oegkAMOqUa1T/BNFym8YRy2BK1oK2LsTLu9D1YMBotssNLo
GZfttai8R3MjWIV71r/rjYJMj/+1cp8cPQju0AeEIJXAwj9Z/oXqQXrTn3o18WmS
Pc/bS68BiN6ev+tIbPO6TQ==
-----END PRIVATE KEY-----

# OPCIONAL: Si prefieres usar los OCIDs
ORACLE_USER_OCID=ocid1.user.oc1..aaaaaaaa43hihlc4oe5adelhxfqd2qxlqnt3g2cscxsflx4rruoc3xka7xyq
ORACLE_TENANCY_OCID=ocid1.tenancy.oc1..aaaaaaaarkbuuaiqfjycz3mq7cyn556ytu7tjfdmc3w6sadlyk2xc7biitla
```

## 🔑 Paso 1: Encontrar el archivo Private Key

Cuando creaste la API Key, Oracle descargó un archivo. Busca en tu carpeta de Descargas:

- `API_key_private.pem`
- O un archivo con nombre similar

**Ubicaciones comunes:**
- `~/Downloads/API_key_private.pem`
- `~/Descargas/API_key_private.pem`
- `C:\Users\TuUsuario\Downloads\API_key_private.pem` (Windows)

## 📄 Paso 2: Leer el contenido del Private Key

### Opción A: Desde la terminal (Linux/Mac/WSL)

```bash
# Buscar el archivo
find ~ -name "*API_key*" -o -name "*private*.pem" 2>/dev/null

# Una vez encontrado, leer su contenido
cat ~/Downloads/API_key_private.pem

# O copiar directamente al .env.local
cat ~/Downloads/API_key_private.pem >> .env.local
```

### Opción B: Desde el editor de texto

1. Abre el archivo `API_key_private.pem` con un editor de texto
2. Copia TODO el contenido (incluyendo las líneas `-----BEGIN RSA PRIVATE KEY-----` y `-----END RSA PRIVATE KEY-----`)
3. Pégalo en tu `.env.local` como valor de `ORACLE_SECRET_ACCESS_KEY`

## 📋 Ejemplo completo de .env.local

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ie3

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-generado-con-openssl-rand-base64-32

# Oracle Cloud Storage
ORACLE_REGION=us-sanjose-1
ORACLE_NAMESPACE=axj9sziuwe9i
ORACLE_BUCKET_NAME=IE3
ORACLE_ENDPOINT=https://objectstorage.us-sanjose-1.oraclecloud.com
ORACLE_ACCESS_KEY_ID=85:0f:db:b7:b0:03:77:dc:12:7d:72:a0:80:a5:6d:53
ORACLE_SECRET_ACCESS_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefghijklmnopqrstuvwxyz
ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnop
... (todo el contenido del archivo) ...
-----END RSA PRIVATE KEY-----
```

## ⚠️ Importante sobre el formato

El `ORACLE_SECRET_ACCESS_KEY` debe incluir:
- La línea `-----BEGIN RSA PRIVATE KEY-----` al inicio
- Todo el contenido del archivo
- La línea `-----END RSA PRIVATE KEY-----` al final

**Ejemplo correcto:**
```env
ORACLE_SECRET_ACCESS_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...contenido completo...
-----END RSA PRIVATE KEY-----
```

## 🔍 Verificar que el archivo existe

Ejecuta este comando para buscar el archivo:

```bash
# Linux/Mac/WSL
find ~ -name "*private*.pem" -o -name "*API_key*.pem" 2>/dev/null

# O busca manualmente en:
ls ~/Downloads/*.pem
ls ~/Descargas/*.pem
```

## 🚀 Script rápido para configurar

Si encuentras el archivo, puedes usar este comando:

```bash
# Reemplaza /ruta/al/archivo.pem con la ruta real
PRIVATE_KEY=$(cat /ruta/al/archivo.pem)

# Agregar al .env.local (asegúrate de que el archivo existe primero)
echo "ORACLE_SECRET_ACCESS_KEY=$PRIVATE_KEY" >> .env.local
```

## ✅ Verificación final

Después de configurar, verifica que todo esté correcto:

```bash
# Verificar que las variables estén definidas
grep "ORACLE_" .env.local
```

Deberías ver todas las variables de Oracle configuradas.
