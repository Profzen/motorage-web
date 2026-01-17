import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const REQUIRED_ENV_VARS = [
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN',
  'JWT_SECRET'
];

function checkEnv() {
  console.log('🔍 Checking environment variables...');
  const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('Check your .env file or CI secrets.');
    process.exit(1);
  }

  console.log('✅ All required environment variables are set.');
}

checkEnv();
