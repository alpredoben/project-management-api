import { Column, Entity, OneToMany } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { RoleMenuPermission } from "./roleMenuPermission.entity";
import { RolePermission } from "./rolePermission.entity";

@Entity({ name: SCHEMA_NAMES.PERMISSIONS })
export class Permission extends BaseAuditEntity {
  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug!: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  role_permissions?: RolePermission[];

  @OneToMany(
    () => RoleMenuPermission,
    (roleMenuPermission) => roleMenuPermission.permission,
  )
  role_menu_permissions?: RoleMenuPermission[];
}
