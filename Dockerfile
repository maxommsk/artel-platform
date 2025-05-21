# Базовый образ Node.js с поддержкой C++ компиляции
FROM node:20

# Установка зависимостей сборки для better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ sqlite3

# Установка pnpm
RUN npm install -g pnpm

# Создание директории приложения
WORKDIR /app

# Копирование зависимостей
COPY package.json pnpm-lock.yaml ./

# Установка зависимостей
RUN pnpm install

# Копирование всех исходников
COPY . .

# Сборка (если есть)
RUN pnpm build || true

# Экспонируем порт
EXPOSE 3000

# Запуск
CMD ["pnpm", "dev"]
