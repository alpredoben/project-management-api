import { Column, Entity, Unique } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.PROJECT_COLLABORATORS })
@Unique(["collaborator_id", "project_id"])
export class ProjectCollaborator extends BaseAuditEntity {
  @Column({ name: "collaborator_id", type: "uuid" })
  collaborator_id!: string;

  @Column({ name: "project_id", type: "uuid" })
  project_id!: string;

  @Column({ type: "text", nullable: true })
  notes?: string | null;
}
