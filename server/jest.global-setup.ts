import { execSync } from 'child_process';

export default async function globalSetup() {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  // Prevent daily tips persistence during tests to avoid FS writes
  process.env.DAILY_TIPS_PERSIST = process.env.DAILY_TIPS_PERSIST || 'false';

  try {
    // Generate Prisma client
    execSync('npx prisma generate', { stdio: 'inherit' });
  } catch (e) {
    // Ignore to let tests report meaningful errors if prisma not available
    console.error('Prisma generate failed:', e);
  }

  try {
    // Ensure the SQLite schema is applied
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  } catch (e) {
    console.error('Prisma db push failed:', e);
  }
}
