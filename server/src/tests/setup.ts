// Jest per-test setup
import dotenv from 'dotenv';
import path from 'path';

// Load a .env.test if present, then override defaults below
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Provide sensible defaults for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
// Ensure a separate SQLite DB is used for tests
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';

// Increase default test timeout if needed for first migration
jest.setTimeout(30000);
