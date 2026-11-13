
import { EntityManager } from "typeorm";
import { Role } from "../entities/role.entity";
import { createSlug } from "../../shared/utils/helper";
import { User } from "../entities/user.entity";
import { Permission } from "../entities/permission.entity";
import { PasswordUtil } from "../../shared/utils/password.util";

const userAccount = {
  name: "Super Administrator",
  email: "superadmin@system.com",
  password: "password123",
  isActive: true,
  roleName: "Super Admin",
};

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

const modules = [
  "role",
  "permission",
  "user",
  "milestone",
  "workspace",
  "project",
  "task",
  "report",
  "dashboard",
  "settings",
  "milestones",
];

export class UserSeeder {
  public async seed(manager: EntityManager): Promise<void> {
    const repoUser = manager.getRepository(User);
    const repoPermission = manager.getRepository(Permission);
    const repoRole = manager.getRepository(Role);
    const createdPermissions: Permission[] = [];

    for (const module of modules) {
      for (const action of actions) {
        const permissionName = `${module}:${action}`;

        let permission = await repoPermission.findOne({
          where: { name: permissionName },
        });

        if (!permission) {
          permission = repoPermission.create({
            name: permissionName,
            module: module,
            description: `Permission to ${action} in ${module}`,
          });
          await repoPermission.save(permission);
        }
        createdPermissions.push(permission);
      }
    }

    console.log("📌 Menyiapkan role Super Admin...");
    let superAdminRole = await repoRole.findOne({
      where: { name: userAccount.roleName },
      relations: ["permissions"],
    });

    if (!superAdminRole) {
      const roleName: string = "Super Admin";
      superAdminRole = repoRole.create({
        name: roleName,
        slug: createSlug(roleName),
        description: "Administrator utama dengan akses penuh ke seluruh sistem",
        permissions: createdPermissions, // Berikan semua permissions
      });
    } else {
      superAdminRole.permissions = createdPermissions;
    }

    await repoRole.save(superAdminRole);
    console.log(
      "✅ Role Super Admin berhasil disimpan dengan seluruh permissions.",
    );

    console.log("📌 Menyiapkan akun pengguna Super Admin...");
    let superAdminUser = await repoUser.findOne({
      where: { email: userAccount.email },
      relations: ["roles"],
    });

    const hashedPassword = await PasswordUtil.hashPassword(
      userAccount.password,
    );

    if (!superAdminUser) {
      superAdminUser = repoUser.create({
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

    await repoUser.save(superAdminUser);
    console.log(`✅ Akun Super Admin berhasil dibuat/diperbarui!`);
    console.log(`   📧 Email    : ${userAccount.email}`);
    console.log(`   🔑 Password : ${hashedPassword}`);
    console.log("🎉 Seeding selesai dengan sukses!");
  }
}

export const userSeeder = new UserSeeder();
