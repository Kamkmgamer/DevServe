/* Utility to redact sensitive data from objects for safe logging */

const SENSITIVE_KEYS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'confirmNewPassword',
  'token',
  'resetToken',
  'authorization',
  'auth',
  'cardNumber',
  'cardCvv',
  'cvv',
  'cvc',
  'expiry',
]);

function mask(value: unknown): string {
  if (value == null) return '***';
  const str = String(value);
  if (str.length <= 4) return '****';
  // Keep last 4 chars, mask the rest
  return `${'*'.repeat(Math.max(0, str.length - 4))}${str.slice(-4)}`;
}

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) {
    return mask(value);
  }
  if (typeof value === 'string') {
    // Mask common token/password-like substrings
    if (/bearer\s+\S+/i.test(value)) return 'Bearer ****';
    if (/sk_live|pk_live|eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/.test(value)) return '***';
  }
  return value;
}

export function redactSensitive(input: unknown, depth = 0): unknown {
  if (depth > 3) return '***'; // prevent deep structures
  if (input == null) return input;
  if (Array.isArray(input)) return input.map((v) => redactSensitive(v, depth + 1));
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = redactSensitive(redactValue(k, v), depth + 1);
    }
    return out;
  }
  return input;
}

export function safeErrorMessage(err: unknown, isDev: boolean) {
  const hasMessage = (e: unknown): e is { message: unknown } =>
    !!e && typeof e === 'object' && 'message' in (e as Record<string, unknown>);
  const msg = hasMessage(err) ? String((err as { message: unknown }).message) : undefined;
  return isDev ? msg : 'Internal server error';
}
