// fix-db-query.ts
import fs from 'fs';
import path from 'path';

function processFile(filePath: string) {
  const code = fs.readFileSync(filePath, 'utf8');

  const updated = code.replace(
    /const\s+(\w+)\s*=\s*await\s+db\.query<([^>]+)>\(\s*`([^`]+)`\s*,\s*\[(.*?)\]\s*\);?/g,
    (_, varName, typeArg, sql, args) =>
      `const { results: ${varName} } = await db.prepare(\n  \`${sql.trim()}\`\n).bind(${args.trim()}).all();`
  );

  if (updated !== code) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`✔ Updated: ${filePath}`);
  }
}

function walk(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (/\.(ts|tsx)$/.test(file)) {
      processFile(full);
    }
  }
}

// Запуск с корня проекта
walk('./src');
