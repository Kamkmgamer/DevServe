// server/src/lib/secrets.ts
// Utilities to load secrets from env or file paths (Docker secrets, etc.)
import fs from 'fs';

export function getEnvOrFile(varName: string, fileVarName?: string): string | undefined {
  const direct = process.env[varName];
  if (direct && direct.trim().length > 0) return direct;
  const filePath = process.env[fileVarName || `${varName}_FILE`];
  if (filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.trim();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function normalizeMultiline(value?: string): string | undefined {
  if (!value) return value;
  return value.includes('\n') ? value.replace(/\n/g, '\n') : value;
}
