import 'dotenv/config';
import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  const email = process.argv[2] || 'admin@univ-lome.tg';
  const password = process.argv[3] || 'admin123';
  const nom = 'Admin';
  const prenom = 'Miyi';

  console.log(`🚀 Création de l'administrateur : ${email}...`);

  let hashedPassword = '';

  try {
    hashedPassword = await bcrypt.hash(password, 10);
    
    await db.insert(users).values({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role: 'administrateur',
      statut: 'actif',
    });

    console.log('✅ Administrateur créé avec succès !');
    console.log(`📧 Email : ${email}`);
    console.log(`🔑 Mot de passe : ${password}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('NOT NULL constraint failed: users.id')) {
        // Fallback pour crypto si randomUUID() n'est pas dispo dans l'env CLI
        const crypto = await import('node:crypto');
        await db.insert(users).values({
            id: crypto.randomUUID(),
            nom,
            prenom,
            email,
            password: hashedPassword,
            role: 'administrateur',
            statut: 'actif',
          });
          console.log('✅ Administrateur créé avec succès (avec ID manuel) !');
    } else {
        console.error('❌ Erreur lors de la création de l\'admin :', error);
    }
  } finally {
    process.exit();
  }
}

createAdmin();
