#!/bin/bash

echo "🧹 Удаление неиспользуемых импортов db..."

find ./src -type f -name "*.ts" ! -path "*/node_modules/*" ! -path "*/.next/*" | while read file; do
  if grep -q "import { db" "$file"; then
    if ! grep -q "db\." "$file"; then
      echo "✂️  Чистим импорт в $file"
      sed -i "/import { db } from ['\"]@\/lib\/db['\"];/d" "$file"
    fi
  fi
done

echo "✅ Импорты db очищены, если они не использовались."
