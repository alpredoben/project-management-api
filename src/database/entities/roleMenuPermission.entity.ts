import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { Menu } from "./menu.entity";
import { Permission } from "./permission.entity";
import { Role } from "./role.entity";

@Entity({ name: SCHEMA_NAMES.ROLE_MENU_PERMISSIONS })
@Unique(["role_id", "menu_id", "permission_id"])
export class RoleMenuPermission extends BaseAuditEntity {
  @Column({ name: "role_id", type: "uuid" })
  role_id!: string;

  @Column({ name: "menu_id", type: "uuid" })
  menu_id!: string;

  @Column({ name: "permission_id", type: "uuid" })
  permission_id!: string;

  @ManyToOne(() => Role, (role) => role.role_menu_permissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "role_id" })
  role?: Role;

  @ManyToOne(() => Menu, { onDelete: "CASCADE" })
  @JoinColumn({ name: "menu_id" })
  menu?: Menu;

  @ManyToOne(
    () => Permission,
    (permission) => permission.role_menu_permissions,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "permission_id" })
  permission?: Permission;
}
