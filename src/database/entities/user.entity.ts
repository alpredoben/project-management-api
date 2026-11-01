import { Column, Entity, Unique } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.USERS })
export class User extends BaseAuditEntity {
  @Column({ type: "varchar", length: 100, nullable: true })
  name?: string | null;

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone?: string | null;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @Column({ type: "boolean", default: false })
  is_login!: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  refresh_token?: string | null;

  @Column({ type: "text", nullable: true })
  avatar?: string | null;

  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  last_login_at?: Date | null;
}
