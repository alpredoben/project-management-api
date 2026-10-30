import { Column, Entity, Unique } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.TASKS })
@Unique(["id", "project_id"])
export class Task extends BaseAuditEntity {
  @Column({ name: "project_id", type: "uuid" })
  project_id!: string;

  @Column({ name: "task_type_id", type: "uuid", nullable: true })
  task_type_id?: string | null;

  @Column({ name: "task_status_id", type: "uuid", nullable: true })
  task_status_id?: string | null;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ type: "date", nullable: true })
  start_date?: Date | null;

  @Column({ type: "date", nullable: true })
  end_date?: Date | null;

  @Column({ type: "boolean", default: false })
  has_problem!: boolean;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @Column({ name: "user_pic_id", type: "uuid", nullable: true })
  user_pic_id?: string | null;
}
