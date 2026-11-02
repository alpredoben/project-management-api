import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { ProjectType } from "./projectType.entity";
import { ProjectStatus } from "./projectStatus.entity";
import { User } from "./user.entity";

@Entity({ name: SCHEMA_NAMES.PROJECTS })
export class Project extends BaseAuditEntity {
  @Column({ name: "project_type_id", type: "uuid", nullable: true })
  project_type_id?: string | null;

  @ManyToOne(() => ProjectType, { nullable: true })
  @JoinColumn({ name: "project_type_id" })
  project_type?: ProjectType | null;

  @Column({ name: "project_status_id", type: "uuid", nullable: true })
  project_status_id?: string | null;

  @ManyToOne(() => ProjectStatus, { nullable: true })
  @JoinColumn({ name: "project_status_id" })
  project_status?: ProjectStatus | null;

  @Column({ type: "varchar", length: 50, unique: true })
  project_code!: string;

  @Column({ type: "varchar", length: 200 })
  project_name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ name: "owner_id", type: "uuid", nullable: true })
  owner_id?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "owner_id" })
  owner?: User | null;

  @Column({ name: "parent_id", type: "uuid", nullable: true })
  parent_id?: string | null;

  @ManyToOne(() => Project, (project) => project.childrens, {
    nullable: true,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "parent_id" })
  parent?: Project | null;

  @OneToMany(() => Project, (project) => project.parent)
  childrens?: Project[];

  @Column({ type: "int", default: 0 })
  max_contributors!: number;

  @Column({ type: "date", nullable: true })
  start_date?: Date | null;

  @Column({ type: "date", nullable: true })
  end_date?: Date | null;
}
