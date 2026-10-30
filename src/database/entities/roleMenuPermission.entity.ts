import { Column, Entity, Unique } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.ROLE_MENU_PERMISSIONS })
@Unique(["role_id", "menu_id", "permission_id"])
export class RoleMenuPermission extends BaseAuditEntity {
  @Column({ name: "role_id", type: "uuid" })
  role_id!: string;

  @Column({ name: "menu_id", type: "uuid" })
  menu_id!: string;

  @Column({ name: "permission_id", type: "uuid" })
  permission_id!: string;
}
