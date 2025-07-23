import "@testing-library/jest-dom";
// Mock `import.meta.env` for Jest
Object.defineProperty(global, "importMeta", {
  value: {
    env: {
      VITE_API_BASE_URL: "http://localhost:8000", // Mock your API base URL here
    },
  },
});