#!/bin/bash

echo "🔧 Обновляем подключение к better-sqlite3 в файлах..."

# Путь к файлам
FILES=(
  "src/app/api/auth/register/route.ts"
  "src/app/api/auth/login/route.ts"
)

for FILE in "${FILES[@]}"; do
  echo "📄 Обработка: $FILE"

  # Заменим импорт sqlite на better-sqlite3
  sed -i 's|import { db.*|import { db } from "@/lib/db";|g' "$FILE"

  # Обновим методы db
  sed -i 's/db\.run/db.prepare(...).run/g' "$FILE"
  sed -i 's/db\.get/db.prepare(...).get/g' "$FILE"
  sed -i 's/db\.all/db.prepare(...).all/g' "$FILE"

  echo "✅ Обновлено: $FILE"
done

echo "🎉 Скрипт завершён. Проверь каждый файл и замени ... на SQL-запросы."
