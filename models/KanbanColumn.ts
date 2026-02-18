import mongoose, { Schema, Document, Model } from 'mongoose';
import { KanbanColumnType } from '@/shared/types';

export interface IKanbanColumn extends Document {
  name: KanbanColumnType;
  order: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const KanbanColumnSchema: Schema = new Schema<IKanbanColumn>(
  {
    name: {
      type: String,
      required: [true, 'Nombre de la columna es requerido'],
      unique: true,
      enum: ['Contacted', 'Negotiation', 'Offer Sent', 'Deal Closed', 'In Progress', 'Completed'],
    },
    order: {
      type: Number,
      required: [true, 'Orden es requerido'],
      default: 0,
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
  },
  {
    timestamps: true,
  }
);

const KanbanColumn: Model<IKanbanColumn> =
  mongoose.models.KanbanColumn || mongoose.model<IKanbanColumn>('KanbanColumn', KanbanColumnSchema);

export default KanbanColumn;
