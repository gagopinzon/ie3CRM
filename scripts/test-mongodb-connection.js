// Script para probar la conexión a MongoDB
const fs = require('fs');
const mongoose = require('mongoose');

// Cargar variables de entorno
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  require('dotenv').config({ path: '.env' });
} else {
  require('dotenv').config();
}

function escapeMongoUri(uri) {
  if (!uri || !uri.includes('@')) {
    return uri;
  }

  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (!match) {
    return uri;
  }

  const [, protocol, username, password, rest] = match;
  const escapedPassword = encodeURIComponent(password);
  return `${protocol}${username}:${escapedPassword}@${rest}`;
}

async function testConnection() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI no está definido');
      process.exit(1);
    }

    console.log('🔍 Analizando URI de MongoDB...');
    const originalUri = process.env.MONGODB_URI;
    
    // Verificar si tiene placeholder
    if (originalUri.includes('<db_password>') || originalUri.includes('<password>')) {
      console.error('❌ ERROR: Tu URI tiene un placeholder que debe ser reemplazado');
      console.error('   La URI contiene: <db_password> o <password>');
      console.error('   Debes reemplazarlo con tu contraseña real de MongoDB Atlas');
      console.error('');
      console.error('   Pasos:');
      console.error('   1. Ve a MongoDB Atlas > Database Access');
      console.error('   2. Encuentra tu usuario y obtén/establece la contraseña');
      console.error('   3. Reemplaza <db_password> en tu .env con la contraseña real');
      process.exit(1);
    }

    console.log('✅ URI parece tener una contraseña');
    console.log('🔌 Intentando conectar...');
    
    const mongoUri = escapeMongoUri(originalUri);
    
    // Intentar conectar con timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Conexión exitosa a MongoDB!');
    console.log('📊 Información del servidor:');
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log(`   - Versión: ${serverStatus.version}`);
    console.log(`   - Host: ${mongoose.connection.host}`);
    console.log(`   - Base de datos: ${mongoose.connection.name || 'No especificada'}`);
    
    await mongoose.disconnect();
    console.log('✅ Desconectado correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    
    if (error.message.includes('whitelist')) {
      console.error('');
      console.error('🔧 SOLUCIÓN:');
      console.error('   1. Ve a MongoDB Atlas > Network Access');
      console.error('   2. Haz clic en "Add IP Address"');
      console.error('   3. Haz clic en "Add Current IP Address" o usa 0.0.0.0/0 para desarrollo');
    } else if (error.message.includes('authentication')) {
      console.error('');
      console.error('🔧 SOLUCIÓN:');
      console.error('   1. Verifica que la contraseña en MONGODB_URI sea correcta');
      console.error('   2. Ve a MongoDB Atlas > Database Access y verifica el usuario');
    } else if (error.message.includes('timeout')) {
      console.error('');
      console.error('🔧 SOLUCIÓN:');
      console.error('   1. Verifica tu conexión a internet');
      console.error('   2. Verifica que tu IP esté en la whitelist de MongoDB Atlas');
    }
    
    process.exit(1);
  }
}

testConnection();
