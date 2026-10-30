import { Column, Entity } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.TASK_STATUS_HISTORIES })
export class TaskStatusHistory extends BaseAuditEntity {
  @Column({ name: "task_id", type: "uuid" })
  task_id!: string;

  @Column({ name: "from_status_id", type: "uuid", nullable: true })
  from_status_id?: string | null;

  @Column({ name: "to_status_id", type: "uuid" })
  to_status_id!: string;

  @Column({ name: "changed_by", type: "uuid" })
  changed_by!: string;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @Column({
    name: "changed_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  changed_at!: Date;
}
