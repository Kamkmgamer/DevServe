module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|js)', '**/?(*.)+(spec|test).+(ts|js)'],
  setupFiles: ['dotenv/config'],
};