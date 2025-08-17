import { PrismaClient } from "@prisma/client";
import { prismaQueryDurationSeconds } from "./metrics";

// Ensure a single PrismaClient instance across hot-reloads and test files
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const client = globalThis.prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = client;
}

// Metrics: measure Prisma query durations and success label
// Use loose typing to avoid version-specific Prisma type issues
(client as any).$use(async (params: any, next: (params: any) => Promise<any>) => {
  const start = process.hrtime.bigint();
  let success = "true";
  try {
    const result = await next(params);
    return result;
  } catch (err) {
    success = "false";
    throw err;
  } finally {
    const end = process.hrtime.bigint();
    const durationSeconds = Number(end - start) / 1e9;
    // model can be undefined for raw queries; normalize to 'unknown'
    const model = (params.model || "unknown") as string;
    const action = (params.action || "unknown") as string;
    prismaQueryDurationSeconds.labels({ model, action, success }).observe(durationSeconds);
  }
});

// In test environment, make $disconnect a no-op to avoid closing the
// shared client while tests run in parallel.
const prisma: PrismaClient = new Proxy(client as PrismaClient, {
  get(target, prop, receiver) {
    if (prop === "$disconnect" && process.env.NODE_ENV === "test") {
      return async () => {};
    }
    return Reflect.get(target, prop, receiver);
  },
}) as PrismaClient;

export default prisma;