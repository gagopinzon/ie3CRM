import mongoose, { Schema, Document, Model } from 'mongoose';
import { KanbanColumnType } from '@/shared/types';

export interface IProject extends Document {
  name: string;
  description: string;
  client: string;
  status: string;
  assignedTo?: mongoose.Types.ObjectId;
  documentTypes: mongoose.Types.ObjectId[];
  kanbanColumn: KanbanColumnType;
  progress?: number;
  locationAddress?: string;
  locationLat?: number;
  locationLng?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Nombre del proyecto es requerido'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Descripción es requerida'],
      trim: true,
    },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Cliente es requerido'],
  },
    status: {
      type: String,
      default: 'active',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    documentTypes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'DocumentType',
      },
    ],
  kanbanColumn: {
    type: String,
    enum: ['Contacted', 'Negotiation', 'Offer Sent', 'Deal Closed', 'In Progress', 'Completed'],
    default: 'Contacted',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  locationAddress: { type: String, trim: true },
  locationLat: { type: Number },
  locationLng: { type: Number },
  },
  {
    timestamps: true,
  }
);

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
