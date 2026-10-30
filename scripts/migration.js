/**
 * Pembungkus untuk perintah migration TypeORM.
 *
 * Pemakaian:
 *   npm run migration:create Role
 *   npm run migration:generate Role
 *
 * File akan dibuat di ./src/database/migrations/<timestamp>-<Nama>.ts
 */
const { spawnSync } = require("node:child_process");

const MIGRATIONS_DIR = "./src/database/migrations";
const DATA_SOURCE = "./src/database/data-source.ts";

const [command, name] = process.argv.slice(2);

if (!["create", "generate"].includes(command)) {
  console.error('Perintah tidak dikenal. Gunakan "create" atau "generate".');
  process.exit(1);
}

if (!name) {
  console.error(
    `Nama migration wajib diisi. Contoh: npm run migration:${command} Role`,
  );
  process.exit(1);
}

if (!/^[A-Za-z0-9_-]+$/.test(name)) {
  console.error(
    "Nama migration hanya boleh berisi huruf, angka, underscore (_) dan strip (-).",
  );
  process.exit(1);
}

const args = ["run", "typeorm", "--", `migration:${command}`];

if (command === "generate") {
  args.push("-d", DATA_SOURCE);
}

args.push(`${MIGRATIONS_DIR}/${name}`);

const result = spawnSync("npm", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
