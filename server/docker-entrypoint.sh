#!/bin/sh
set -eu

# Ensure DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

echo "Running Drizzle migrations..."
npx drizzle-kit migrate

echo "Starting server..."
exec node dist/index.js
