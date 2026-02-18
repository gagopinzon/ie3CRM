// Script para crear un usuario en la base de datos
// Intentar cargar .env.local primero, luego .env
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
} else if (fs.existsSync('.env')) {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
} else {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir el modelo User (igual que en models/User.ts)
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Contraseña es requerida'],
    minlength: 6,
  },
  name: {
    type: String,
    required: [true, 'Nombre es requerido'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'project_manager', 'engineer', 'viewer'],
    default: 'viewer',
  },
}, {
  timestamps: true,
});

// Usar el modelo existente o crear uno nuevo
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Función para escapar caracteres especiales en la URI de MongoDB
function escapeMongoUri(uri) {
  // Si la URI ya está correctamente formateada, devolverla tal cual
  if (!uri.includes('@') || !uri.includes('://')) {
    return uri;
  }

  // Extraer las partes de la URI
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (!match) {
    return uri; // Si no coincide el patrón, devolver original
  }

  const [, protocol, username, password, rest] = match;
  
  // Escapar caracteres especiales en la contraseña
  const escapedPassword = encodeURIComponent(password);
  
  // Reconstruir la URI
  return `${protocol}${username}:${escapedPassword}@${rest}`;
}

async function createUser() {
  try {
    // Conectar a MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definido en .env o .env.local. Por favor, configura tu archivo de variables de entorno.');
    }

    console.log('🔌 Conectando a MongoDB...');
    
    // Escapar la URI si tiene caracteres especiales en la contraseña
    const mongoUri = escapeMongoUri(process.env.MONGODB_URI);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Datos del usuario
    const email = 'mrgago@gmail.com';
    const password = 'A4s5d6a4s5d6.0';
    const name = 'MR Gago';
    const role = 'admin';

    // Hash de la contraseña antes de cualquier operación
    console.log('🔐 Generando hash de contraseña...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Hash generado correctamente');

    // Verificar si el usuario ya existe
    console.log('🔍 Verificando si el usuario existe...');
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log('⚠️  El usuario ya existe. Actualizando información...');
      
      // Actualizar usando findOneAndUpdate para evitar problemas de validación
      await User.findOneAndUpdate(
        { email },
        {
          password: hashedPassword,
          name: name,
          role: role,
        },
        { runValidators: false, new: true }
      );
      
      console.log('✅ Usuario actualizado exitosamente');
      console.log(`   Email: ${email}`);
      console.log(`   Nombre: ${name}`);
      console.log(`   Rol: ${role}`);
    } else {
      // Crear nuevo usuario
      console.log('📝 Creando nuevo usuario...');
      
      // Usar insertOne directamente para evitar problemas de validación
      const result = await User.collection.insertOne({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        role: role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Usuario creado exitosamente');
      console.log(`   Email: ${email}`);
      console.log(`   Nombre: ${name}`);
      console.log(`   Rol: ${role}`);
      console.log(`   ID: ${result.insertedId}`);
    }

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

createUser();
