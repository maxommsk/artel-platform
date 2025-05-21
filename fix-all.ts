import { promises as fs } from 'fs';
import path from 'path';

const PROJECT_DIR = process.cwd();
const TARGET_EXTENSIONS = ['.ts', '.tsx'];

// Замены: [что_исправить, на_что_заменить]
const replacements: [RegExp, string][] = [
  [/\bquery<[^>]+>\(/g, 'prepare('],
  [/\bdb\.query<[^>]+>\(/g, 'db.prepare('],
  [/\.query<[^>]+>\(/g, '.prepare('],
  [/\.query\(/g, '.prepare('],
  [/\.all<[^>]+>\(\)/g, '.all()'],
  [/\.all\(\)/g, '.all()'],
  [/\.execute\(/g, '.run('],
  [/\bacceleratedTermMonths\b/g, 'accelerationMonths'], // или нужное имя
  [/const\s+\w+\s*=\s*await\s+getCurrentUser\(\);?/g, 'const user = await getCurrentUser();'],
];

async function walk(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir);
  const result: string[] = [];

  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = await fs.stat(filepath);
    if (stat.isDirectory()) {
      result.push(...await walk(filepath));
    } else if (TARGET_EXTENSIONS.includes(path.extname(file))) {
      result.push(filepath);
    }
  }

  return result;
}

async function main() {
  const files = await walk(PROJECT_DIR);
  for (const file of files) {
    let content = await fs.readFile(file, 'utf-8');
    let changed = false;

    for (const [pattern, replacement] of replacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        changed = true;
      }
    }

    if (changed) {
      await fs.writeFile(file, content);
      console.log(`🛠 Исправлено: ${file}`);
    }
  }
}

main().catch(console.error);
