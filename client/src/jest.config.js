/* eslint-env node */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|scss|svg)$": "identity-obj-proxy", // Mock CSS/SVG imports
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"], // Jest setup file
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Use ts-jest for TypeScript files
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json", // Point to your tsconfig.json
    },
    "import.meta": {
      env: {
        VITE_PORTFOLIO_URL: "https://mock-portfolio.com",
      },
    },
  },
  transformIgnorePatterns: [
    "node_modules/(?!axios)" // Ensure axios is transformed if needed
  ],
};