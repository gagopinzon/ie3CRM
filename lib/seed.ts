import connectDB from './mongodb';
import DocumentType from '@/models/DocumentType';
import KanbanColumn from '@/models/KanbanColumn';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const documentTypes = [
  { name: 'Cotización', description: 'Documento de cotización de servicios', category: 'Comercial' },
  { name: 'Orden de compra', description: 'Orden de compra de materiales o servicios', category: 'Comercial' },
  { name: 'Factura', description: 'Facturación de servicios', category: 'Financiero' },
  { name: 'Fichas técnicas', description: 'Fichas técnicas de materiales o equipos', category: 'Técnico' },
  { name: 'Planos', description: 'Planos arquitectónicos y de ingeniería', category: 'Técnico' },
  { name: 'Fianzas flotilla', description: 'Documentos de fianzas para flotilla', category: 'Legal' },
  { name: 'Compra de material', description: 'Documentos de compra de materiales', category: 'Comercial' },
  { name: 'Gestoría', description: 'Documentos de gestoría y trámites', category: 'Administrativo' },
  { name: 'Levantamiento fotográfico', description: 'Fotografías y documentación visual', category: 'Técnico' },
  { name: 'Mantenimientos', description: 'Documentos de mantenimiento', category: 'Técnico' },
  { name: 'Ingenierías', description: 'Documentos de ingeniería y cálculos', category: 'Técnico' },
  { name: 'Ubicación', description: 'Documentos de ubicación y coordenadas', category: 'Técnico' },
  { name: 'Viáticos', description: 'Documentos de viáticos y gastos', category: 'Financiero' },
  { name: 'Contratos', description: 'Contratos y acuerdos', category: 'Legal' },
  { name: 'Permisos y licencias', description: 'Permisos y licencias de construcción', category: 'Legal' },
  { name: 'Estudios de suelo', description: 'Estudios geotécnicos y de suelo', category: 'Técnico' },
  { name: 'Memorias de cálculo', description: 'Memorias de cálculo estructural', category: 'Técnico' },
];

const kanbanColumns = [
  { name: 'Contacted' as const, order: 0, color: '#3b82f6' },
  { name: 'Negotiation' as const, order: 1, color: '#f59e0b' },
  { name: 'Offer Sent' as const, order: 2, color: '#8b5cf6' },
  { name: 'Deal Closed' as const, order: 3, color: '#10b981' },
];

export async function seedDatabase() {
  try {
    await connectDB();

    // Seed Document Types
    console.log('Seeding document types...');
    for (const docType of documentTypes) {
      await DocumentType.findOneAndUpdate(
        { name: docType.name },
        docType,
        { upsert: true, new: true }
      );
    }
    console.log('Document types seeded successfully');

    // Seed Kanban Columns
    console.log('Seeding kanban columns...');
    for (const column of kanbanColumns) {
      await KanbanColumn.findOneAndUpdate(
        { name: column.name },
        column,
        { upsert: true, new: true }
      );
    }
    console.log('Kanban columns seeded successfully');

    // Seed Admin Users
    console.log('Seeding admin users...');
    
    // Admin por defecto
    const adminEmail = 'admin@despacho.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrador',
        role: 'admin',
      });
      console.log('Admin user created: admin@despacho.com / admin123');
    } else {
      console.log('Admin user already exists');
    }

    // Usuario mrgago@gmail.com
    const mrgagoEmail = 'mrgago@gmail.com';
    const mrgagoExists = await User.findOne({ email: mrgagoEmail });
    
    if (!mrgagoExists) {
      const hashedPassword = await bcrypt.hash('A4s5d6a4s5d6.0', 10);
      await User.create({
        email: mrgagoEmail,
        password: hashedPassword,
        name: 'MR Gago',
        role: 'admin',
      });
      console.log('User created: mrgago@gmail.com / A4s5d6a4s5d6.0');
    } else {
      // Actualizar contraseña si ya existe
      const hashedPassword = await bcrypt.hash('A4s5d6a4s5d6.0', 10);
      await User.findOneAndUpdate(
        { email: mrgagoEmail },
        { password: hashedPassword, name: 'MR Gago', role: 'admin' }
      );
      console.log('User updated: mrgago@gmail.com');
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
