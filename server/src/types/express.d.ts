declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      csrfToken?: () => string;
    }

    interface Response {
      locals: {
        cspNonce?: string;
        requestId?: string;
      };
    }
  }
}