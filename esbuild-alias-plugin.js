// esbuild-alias-plugin.js
module.exports = {
  name: 'alias-resolver',
  setup(build) {
    // Перехватываем запросы к проблемным модулям до того, как esbuild попытается их обработать
    build.onResolve({ filter: /^next\/dist\/compiled\/(ws|edge-runtime)$/ }, args => {
      console.log(`Intercepted request for ${args.path}`);
      // Возвращаем пустой внешний модуль
      return { path: args.path, external: true };
    });
  }
};

