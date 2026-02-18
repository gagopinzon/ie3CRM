import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '@/shared/types';

export interface ICategory extends Document {
  name: string;
  description?: string;
  // Roles que pueden modificar documentos de esta categoría
  canModify: UserRole[];
  // Roles que pueden ver documentos de esta categoría
  canView: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Nombre de la categoría es requerido'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    canModify: {
      type: [String],
      enum: ['admin', 'project_manager', 'engineer', 'viewer'],
      default: ['admin', 'project_manager'],
    },
    canView: {
      type: [String],
      enum: ['admin', 'project_manager', 'engineer', 'viewer'],
      default: ['admin', 'project_manager', 'engineer', 'viewer'],
    },
  },
  {
    timestamps: true,
  }
);

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
