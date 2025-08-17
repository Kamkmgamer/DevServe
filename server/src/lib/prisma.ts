import { PrismaClient } from "@prisma/client";

// Ensure a single PrismaClient instance across hot-reloads and test files
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const client = globalThis.prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = client;
}

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