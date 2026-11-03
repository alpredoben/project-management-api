import { Column, Entity, OneToMany } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { Project } from "./projects.entity";

@Entity({ name: SCHEMA_NAMES.PROJECT_STATUS })
export class ProjectStatus extends BaseAuditEntity {
  @Column({
    name: "status_name",
    type: "varchar",
    length: 100,
    unique: true,
  })
  status_name!: string;

  @Column({ type: "int", default: 0, unique: true })
  sort_order!: number;

  @OneToMany(() => Project, (project) => project.project_status)
  projects?: Project[];
}
