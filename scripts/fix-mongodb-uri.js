// Script para verificar y corregir la URI de MongoDB
const fs = require('fs');
const path = require('path');

function escapeMongoUri(uri) {
  if (!uri || !uri.includes('@')) {
    return uri;
  }

  // Extraer las partes de la URI
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (!match) {
    return uri;
  }

  const [, protocol, username, password, rest] = match;
  
  // Escapar caracteres especiales en la contraseña
  const escapedPassword = encodeURIComponent(password);
  
  // Reconstruir la URI
  return `${protocol}${username}:${escapedPassword}@${rest}`;
}

// Buscar archivos .env
const envFiles = ['.env.local', '.env'];

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    console.log(`\n📄 Analizando ${envFile}...`);
    
    const content = fs.readFileSync(envFile, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    const newLines = [];

    for (let line of lines) {
      if (line.startsWith('MONGODB_URI=')) {
        const originalUri = line.substring('MONGODB_URI='.length).trim();
        const escapedUri = escapeMongoUri(originalUri);
        
        if (originalUri !== escapedUri) {
          console.log('⚠️  URI encontrada con caracteres especiales:');
          console.log(`   Original: ${originalUri.substring(0, 50)}...`);
          console.log(`   Corregida: ${escapedUri.substring(0, 50)}...`);
          line = `MONGODB_URI=${escapedUri}`;
          modified = true;
        } else {
          console.log('✅ URI parece estar correctamente formateada');
        }
      }
      newLines.push(line);
    }

    if (modified) {
      const backupFile = `${envFile}.backup`;
      fs.writeFileSync(backupFile, content);
      console.log(`\n💾 Backup guardado en: ${backupFile}`);
      
      fs.writeFileSync(envFile, newLines.join('\n'));
      console.log(`✅ ${envFile} actualizado`);
      console.log('\n🎉 URI de MongoDB corregida. Ahora puedes ejecutar: ./scripts/create-user.sh');
    } else {
      console.log('✅ No se requieren cambios');
    }
    break;
  }
}

if (!envFiles.some(f => fs.existsSync(f))) {
  console.log('❌ No se encontró ningún archivo .env o .env.local');
}
