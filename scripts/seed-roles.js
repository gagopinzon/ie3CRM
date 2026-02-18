require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const roles = [
  {
    name: 'Administrador',
    code: 'admin',
    description: 'Acceso completo al sistema. Puede gestionar usuarios, proyectos, clientes y todas las configuraciones.',
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
  },
  {
    name: 'Gerente de Proyectos',
    code: 'project_manager',
    description: 'Puede gestionar proyectos, clientes y documentos. No puede gestionar usuarios ni categorías.',
    permissions: {
      canManageUsers: false,
      canManageProjects: true,
      canManageClients: true,
      canManageDocuments: true,
      canManageCategories: false,
      canManageDocumentTypes: true,
      canViewAllProjects: true,
      canEditAllProjects: true,
    },
    isSystem: true,
  },
  {
    name: 'Ingeniero',
    code: 'engineer',
    description: 'Puede ver y editar proyectos asignados, subir documentos y gestionar clientes básicos.',
    permissions: {
      canManageUsers: false,
      canManageProjects: true,
      canManageClients: true,
      canManageDocuments: true,
      canManageCategories: false,
      canManageDocumentTypes: false,
      canViewAllProjects: false,
      canEditAllProjects: false,
    },
    isSystem: true,
  },
  {
    name: 'Visualizador',
    code: 'viewer',
    description: 'Solo puede ver proyectos y documentos. No puede realizar modificaciones.',
    permissions: {
      canManageUsers: false,
      canManageProjects: false,
      canManageClients: false,
      canManageDocuments: false,
      canManageCategories: false,
      canManageDocumentTypes: false,
      canViewAllProjects: true,
      canEditAllProjects: false,
    },
    isSystem: true,
  },
];

async function seedRoles() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI no está definido en .env.local');
      process.exit(1);
    }

    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Definir el schema y modelo aquí para evitar problemas con imports
    const RoleSchema = new mongoose.Schema({
      name: { type: String, required: true, unique: true, trim: true },
      code: { type: String, required: true, unique: true, lowercase: true, trim: true },
      description: { type: String, trim: true },
      permissions: {
        canManageUsers: { type: Boolean, default: false },
        canManageProjects: { type: Boolean, default: true },
        canManageClients: { type: Boolean, default: true },
        canManageDocuments: { type: Boolean, default: true },
        canManageCategories: { type: Boolean, default: false },
        canManageDocumentTypes: { type: Boolean, default: true },
        canViewAllProjects: { type: Boolean, default: true },
        canEditAllProjects: { type: Boolean, default: false },
      },
      isSystem: { type: Boolean, default: false },
    }, { timestamps: true });

    const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);

    console.log('🌱 Sembrando roles...');

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ code: roleData.code });
      
      if (existingRole) {
        console.log(`⚠️  El rol "${roleData.name}" ya existe, actualizando...`);
        await Role.findOneAndUpdate(
          { code: roleData.code },
          roleData,
          { upsert: true, new: true }
        );
      } else {
        await Role.create(roleData);
        console.log(`✅ Rol "${roleData.name}" creado`);
      }
    }

    console.log('✅ Roles sembrados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar roles:', error);
    process.exit(1);
  }
}

seedRoles();
