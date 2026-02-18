import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProjectDocument extends Document {
  projectId: mongoose.Types.ObjectId;
  documentTypeId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  fileSize: number;
}

const ProjectDocumentSchema: Schema = new Schema<IProjectDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'ID del proyecto es requerido'],
    },
    documentTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'DocumentType',
      required: [true, 'ID del tipo de documento es requerido'],
    },
    fileName: {
      type: String,
      required: [true, 'Nombre del archivo es requerido'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'URL del archivo es requerida'],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuario que subió el archivo es requerido'],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    fileSize: {
      type: Number,
      required: [true, 'Tamaño del archivo es requerido'],
    },
  },
  {
    timestamps: true,
  }
);

const ProjectDocument: Model<IProjectDocument> =
  mongoose.models.ProjectDocument || mongoose.model<IProjectDocument>('ProjectDocument', ProjectDocumentSchema);

export default ProjectDocument;
