# syntax=docker/dockerfile:1

# ---- Base image ----
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- Dependencies ----
FROM base AS deps
# Install OS deps if needed (e.g., openssl for Prisma)
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Builder (TypeScript -> JS) ----
FROM base AS builder
RUN apk add --no-cache openssl python3 make g++
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# ---- Production Image ----
FROM base AS runner
# Create non-root user
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs
USER nodeuser

WORKDIR /app
ENV NODE_ENV=production

# Copy node_modules from deps and dist from builder
COPY --chown=nodeuser:nodejs --from=deps /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs --from=builder /app/dist ./dist
COPY --chown=nodeuser:nodejs package.json ./package.json
COPY --chown=nodeuser:nodejs prisma ./prisma

# Prisma requires OpenSSL in alpine, ensure it's present
# (already present in base, but keep for clarity)

# Expose port
EXPOSE 8000

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8000/ || exit 1

# Environment variables used by app
# - DATABASE_URL: postgresql://user:pass@host:5432/db
# - JWT_PUBLIC_KEYS or JWT_PUBLIC_KEY: PEM public keys
# - JWT_PRIVATE_KEY (only for signing if the server signs tokens)
# - CORS_ORIGINS, CLIENT_URL, SITE_URL

CMD ["node", "dist/index.js"]
