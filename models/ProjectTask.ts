import mongoose, { Schema, Document, Model } from 'mongoose';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface IProjectTask extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  order: number; // Orden dentro de la columna
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectTaskSchema: Schema = new Schema<IProjectTask>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'ID del proyecto es requerido'],
    },
    title: {
      type: String,
      required: [true, 'Título de la tarea es requerido'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'done'],
      default: 'todo',
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuario que creó la tarea es requerido'],
    },
  },
  {
    timestamps: true,
  }
);

// Índice para ordenar tareas por proyecto y orden
ProjectTaskSchema.index({ projectId: 1, status: 1, order: 1 });

const ProjectTask: Model<IProjectTask> =
  mongoose.models.ProjectTask || mongoose.model<IProjectTask>('ProjectTask', ProjectTaskSchema);

export default ProjectTask;
