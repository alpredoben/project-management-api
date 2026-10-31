import { IsNull } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Menu } from "../../database/entities/menu.entity";
import { Permission } from "../../database/entities/permission.entity";
import { Role } from "../../database/entities/role.entity";
import { RoleMenuPermission } from "../../database/entities/roleMenuPermission.entity";
import { User } from "../../database/entities/user.entity";
import { UserRole } from "../../database/entities/userRole.entity";
import { In_AUTH_UserProfile } from "../../interfaces/auth.interface";

export class AuthRepository {
  private get repoUser() {
    return OpenDataSource.getRepository(User);
  }

  public findByEmail(email: string): Promise<User | null> {
    return this.repoUser
      .createQueryBuilder("user")
      .where("LOWER(user.email) = :email", { email: email.toLowerCase() })
      .getOne();
  }

  public findActiveById(id: string): Promise<User | null> {
    return this.repoUser.findOne({
      where: { id, is_active: true, deleted_at: IsNull() },
    });
  }

  public async findRoles(
    userId: string,
  ): Promise<In_AUTH_UserProfile["roles"]> {
    const rows = await OpenDataSource.getRepository(UserRole)
      .createQueryBuilder("userRole")
      .innerJoin(
        Role,
        "role",
        "role.id = userRole.role_id AND role.deleted_at IS NULL",
      )
      .select("role.id", "id")
      .addSelect("role.name", "name")
      .addSelect("role.slug", "slug")
      .where("userRole.user_id = :userId", { userId })
      .andWhere("userRole.deleted_at IS NULL")
      .getRawMany<{ id: string; name: string; slug: string | null }>();

    return rows.map(({ id, name, slug }) => ({ id, name, slug }));
  }

  public async findRoleMenuPermissions(
    userId: string,
  ): Promise<In_AUTH_UserProfile["role_menu_permissions"]> {
    const rows = await OpenDataSource.getRepository(UserRole)
      .createQueryBuilder("userRole")
      .innerJoin(
        Role,
        "role",
        "role.id = userRole.role_id AND role.deleted_at IS NULL",
      )
      .innerJoin(
        RoleMenuPermission,
        "roleMenuPermission",
        "roleMenuPermission.role_id = userRole.role_id AND roleMenuPermission.deleted_at IS NULL",
      )
      .innerJoin(
        Menu,
        "menu",
        "menu.id = roleMenuPermission.menu_id AND menu.deleted_at IS NULL",
      )
      .innerJoin(
        Permission,
        "permission",
        "permission.id = roleMenuPermission.permission_id AND permission.deleted_at IS NULL",
      )
      .select("permission.id", "permission_id")
      .addSelect("permission.name", "permission_name")
      .addSelect("permission.slug", "permission_slug")
      .addSelect("menu.id", "menu_id")
      .addSelect("menu.name", "menu_name")
      .addSelect("menu.slug", "menu_slug")
      .addSelect("menu.path", "menu_path")
      .addSelect("menu.icon", "menu_icon")
      .addSelect("menu.parent_id", "menu_parent_id")
      .addSelect("menu.order_number", "menu_order_number")
      .where("userRole.user_id = :userId", { userId })
      .andWhere("userRole.deleted_at IS NULL")
      .orderBy("menu.order_number", "ASC")
      .addOrderBy("permission.id", "ASC")
      .getRawMany<{
        permission_id: string;
        permission_name: string;
        permission_slug: string;
        menu_id: string;
        menu_created_at: Date;
        menu_created_by: string | null;
        menu_updated_at: Date;
        menu_updated_by: string | null;
        menu_deleted_at: Date | null;
        menu_deleted_by: string | null;
        menu_name: string;
        menu_slug: string;
        menu_path: string;
        menu_icon: string | null;
        menu_parent_id: string | null;
        menu_order_number: number;
      }>();

    const row = rows[0];
    if (!row) {
      return [];
    }

    return [
      {
        permission: {
          id: row.permission_id,
          name: row.permission_name,
          slug: row.permission_slug,
        },
        menu: {
          id: row.menu_id,
          name: row.menu_name,
          slug: row.menu_slug,
          path: row.menu_path,
          icon: row.menu_icon,
          parent_id: row.menu_parent_id,
          order_number: row.menu_order_number,
        },
      },
    ];
  }

  public async updateLogin(
    userId: string,
    refreshTokenHash: string,
    passwordHash?: string,
  ): Promise<boolean> {
    const updates: Partial<User> = {
      is_login: true,
      refresh_token: refreshTokenHash,
      last_login_at: new Date(),
    };

    if (passwordHash) {
      updates.password = passwordHash;
    }

    const result = await this.repoUser.update(
      { id: userId, is_active: true },
      updates,
    );
    return result.affected === 1;
  }

  public async rotateRefreshToken(
    userId: string,
    previousHash: string,
    nextHash: string,
  ): Promise<boolean> {
    const result = await this.repoUser
      .createQueryBuilder()
      .update(User)
      .set({ refresh_token: nextHash, is_login: true })
      .where({
        id: userId,
        refresh_token: previousHash,
        is_active: true,
      })
      .execute();

    return result.affected === 1;
  }

  public async logout(userId: string): Promise<void> {
    await this.repoUser.update(
      { id: userId },
      { is_login: false, refresh_token: null },
    );
  }
}

export const repository = new AuthRepository();
