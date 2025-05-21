// cloudflare-build.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Шаг 1: Сначала выполняем стандартную сборку Next.js
console.log('Выполняем стандартную сборку Next.js...');
execSync('next build', { stdio: 'inherit' });

// Шаг 2: Копируем необходимые файлы для Cloudflare
console.log('Подготавливаем файлы для Cloudflare...');

// Создаем директорию .output, если она не существует
const outputDir = path.resolve(__dirname, '.output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Копируем файлы из .next в .output
execSync('cp -r .next/* .output/', { stdio: 'inherit' });

// Шаг 3: Создаем необходимые файлы для Cloudflare
console.log('Создаем файлы для Cloudflare...');

// Создаем _worker.js
const workerContent = `
export default {
  async fetch(request, env, ctx) {
    // Здесь можно добавить кастомную логику для Cloudflare Worker
    
    // По умолчанию просто проксируем запрос к Next.js
    const url = new URL(request.url);
    const nextUrl = new URL(url.pathname + url.search, 'http://localhost:3000' );
    
    return fetch(nextUrl, request);
  }
};
`;

fs.writeFileSync(path.join(outputDir, '_worker.js'), workerContent, 'utf8');

// Создаем wrangler.toml, если он не существует
const wranglerPath = path.resolve(__dirname, 'wrangler.toml');
if (!fs.existsSync(wranglerPath)) {
  const wranglerContent = `
name = "znk-artel"
main = ".output/_worker.js"
compatibility_date = "2023-10-30"

[site]
bucket = ".output"
`;
  fs.writeFileSync(wranglerPath, wranglerContent, 'utf8');
}

console.log('Сборка для Cloudflare успешно завершена!');
console.log('Для предпросмотра используйте: wrangler dev');
console.log('Для деплоя используйте: wrangler pages deploy .output --project-name=znk-artel');

