#!/bin/bash

echo "🧹 Удаление заглушек db.prepare(...).run(...) и подобного синтаксиса..."

# Целевые шаблоны заглушек
patterns=(
  'db\.prepare\(\s*`SQL`\s*\)\.run\s*\([^)]*\);'
  'db\.prepare\(\s*`SQL`\s*\)\.all\s*\([^)]*\);'
  'db\.prepare\(\s*`SQL`\s*\)\.get\s*\([^)]*\);'
  'db\.prepare\(\s*`[^`]*`\s*\)\.run\s*\(\s*\.\.\.\s*\);'
  'db\.prepare\(\s*`[^`]*`\s*\)\.all\s*\(\s*\.\.\.\s*\);'
  'db\.prepare\(\s*`[^`]*`\s*\)\.get\s*\(\s*\.\.\.\s*\);'
)

for pattern in "${patterns[@]}"; do
  echo "🔍 Удаление по шаблону: $pattern"
  grep -rl --include="*.ts" --exclude-dir="node_modules" --exclude-dir=".next" --exclude-dir="tests" "db.prepare" ./src \
  | xargs sed -i "/$pattern/d"
done

echo "✅ Заглушки удалены."
