import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProjectInventoryAssignment extends Document {
  projectId: mongoose.Types.ObjectId;
  inventoryItemId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  quantity: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectInventoryAssignmentSchema: Schema = new Schema<IProjectInventoryAssignment>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    inventoryItemId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

ProjectInventoryAssignmentSchema.index({ projectId: 1, startDate: 1 });

const ProjectInventoryAssignment: Model<IProjectInventoryAssignment> =
  mongoose.models.ProjectInventoryAssignment ||
  mongoose.model<IProjectInventoryAssignment>('ProjectInventoryAssignment', ProjectInventoryAssignmentSchema);

export default ProjectInventoryAssignment;
