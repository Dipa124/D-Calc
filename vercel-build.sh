#!/bin/bash
# Vercel Build Script for D-Calc
# This script swaps the Prisma schema from SQLite to PostgreSQL (Supabase)
# before building, so the generated Prisma client uses PostgreSQL on Vercel.

set -e

echo "🔧 D-Calc Vercel Build — Switching to Supabase PostgreSQL schema..."

# Check if we're on Vercel (DATABASE_URL should be a PostgreSQL URL)
if echo "$DATABASE_URL" | grep -q "^postgresql"; then
  echo "📦 PostgreSQL DATABASE_URL detected — using Supabase schema"
  # Replace the SQLite schema with the PostgreSQL one
  cp prisma/schema.supabase.prisma prisma/schema.prisma
  echo "✅ Schema swapped to PostgreSQL"
else
  echo "📦 No PostgreSQL URL detected — keeping SQLite schema (local dev)"
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Push schema to database (for initial setup or migrations)
echo "🔄 Pushing schema to database..."
npx prisma db push --accept-data-loss 2>/dev/null || echo "⚠️ db push skipped (may already exist)"

# Build Next.js
echo "🏗️ Building Next.js..."
next build
