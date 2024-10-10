#!/bin/bash

SCRIPT_DIR=$(dirname "$(realpath "$0")")
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/../..")

DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | cut -d '=' -f2-)

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set in the .env file."
  exit 1
fi

echo "DATABASE_URL: $DATABASE_URL"
export DATABASE_URL

npx prisma migrate dev --schema=$PROJECT_ROOT/packages/db/prisma/schema.prisma