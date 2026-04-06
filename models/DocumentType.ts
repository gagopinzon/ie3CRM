import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDocumentType extends Document {
  name: string;
  description?: string;
  category?: string;
  allowedFileTypes?: string[]; // ej: ['pdf', 'jpg', 'png']
  requiresAddress?: boolean; // Para tipos como "mapa" que necesitan dirección
  createdAt: Date;
  updatedAt: Date;
}

const DocumentTypeSchema: Schema = new Schema<IDocumentType>(
  {
    name: {
      type: String,
      required: [true, 'Nombre del tipo de documento es requerido'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Por favor selecciona una categoría'],
    },
    allowedFileTypes: {
      type: [String],
      enum: ['imagen', 'documento', 'ubicacion'],
      default: ['documento'],
    },
    requiresAddress: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const DocumentType: Model<IDocumentType> =
  mongoose.models.DocumentType || mongoose.model<IDocumentType>('DocumentType', DocumentTypeSchema);

export default DocumentType;
