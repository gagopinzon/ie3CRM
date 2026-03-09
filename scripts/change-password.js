/**
 * Cambia la contraseña de un usuario por email.
 * Uso: node scripts/change-password.js <email> <nueva-contraseña>
 * Ejemplo: node scripts/change-password.js test@test.com 12345678
 */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Uso: node scripts/change-password.js <email> <nueva-contraseña>');
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no está en .env.local');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    console.error('Usuario no encontrado:', email);
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();
  console.log('Contraseña actualizada para', email);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
