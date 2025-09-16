import { execSync } from 'node:child_process';
import path from 'path';

export default async function globalSetup() {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
  process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

  const serverRoot = path.resolve(__dirname, '..');

  // Push schema for test DB
  execSync('npx drizzle-kit push', {
    cwd: serverRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL },
  });

  // Truncate all tables for clean state
  // Use a script or manual SQL via execSync('psql -d testdb -c "TRUNCATE ..."')
  // For simplicity, assume manual or add truncate script
}
