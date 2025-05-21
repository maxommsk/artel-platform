#!/bin/bash

# Удаляем все строки с заглушками "prepare(...).run(...);" и т.п.
grep -rl 'prepare(`SQL`).run(...);' ./src | while read file; do
  echo "Очищаю: $file"
  sed -i '/prepare(`SQL`).run(...);/d' "$file"
done

# Также удалим другие заглушки, если остались
grep -rl 'prepare(...).run(...);' ./src | while read file; do
  echo "Очищаю: $file"
  sed -i '/prepare(...).run(...);/d' "$file"
done
