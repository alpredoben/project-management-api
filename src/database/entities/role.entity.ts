import { Column, Entity } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.ROLES })
export class Role extends BaseAuditEntity {
  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  slug?: string | null;

  @Column({ type: "text", nullable: true })
  description?: string | null;
}
