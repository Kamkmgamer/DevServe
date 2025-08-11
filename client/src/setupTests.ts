/// <reference types="@testing-library/jest-dom" />
import "@testing-library/jest-dom/extend-expect";
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

// Mock import.meta.env for Jest
Object.defineProperty(global, 'importMeta', {
  writable: true,
  value: {
    env: {
      VITE_API_BASE_URL: "http://localhost:8000",
      VITE_PORTFOLIO_URL: "https://mock-portfolio.com",
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