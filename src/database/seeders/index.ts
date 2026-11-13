import { OpenDataSource } from "../data-source";
import { rolesSeeder } from "./roles.seeder";
import { seedSuperAdmin } from "./superadmin.seeder";
import { userSeeder } from "./user.seeder";

const runSeeders = async (): Promise<void> => {
   await OpenDataSource.initialize();
  try {
    await OpenDataSource.transaction(async (manager) => {
      await rolesSeeder.seed(manager);
      await userSeeder.seed(manager);
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
