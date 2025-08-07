import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

Object.defineProperty(global, "importMeta", {
  value: {
    env: {
      VITE_API_BASE_URL: "http://localhost:8000",
    },
  },
});