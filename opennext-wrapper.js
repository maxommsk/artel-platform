// opennext-wrapper.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Сохраняем оригинальный process.argv
const originalArgv = process.argv.slice();

// Создаем временный файл конфигурации
const tempConfigPath = path.resolve(__dirname, '.temp-open-next.config.js');
const originalConfigPath = path.resolve(__dirname, 'open-next.config.ts');

// Читаем оригинальную конфигурацию
let configContent = fs.existsSync(originalConfigPath) 
  ? fs.readFileSync(originalConfigPath, 'utf8')
  : `
const cache = require("@opennextjs/cloudflare/kvCache").default;

const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      incrementalCache: () => cache,
      cache: cache,
      tagCache: "dummy",
      queue: "dummy",
    },
  },

  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
    },
  },

  dangerous: {
    enableCacheInterception: false,
  },
};

module.exports = config;
`;

// Модифицируем конфигурацию, добавляя define для проблемных модулей
const modifiedConfig = `
${configContent}

// Модифицируем конфигурацию для обхода проблем с алиасами
const originalConfig = module.exports;
module.exports = {
  ...originalConfig,
  default: {
    ...originalConfig.default,
    override: {
      ...originalConfig.default.override,
      esbuildOptions: {
        ...((originalConfig.default || {}).override || {}).esbuildOptions,
        define: {
          'next/dist/compiled/ws': 'false',
          'next/dist/compiled/edge-runtime': 'false'
        },
        external: [
          'next/dist/compiled/ws',
          'next/dist/compiled/edge-runtime'
        ]
      }
    }
  },
  middleware: {
    ...originalConfig.middleware,
    override: {
      ...originalConfig.middleware.override,
      esbuildOptions: {
        ...((originalConfig.middleware || {}).override || {}).esbuildOptions,
        define: {
          'next/dist/compiled/ws': 'false',
          'next/dist/compiled/edge-runtime': 'false'
        },
        external: [
          'next/dist/compiled/ws',
          'next/dist/compiled/edge-runtime'
        ]
      }
    }
  }
};
`;

// Записываем модифицированную конфигурацию во временный файл
fs.writeFileSync(tempConfigPath, modifiedConfig, 'utf8');

// Устанавливаем переменную окружения для указания пути к временному файлу конфигурации
process.env.OPENNEXT_CONFIG_PATH = tempConfigPath;

// Запускаем оригинальную команду opennextjs-cloudflare
try {
  execSync('npx opennextjs-cloudflare', { 
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('Ошибка при выполнении opennextjs-cloudflare:', error);
  process.exit(1);
} finally {
  // Удаляем временный файл конфигурации
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }
}

