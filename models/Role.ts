import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRole extends Document {
  name: string;
  code: string; // Código único: 'admin', 'project_manager', 'engineer', 'viewer'
  description?: string;
  permissions: {
    canManageUsers: boolean;
    canManageProjects: boolean;
    canManageClients: boolean;
    canManageDocuments: boolean;
    canManageCategories: boolean;
    canManageDocumentTypes: boolean;
    canManageInventory: boolean;
    canViewAllProjects: boolean;
    canEditAllProjects: boolean;
  };
  isSystem: boolean; // Si es true, no se puede eliminar
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Nombre del rol es requerido'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Código del rol es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z_]+$/, 'El código solo puede contener letras minúsculas y guiones bajos'],
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: {
      canManageUsers: { type: Boolean, default: false },
      canManageProjects: { type: Boolean, default: true },
      canManageClients: { type: Boolean, default: true },
      canManageDocuments: { type: Boolean, default: true },
      canManageCategories: { type: Boolean, default: false },
      canManageDocumentTypes: { type: Boolean, default: true },
      canManageInventory: { type: Boolean, default: true },
      canViewAllProjects: { type: Boolean, default: true },
      canEditAllProjects: { type: Boolean, default: false },
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para búsqueda rápida por código
RoleSchema.index({ code: 1 });

const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

export default Role;
