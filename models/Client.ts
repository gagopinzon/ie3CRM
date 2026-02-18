import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
  // Datos de la empresa
  companyName: string;
  rfc?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Datos de contacto (múltiples contactos)
  contacts: Array<{
    name: string;
    email?: string;
    phone?: string;
    position?: string;
  }>;
  
  // Información adicional
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema<IClient>(
  {
    companyName: {
      type: String,
      required: [true, 'Nombre de la empresa es requerido'],
      trim: true,
    },
    rfc: {
      type: String,
      trim: true,
      uppercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'México',
    },
    contacts: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          email: {
            type: String,
            trim: true,
            lowercase: true,
          },
          phone: {
            type: String,
            trim: true,
          },
          position: {
            type: String,
            trim: true,
          },
        },
      ],
      required: [true, 'Al menos un contacto es requerido'],
      validate: {
        validator: function (contacts: any[]) {
          return contacts && contacts.length > 0;
        },
        message: 'Debe agregar al menos un contacto',
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

export default Client;
