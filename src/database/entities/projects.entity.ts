import { Column, Entity } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.PROJECTS })
export class Project extends BaseAuditEntity {
  @Column({ name: "project_type_id", type: "uuid", nullable: true })
  project_type_id?: string | null;

  @Column({ name: "project_status_id", type: "uuid", nullable: true })
  project_status_id?: string | null;

  @Column({ type: "varchar", length: 50, unique: true })
  project_code!: string;

  @Column({ type: "varchar", length: 200 })
  project_name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ name: "owner_id", type: "uuid", nullable: true })
  owner_id?: string | null;

  @Column({ name: "parent_id", type: "uuid", nullable: true })
  parent_id?: string | null;

  @Column({ type: "int", default: 0 })
  max_contributors!: number;

  @Column({ type: "date", nullable: true })
  start_date?: Date | null;

  @Column({ type: "date", nullable: true })
  end_date?: Date | null;
}
