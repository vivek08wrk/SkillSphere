#!/bin/bash
# Sab services ka DB push karo

echo "⏳ Waiting for postgres to be ready..."
sleep 5

echo "🔧 Running DB migrations..."

cd services/auth && npx prisma db push --skip-generate
cd ../../services/user && npx prisma db push --skip-generate  
cd ../../services/course && npx prisma db push --skip-generate
cd ../../services/payment && npx prisma db push --skip-generate

echo "✅ All DB migrations done!"