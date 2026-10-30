import { Column, Entity } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.PROJECT_STATUS })
export class ProjectStatus extends BaseAuditEntity {
  @Column({
    name: "project_status_name",
    type: "varchar",
    length: 100,
    unique: true,
  })
  project_status_name!: string;

  @Column({ type: "int", default: 0 })
  sort_order!: number;
}
