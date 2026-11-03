import { OpenDataSource } from "../data-source";
import { Permission } from "../entities/permission.entity";
import { permissionsSeeder } from "./permissions.seeder";
import { rolesSeeder } from "./roles.seeder";
import { usersSeeder } from "./users.seeder";

const runSeeders = async (): Promise<void> => {
  await OpenDataSource.initialize();
  try {
    await OpenDataSource.transaction(async (manager) => {
      const roles = await rolesSeeder.seed(manager);
      await permissionsSeeder.seed(manager);
      const permissions = await manager.getRepository(Permission).find();
      await usersSeeder.seed(manager, roles, permissions);
    });
    console.info("Database seeders completed successfully.");
  } finally {
    await OpenDataSource.destroy();
  }
};

runSeeders().catch((error: unknown) => {
  console.error("Database seeding failed.", error);
  process.exitCode = 1;
});
