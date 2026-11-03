import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { Role } from "./role.entity";
import { User } from "./user.entity";

@Entity({ name: SCHEMA_NAMES.USER_ROLES })
@Unique(["user_id", "role_id"])
export class UserRole extends BaseAuditEntity {
  @Column({ name: "user_id", type: "uuid" })
  user_id!: string;

  @Column({ name: "role_id", type: "uuid" })
  role_id!: string;

  @ManyToOne(() => User, (user) => user.user_roles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user?: User;

  @ManyToOne(() => Role, (role) => role.user_roles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role?: Role;
}
