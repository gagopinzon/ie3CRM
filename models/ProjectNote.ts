import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProjectNote extends Document {
  projectId: mongoose.Types.ObjectId;
  content: string;
  type: 'note' | 'log'; // 'note' para notas generales, 'log' para bitácora
  /** Si está definido, la nota se muestra en el calendario (dashboard y proyecto) */
  eventDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectNoteSchema: Schema = new Schema<IProjectNote>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'ID del proyecto es requerido'],
    },
    content: {
      type: String,
      required: [true, 'Contenido de la nota es requerido'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['note', 'log'],
      default: 'note',
    },
    eventDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuario que creó la nota es requerido'],
    },
  },
  {
    timestamps: true,
  }
);

const ProjectNote: Model<IProjectNote> =
  mongoose.models.ProjectNote || mongoose.model<IProjectNote>('ProjectNote', ProjectNoteSchema);

export default ProjectNote;
