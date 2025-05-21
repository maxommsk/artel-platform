#!/bin/bash

echo "🔧 Обновляем register и login маршруты..."

# REGISTER FILE
REGISTER_FILE="src/app/api/auth/register/route.ts"
LOGIN_FILE="src/app/api/auth/login/route.ts"

# Проверка файла регистрации
if [ -f "$REGISTER_FILE" ]; then
  echo "📄 Обработка: $REGISTER_FILE"

  # Импорт
  sed -i 's|import { db.*|import { db } from "@/lib/db";|g' "$REGISTER_FILE"

  # db.query -> db.prepare(...).all(...)
  sed -i 's/db\.query<\([^>]*\)>([^)]*)/db.prepare(...).all()/g' "$REGISTER_FILE"

  # db.execute -> db.prepare(...).run(...)
  sed -i 's/db\.execute([^)]*)/db.prepare(...).run()/g' "$REGISTER_FILE"

  echo "✅ Register обновлён."
fi

# LOGIN FILE
if [ -f "$LOGIN_FILE" ]; then
  echo "📄 Обработка: $LOGIN_FILE"

  sed -i 's|import { db.*|import { db } from "@/lib/db";|g' "$LOGIN_FILE"
  sed -i 's/db\.query<\([^>]*\)>([^)]*)/db.prepare(...).all()/g' "$LOGIN_FILE"

  echo "✅ Login обновлён."
fi

echo "🎉 Скрипт выполнен. Замени '...' на настоящие SQL вручную!"
