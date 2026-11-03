import { randomUUID } from "crypto";
import { EntityManager } from "typeorm";
import { Permission } from "../entities/permission.entity";
import { Role } from "../entities/role.entity";
import { RolePermission } from "../entities/rolePermission.entity";
import { User } from "../entities/user.entity";
import { UserRole } from "../entities/userRole.entity";
import { PasswordUtil } from "../../shared/utils/password.util";

const requiredSeedValue = (key: string): string => {
  const value = process.env[key];
  if (!value?.trim()) {
    throw new Error(
      `Missing required environment variable ${key} for the admin seeder.`,
    );
  }
  return value;
};

export class UsersSeeder {
  public async seed(
    manager: EntityManager,
    roles: Role[],
    permissions: Permission[],
  ): Promise<User> {
    const email = requiredSeedValue("SEED_ADMIN_EMAIL").trim().toLowerCase();
    const password = requiredSeedValue("SEED_ADMIN_PASSWORD");
    if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(
        "SEED_ADMIN_EMAIL must be a valid email address no longer than 100 characters.",
      );
    }
    if (Buffer.byteLength(password, "utf8") < 12) {
      throw new Error("SEED_ADMIN_PASSWORD must contain at least 12 bytes.");
    }
    if (Buffer.byteLength(password, "utf8") > 72) {
      throw new Error("SEED_ADMIN_PASSWORD must not exceed 72 bytes.");
    }

    const userRepository = manager.getRepository(User);
    const existing = await userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
    if (existing?.deleted_at) {
      throw new Error(
        `Admin account ${email} is soft-deleted; restore it before seeding.`,
      );
    }

    const user =
      existing ??
      userRepository.create({
        id: randomUUID(),
        name: "Super Admin",
        email,
        password: await PasswordUtil.hashPassword(password),
        is_active: true,
        is_login: false,
        refresh_token: null,
        avatar: null,
        last_login_at: null,
        created_by: "database-seeder",
        updated_by: "database-seeder",
      });
    const savedUser = await userRepository.save(user);

    const superAdminRole = roles.find(
      ({ slug }) => slug === "super-admin",
    );
    if (!superAdminRole) {
      throw new Error("Super Admin role is missing from the role seed data.");
    }

    await this.ensureUserRole(manager, savedUser.id, superAdminRole.id);
    await this.ensureRolePermissions(
      manager,
      superAdminRole.id,
      permissions.map(({ id }) => id),
    );

    return savedUser;
  }

  private async ensureUserRole(
    manager: EntityManager,
    userId: string,
    roleId: string,
  ): Promise<void> {
    const repository = manager.getRepository(UserRole);
    const existing = await repository.findOne({
      where: { user_id: userId, role_id: roleId },
      withDeleted: true,
    });
    if (existing && !existing.deleted_at) {
      return;
    }

    await repository.save(
      repository.create({
        ...existing,
        id: existing?.id ?? randomUUID(),
        user_id: userId,
        role_id: roleId,
        created_by: existing?.created_by ?? "database-seeder",
        updated_by: "database-seeder",
        deleted_at: null,
        deleted_by: null,
      }),
    );
  }

  private async ensureRolePermissions(
    manager: EntityManager,
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    const repository = manager.getRepository(RolePermission);
    const existing = await repository.find({
      where: { role_id: roleId },
      withDeleted: true,
    });
    const existingByPermission = new Map(
      existing.map((assignment) => [assignment.permission_id, assignment]),
    );
    const assignments = permissionIds
      .map((permissionId) => {
        const assignment = existingByPermission.get(permissionId);
        if (assignment && !assignment.deleted_at) {
          return null;
        }
        return repository.create({
          ...assignment,
          id: assignment?.id ?? randomUUID(),
          role_id: roleId,
          permission_id: permissionId,
          created_by: assignment?.created_by ?? "database-seeder",
          updated_by: "database-seeder",
          deleted_at: null,
          deleted_by: null,
        });
      })
      .filter((assignment): assignment is RolePermission => assignment !== null);

    if (assignments.length > 0) {
      await repository.save(assignments);
    }
  }
}

export const usersSeeder = new UsersSeeder();
