import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.TASK_LIKES })
export class TaskLike {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "task_id", type: "uuid" })
  task_id!: string;

  @Column({ name: "member_id", type: "uuid" })
  member_id!: string;

  @Column({ name: "comment_id", type: "uuid", nullable: true })
  comment_id?: string | null;

  @Column({ name: "progress_log_id", type: "uuid", nullable: true })
  progress_log_id?: string | null;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at!: Date;
}
