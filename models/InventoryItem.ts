import mongoose, { Schema, Document, Model } from 'mongoose';

export type InventoryItemType = 'equipment_return' | 'equipment_stays' | 'project_material';

export interface IInventoryItem extends Document {
  name: string;
  description?: string;
  type: InventoryItemType;
  quantity: number;
  unit?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema: Schema = new Schema<IInventoryItem>(
  {
    name: {
      type: String,
      required: [true, 'Nombre es requerido'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['equipment_return', 'equipment_stays', 'project_material'],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const InventoryItem: Model<IInventoryItem> =
  mongoose.models.InventoryItem || mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);

export default InventoryItem;
