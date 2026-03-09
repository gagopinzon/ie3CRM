import mongoose, { Schema, Document, Model } from 'mongoose';

export type ActivityType = 'project_status' | 'task_status';

export interface IActivityLog extends Document {
  type: ActivityType;
  /** ID del proyecto (siempre presente para enlazar) */
  projectId: mongoose.Types.ObjectId;
  /** Nombre del proyecto (cache para listados) */
  projectName: string;
  /** ID del recurso afectado: proyecto o tarea */
  entityId: mongoose.Types.ObjectId;
  /** Para tareas: título de la tarea */
  entityTitle?: string;
  /** Valor anterior (estado) */
  previousValue: string;
  /** Valor nuevo (estado) */
  newValue: string;
  /** Usuario que realizó el cambio */
  userId: mongoose.Types.ObjectId;
  /** Nombre del usuario (cache) */
  userName: string;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema<IActivityLog>(
  {
    type: {
      type: String,
      required: true,
      enum: ['project_status', 'task_status'],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    projectName: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityTitle: { type: String },
    previousValue: { type: String, required: true },
    newValue: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ projectId: 1, createdAt: -1 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
