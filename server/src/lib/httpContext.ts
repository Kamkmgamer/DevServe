import { AsyncLocalStorage } from 'async_hooks';

interface RequestContext {
  requestId?: string;
}

export const httpContext = new AsyncLocalStorage<RequestContext>();

export function setRequestContext(ctx: RequestContext) {
  httpContext.enterWith(ctx);
}

export function runWithRequestContext<T>(ctx: RequestContext, fn: () => T): T {
  return httpContext.run(ctx, fn);
}

export function getRequestId(): string | undefined {
  return httpContext.getStore()?.requestId;
}
