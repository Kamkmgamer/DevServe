import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  globalSetup: '<rootDir>/src/tests/jest-global-setup.ts',
  globalTeardown: '<rootDir>/src/tests/jest-global-teardown.ts',
  // Make sure ts-jest uses tsconfig
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true,
    },
  },
  verbose: true,
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
};

export default config;
