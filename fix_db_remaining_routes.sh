#!/bin/bash

echo "🔧 Обновляем оставшиеся API маршруты..."

FILES=(
  "src/app/api/members/route.ts"
  "src/app/api/roadmap/route.ts"
  "src/app/api/tokens/route.ts"
  "src/app/api/contributions/route.ts"
  "src/app/api/branches/route.ts"
)

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "📄 Обработка: $FILE"

    sed -i 's|import { db.*|import { db } from "@/lib/db";|g' "$FILE"
    sed -i 's/db\.query<\([^>]*\)>([^)]*)/db.prepare(...).all()/g' "$FILE"
    sed -i 's/db\.query([^)]*)/db.prepare(...).all()/g' "$FILE"
    sed -i 's/db\.execute([^)]*)/db.prepare(...).run()/g' "$FILE"
    sed -i 's/db\.get([^)]*)/db.prepare(...).get()/g' "$FILE"
    sed -i 's/db\.run([^)]*)/db.prepare(...).run()/g' "$FILE"

    echo "✅ Обновлено: $FILE"
  else
    echo "⚠️ Пропущено (нет файла): $FILE"
  fi
done

echo "🎉 Завершено. Замените '...' на SQL вручную!"
