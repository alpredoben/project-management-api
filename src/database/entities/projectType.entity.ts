import { Column, Entity } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.PROJECT_TYPES })
export class ProjectType extends BaseAuditEntity {
  @Column({
    name: "project_type_name",
    type: "varchar",
    length: 100,
    unique: true,
  })
  project_type_name!: string;
}
