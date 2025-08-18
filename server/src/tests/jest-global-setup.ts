import { execSync } from 'node:child_process';
import path from 'path';
import fs from 'fs';

export default async function globalSetup() {
  // Ensure test database URL
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
  process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

  // Point to the server directory (repoRoot/server)
  const serverRoot = path.resolve(__dirname, '../..');
  const prismaSchemaPath = path.join(serverRoot, 'prisma', 'schema.prisma');

  // If a previous test DB exists, remove it to start clean
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.startsWith('file:')) {
    const dbFile = path.join(serverRoot, 'prisma', 'test.db');
    // Note: Prisma stores SQLite relative to working dir; using file:./test.db at server root
    const rootDbFile = path.join(serverRoot, 'test.db');
    try {
      if (fs.existsSync(dbFile)) fs.rmSync(dbFile);
    } catch {}
    try {
      if (fs.existsSync(rootDbFile)) fs.rmSync(rootDbFile);
    } catch {}
  }

  // Run migrations against the test DB
  try {
    execSync(`npx prisma migrate deploy --schema "${prismaSchemaPath}"`, {
      cwd: serverRoot,
      stdio: 'inherit',
      env: { ...process.env },
    });
  } catch (err) {
    console.error('Failed to run Prisma migrations for tests:', err);
    throw err;
  }
}
