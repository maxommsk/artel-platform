#!/bin/bash

LOG_FILE="fix_db_usage.log"
> "$LOG_FILE"

echo "🔍 Поиск и обновление route.ts..." | tee -a "$LOG_FILE"

FILES=$(find src/app/api -type f -name 'route.ts')

for FILE in $FILES; do
  echo "🔧 Обрабатываем файл: $FILE" | tee -a "$LOG_FILE"

  # Сохраним копию для сравнения
  cp "$FILE" "$FILE.bak"

  # Обновляем импорт
  sed -i '/from .*db/s/.*/import { db } from '\''@\/lib\/db'\'';/' "$FILE"

  # Обновляем вызовы db.run/get/all
  sed -i 's/db\.run(\(.*\))/db.prepare(\1).run()/' "$FILE"
  sed -i 's/db\.get(\(.*\))/db.prepare(\1).get()/' "$FILE"
  sed -i 's/db\.all(\(.*\))/db.prepare(\1).all()/' "$FILE"

  echo "📄 Изменения:" | tee -a "$LOG_FILE"
  diff "$FILE.bak" "$FILE" | tee -a "$LOG_FILE"

  rm "$FILE.bak"
  echo "✅ Завершено: $FILE" | tee -a "$LOG_FILE"
  echo "-------------------------------" >> "$LOG_FILE"
done

echo "✅ Все файлы обновлены. Подробности в $LOG_FILE"
