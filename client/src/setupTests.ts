import "@testing-library/jest-dom";
Object.defineProperty(global, "importMeta", {
  value: {
    env: {
      VITE_API_BASE_URL: "http://localhost:8000",
    },
  },
});