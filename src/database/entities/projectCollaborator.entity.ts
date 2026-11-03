import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { User } from "./user.entity";
import { Project } from "./projects.entity";

@Entity({ name: SCHEMA_NAMES.PROJECT_COLLABORATORS })
@Unique(["collaborator_id", "project_id"])
export class ProjectCollaborator extends BaseAuditEntity {
  @Column({ name: "collaborator_id", type: "uuid" })
  collaborator_id!: string;

  @Column({ name: "project_id", type: "uuid" })
  project_id!: string;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @ManyToOne(() => User, (user) => user.project_collaborations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "collaborator_id" })
  collaborator?: User;

  @ManyToOne(() => Project, (project) => project.collaborators, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "project_id" })
  project?: Project;
}
