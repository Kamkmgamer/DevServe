import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

process.env.VITE_API_BASE_URL = "http://localhost:8000";
process.env.VITE_PORTFOLIO_URL = "https://mock-portfolio.com";

Object.defineProperty(global, "importMeta", {
  value: {
    env: {
      VITE_API_BASE_URL: "http://localhost:8000",
      VITE_PORTFOLIO_URL: "https://mock-portfolio.com", // Mock portfolio URL
    },
  },
});