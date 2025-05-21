#!/bin/bash

echo "🔁 Заменяем db.prepare на (process.env as any).DB.prepare ..."

find ./src/app/api -type f -name "route.ts" | while read file; do
  echo "🛠 Обработка: $file"
  sed -i 's/db\.prepare/(process.env as any).DB.prepare/g' "$file"
done

echo "✅ Все обращения к db.prepare заменены на D1-синтаксис"
