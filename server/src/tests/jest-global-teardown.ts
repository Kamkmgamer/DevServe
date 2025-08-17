import fs from 'fs';
import path from 'path';

export default async function globalTeardown() {
  const projectRoot = path.resolve(__dirname, '../../..');
  const dbFile = path.join(projectRoot, 'test.db');
  try {
    if (fs.existsSync(dbFile)) {
      fs.rmSync(dbFile);
    }
  } catch (e) {
    // ignore
  }
}
