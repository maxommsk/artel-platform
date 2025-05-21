#!/bin/bash

echo "🔁 Начинаем миграцию .prepare().run/get/all к async D1 синтаксису..."

TARGET_FILES=$(find ./src/app/api -name "route.ts")

for file in $TARGET_FILES; do
  echo "📄 Обработка файла: $file"

  # .run(...) → await .run(...)
  sed -i 's/\.run(\([^)]*\))/\.run(\1)/g' "$file"
  sed -i 's/=\s*db\.prepare/\= await db.prepare/g' "$file"

  # .get(...) → await .first()
  sed -i 's/\.get(\([^)]*\))/\.first(\1)/g' "$file"

  # .all(...) → await .all(...)
  sed -i 's/\.all(\([^)]*\))/\.all(\1)/g' "$file"
done

echo "✅ Завершено. Проверьте файлы вручную на корректность."
