module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  globalSetup: '<rootDir>/src/tests/jest-global-setup.ts',
  globalTeardown: '<rootDir>/src/tests/jest-global-teardown.ts',
  verbose: true,
};