import { Column, Entity, Unique } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.USER_ROLES })
@Unique(["user_id", "role_id"])
export class UserRole extends BaseAuditEntity {
  @Column({ name: "user_id", type: "uuid" })
  user_id!: string;

  @Column({ name: "role_id", type: "uuid" })
  role_id!: string;
}
