const { execSync } = require('child_process');

module.exports = async () => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  process.env.DAILY_TIPS_PERSIST = process.env.DAILY_TIPS_PERSIST || 'false';

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
