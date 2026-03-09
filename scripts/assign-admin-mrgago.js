/**
 * Asegura que exista el rol Administrador con todos los permisos
 * y asigna ese rol al usuario mrgago@gmail.com para acceso completo.
 * Ejecutar: node scripts/assign-admin-mrgago.js
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = 'mrgago@gmail.com';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  permissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageProjects: { type: Boolean, default: true },
    canManageClients: { type: Boolean, default: true },
    canManageDocuments: { type: Boolean, default: true },
    canManageCategories: { type: Boolean, default: true },
    canManageDocumentTypes: { type: Boolean, default: true },
    canViewAllProjects: { type: Boolean, default: true },
    canEditAllProjects: { type: Boolean, default: true },
  },
  isSystem: { type: Boolean, default: false },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
}, { timestamps: true });

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const adminRoleData = {
  name: 'Administrador',
  code: 'admin',
  description: 'Acceso completo al sistema.',
  permissions: {
    canManageUsers: true,
    canManageProjects: true,
    canManageClients: true,
    canManageDocuments: true,
    canManageCategories: true,
    canManageDocumentTypes: true,
    canViewAllProjects: true,
    canEditAllProjects: true,
  },
  isSystem: true,
};

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI no está en .env.local');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Conectado a MongoDB');

  // 1. Crear o actualizar rol admin con todos los permisos
  let adminRole = await Role.findOne({ code: 'admin' });
  if (!adminRole) {
    adminRole = await Role.create(adminRoleData);
    console.log('✅ Rol Administrador creado');
  } else {
    await Role.findOneAndUpdate(
      { code: 'admin' },
      { $set: { permissions: adminRoleData.permissions, name: adminRoleData.name, isSystem: true } }
    );
    adminRole = await Role.findOne({ code: 'admin' });
    console.log('✅ Rol Administrador actualizado con todos los permisos');
  }

  // 2. Buscar usuario mrgago@gmail.com (puede tener role string o ObjectId)
  const user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (!user) {
    const hashedPassword = await bcrypt.hash('A4s5d6a4s5d6.0', 10);
    await User.create({
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      name: 'MR Gago',
      role: adminRole._id,
    });
    console.log('✅ Usuario', ADMIN_EMAIL, 'creado con rol Administrador');
  } else {
    await User.updateOne(
      { email: ADMIN_EMAIL.toLowerCase() },
      { $set: { role: adminRole._id, name: 'MR Gago' } }
    );
    console.log('✅ Usuario', ADMIN_EMAIL, 'actualizado: rol Administrador (acceso completo)');
  }

  await mongoose.disconnect();
  console.log('✅ Listo. Cierra sesión y vuelve a entrar para que apliquen los permisos.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
