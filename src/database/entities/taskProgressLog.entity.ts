import { Column, Entity, Unique } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.TASK_PROGRESS_LOGS })
@Unique(["id", "task_id"])
export class TaskProgressLog extends BaseAuditEntity {
  @Column({ name: "task_id", type: "uuid" })
  task_id!: string;

  @Column({ name: "member_id", type: "uuid" })
  member_id!: string;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  log_date!: Date;

  @Column({ type: "text", nullable: true })
  done_description?: string | null;

  @Column({ type: "text", nullable: true })
  planned_description?: string | null;

  @Column({ type: "smallint", nullable: true })
  progress_percent?: number | null;
}
