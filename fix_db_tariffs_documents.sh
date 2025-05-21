#!/bin/bash

echo "🔧 Обновляем tariffs и documents маршруты..."

TARIFFS="src/app/api/tariffs/route.ts"
DOCUMENTS="src/app/api/documents/route.ts"

for FILE in "$TARIFFS" "$DOCUMENTS"; do
  if [ -f "$FILE" ]; then
    echo "📄 Обработка: $FILE"

    sed -i 's|import { db.*|import { db } from "@/lib/db";|g' "$FILE"
    sed -i 's/db\.query<\([^>]*\)>([^)]*)/db.prepare(...).all()/g' "$FILE"
    sed -i 's/db\.execute([^)]*)/db.prepare(...).run()/g' "$FILE"

    echo "✅ Обновлено: $FILE"
  fi
done

echo "🎉 Скрипт выполнен. Замени '...' на точные SQL вручную!"
