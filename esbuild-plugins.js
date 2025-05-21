module.exports = [
  {
    name: 'alias-resolver',
    setup(build) {
      // Обработка проблемных модулей
      build.onResolve({ filter: /^next\/dist\/compiled\/ws$/ }, () => {
        return { path: require.resolve('./src/mocks/ws.js'), external: true };
      });
      
      build.onResolve({ filter: /^next\/dist\/compiled\/edge-runtime$/ }, () => {
        return { path: require.resolve('./src/mocks/edge-runtime.js'), external: true };
      });
    }
  }
];

