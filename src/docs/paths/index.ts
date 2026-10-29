import fs from 'fs';
import path from 'path';

export const loadPaths = (): Record<string, any> => {
  const pathsDir = __dirname;
  const paths: Record<string, any> = {};

  const files = fs.readdirSync(pathsDir);

  files.forEach((file) => {
    // Nama file mengikuti pola "*.path.json" (contoh: auth.path.json)
    if (file.endsWith('.path.json')) {
      const filePath = path.join(pathsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(fileContent);

      Object.assign(paths, parsed);
    }
  });

  return paths;
};
