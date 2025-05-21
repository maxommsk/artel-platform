
const cache = require("@opennextjs/cloudflare/kvCache").default;
const aliasPlugin = require('./esbuild-alias-plugin');

const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      incrementalCache: () => cache,
      cache: cache,
      tagCache: "dummy",
      queue: "dummy",
      esbuildPlugins: [aliasPlugin],
    },
  },

  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      esbuildPlugins: [aliasPlugin],
    },
  },

  dangerous: {
    enableCacheInterception: false,
  },
};

module.exports = config;



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
