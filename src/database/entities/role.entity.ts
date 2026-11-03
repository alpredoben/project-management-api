import { Column, Entity, OneToMany } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { RoleMenuPermission } from "./roleMenuPermission.entity";
import { RolePermission } from "./rolePermission.entity";
import { UserRole } from "./userRole.entity";

@Entity({ name: SCHEMA_NAMES.ROLES })
export class Role extends BaseAuditEntity {
  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  slug!: string | null;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  user_roles?: UserRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  role_permissions?: RolePermission[];

  @OneToMany(
    () => RoleMenuPermission,
    (roleMenuPermission) => roleMenuPermission.role,
  )
  role_menu_permissions?: RoleMenuPermission[];
}
