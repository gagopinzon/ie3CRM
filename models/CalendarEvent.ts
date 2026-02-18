import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;
  projectId?: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  reminderDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  type: 'reminder' | 'meeting' | 'deadline';
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema: Schema = new Schema<ICalendarEvent>(
  {
    title: {
      type: String,
      required: [true, 'Título del evento es requerido'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    startDate: {
      type: Date,
      required: [true, 'Fecha de inicio es requerida'],
    },
    endDate: {
      type: Date,
    },
    reminderDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Usuario creador es requerido'],
    },
    type: {
      type: String,
      enum: ['reminder', 'meeting', 'deadline'],
      default: 'reminder',
    },
  },
  {
    timestamps: true,
  }
);

const CalendarEvent: Model<ICalendarEvent> =
  mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);

export default CalendarEvent;
