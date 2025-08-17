const { execSync } = require('child_process');

module.exports = async () => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  process.env.DAILY_TIPS_PERSIST = process.env.DAILY_TIPS_PERSIST || 'false';
  // Force Prisma to use a local SQLite DB for tests regardless of .env
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';

  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
  } catch (e) {
    console.error('Prisma generate failed:', e?.message || e);
  }

  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  } catch (e) {
    console.error('Prisma db push failed:', e?.message || e);
  }
};
