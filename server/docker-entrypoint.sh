#!/bin/sh
set -eu

# Ensure Prisma has the DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

echo "Running Prisma migrations..."
# Use explicit schema path in case working dir differs
npx prisma migrate deploy --schema prisma/schema.prisma

echo "Starting server..."
exec node dist/index.js
