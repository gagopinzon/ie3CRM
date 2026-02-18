// Script para ejecutar el seed de la base de datos
require('dotenv').config({ path: '.env' });
const { seedDatabase } = require('../lib/seed.ts');

async function runSeed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...\n');
    await seedDatabase();
    console.log('\n✅ Seed completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error ejecutando seed:', error.message);
    process.exit(1);
  }
}

runSeed();
