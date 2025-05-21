#!/bin/bash

# Удаление всех заглушек, которые вызывают синтаксическую ошибку
find ./src -type f -name "*.ts" | while read file; do
  echo "🧹 Чистим: $file"
  sed -i '/prepare(.../d' "$file"
  sed -i '/prepare(`SQL`).run(...);/d' "$file"
  sed -i '/DB.prepare(...).get/d' "$file"
  sed -i '/DB.prepare(...).run/d' "$file"
  sed -i '/DB.prepare(...).first/d' "$file"
  sed -i '/DB.prepare(...).all/d' "$file"
done
