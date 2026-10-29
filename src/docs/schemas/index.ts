import fs from 'fs';
import path from 'path';

export const loadSchemas = (): Record<string, any> => {
  const schemasDir = __dirname;
  const schemas: Record<string, any> = {};

  const files = fs.readdirSync(schemasDir);

  files.forEach((file) => {
    if (file.endsWith('.schema.json')) {
      const filePath = path.join(schemasDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(fileContent);

      Object.assign(schemas, parsed);
    }
  });

  return schemas;
};
