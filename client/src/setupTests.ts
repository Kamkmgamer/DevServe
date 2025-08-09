/// <reference types="@testing-library/jest-dom" />
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

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});