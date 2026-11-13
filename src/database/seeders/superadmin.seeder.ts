import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { Permission } from "../entities/permission.entity";
import { PasswordUtil } from "../../shared/utils/password.util";
import { createSlug } from "../../shared/utils/helper";

export async function seedSuperAdmin(dataSource: DataSource): Promise<void> {
  const userAccount = {
    name: "Super Administrator",
    email: "superadmin@system.com",
    password: "password123",
    isActive: true,
    roleName: "Super Admin",
  };

  const modules = [
    "user-management",
    "workspace",
    "project",
    "task",
    "report",
    "dashboard",
    "settings",
    "milestones",
  ];

  const actions = [
    "created",
    "updated",
    "deleted",
    "viewed",
    "imported",
    "exported",
    "approved",
    "rejected",
    "assigned",
    "unassigned",
    "reported",
  ];

  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);

  console.log("🌱 Memulai proses seeding Super Admin...");

  

  console.log("📌 Membuat permissions...");
  const createdPermissions: Permission[] = [];

  for (const module of modules) {
    for (const action of actions) {
      const permissionName = `${module}:${action}`;

      let permission = await permissionRepository.findOne({
        where: { name: permissionName },
      });

      if (!permission) {
        permission = permissionRepository.create({
          name: permissionName,
          module: module,
          description: `Permission to ${action} in ${module}`,
        });
        await permissionRepository.save(permission);
      }
      createdPermissions.push(permission);
    }
  }
  console.log(
    `✅ Total ${createdPermissions.length} permissions berhasil disiapkan.`,
  );

  console.log("📌 Menyiapkan role Super Admin...");
  let superAdminRole = await roleRepository.findOne({
    where: { name: userAccount.roleName },
    relations: ["permissions"],
  });

  if (!superAdminRole) {
    const roleName: string = "Super Admin"
    superAdminRole = roleRepository.create({
      name: roleName,
      slug: createSlug(roleName),
      description: "Administrator utama dengan akses penuh ke seluruh sistem",
      permissions: createdPermissions, // Berikan semua permissions
    });
  } else {
    superAdminRole.permissions = createdPermissions;
  }
  await roleRepository.save(superAdminRole);
  console.log(
    "✅ Role Super Admin berhasil disimpan dengan seluruh permissions.",
  );

  // 4. Buat User Super Admin
  console.log("📌 Menyiapkan akun pengguna Super Admin...");
  let superAdminUser = await userRepository.findOne({
    where: { email: userAccount.email },
    relations: ["roles"],
  });

  const hashedPassword = await PasswordUtil.hashPassword(userAccount.password);


  if (!superAdminUser) {
    superAdminUser = userRepository.create({
      name: userAccount.name,
      email: userAccount.email,
      password: hashedPassword,
      passwordHash: hashedPassword,
      isActive: userAccount.isActive,
      roles: [superAdminRole],
    } as Partial<User>);
  } else {
    superAdminUser.password = hashedPassword;
    superAdminUser.isActive = userAccount.isActive;
    superAdminUser.roles = [superAdminRole];
  }

  await userRepository.save(superAdminUser);
  console.log(`✅ Akun Super Admin berhasil dibuat/diperbarui!`);
  console.log(`   📧 Email    : ${userAccount.email}`);
  console.log(`   🔑 Password : ${hashedPassword}`);
  console.log("🎉 Seeding selesai dengan sukses!");
}
