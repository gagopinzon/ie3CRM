// Script simple para ejecutar el seed
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  require('dotenv').config({ path: '.env' });
} else {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir modelos
const DocumentTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  category: String,
}, { timestamps: true });

const KanbanColumnSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  order: { type: Number, required: true },
  color: String,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'project_manager', 'engineer', 'viewer'], default: 'viewer' },
}, { timestamps: true });

const DocumentType = mongoose.models.DocumentType || mongoose.model('DocumentType', DocumentTypeSchema);
const KanbanColumn = mongoose.models.KanbanColumn || mongoose.model('KanbanColumn', KanbanColumnSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

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
  { name: 'Contacted', order: 0, color: '#3b82f6' },
  { name: 'Negotiation', order: 1, color: '#f59e0b' },
  { name: 'Offer Sent', order: 2, color: '#8b5cf6' },
  { name: 'Deal Closed', order: 3, color: '#10b981' },
];

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definido en .env o .env.local');
    }

    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Seed Document Types
    console.log('📄 Creando tipos de documentos...');
    for (const docType of documentTypes) {
      await DocumentType.findOneAndUpdate(
        { name: docType.name },
        docType,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ ${documentTypes.length} tipos de documentos creados\n`);

    // Seed Kanban Columns
    console.log('📊 Creando columnas Kanban...');
    for (const column of kanbanColumns) {
      await KanbanColumn.findOneAndUpdate(
        { name: column.name },
        column,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ ${kanbanColumns.length} columnas Kanban creadas\n`);

    // Seed Admin Users
    console.log('👤 Creando usuarios...');
    
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
      console.log('✅ Usuario admin creado: admin@despacho.com / admin123');
    } else {
      console.log('ℹ️  Usuario admin ya existe');
    }

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
      console.log('✅ Usuario mrgago creado: mrgago@gmail.com / A4s5d6a4s5d6.0');
    } else {
      const hashedPassword = await bcrypt.hash('A4s5d6a4s5d6.0', 10);
      await User.findOneAndUpdate(
        { email: mrgagoEmail },
        { password: hashedPassword, name: 'MR Gago', role: 'admin' }
      );
      console.log('✅ Usuario mrgago actualizado');
    }

    await mongoose.disconnect();
    console.log('\n✅ Seed completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seed();
