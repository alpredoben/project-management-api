import { Column, Entity, OneToMany } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { Project } from "./projects.entity";

@Entity({ name: SCHEMA_NAMES.PROJECT_TYPES })
export class ProjectType extends BaseAuditEntity {
  @Column({
    name: "type_name",
    type: "varchar",
    length: 100,
    unique: true,
  })
  type_name!: string;
  @Column({ type: "int", default: 0, unique: true })
  sort_order!: number;

  @OneToMany(() => Project, (project) => project.project_type)
  projects?: Project[];
}
