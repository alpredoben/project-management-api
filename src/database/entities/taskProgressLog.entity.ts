import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { Task } from "./tasks.entity";
import { User } from "./user.entity";
import { TaskLike } from "./taskLike.entity";

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

  @ManyToOne(() => Task, (task) => task.progress_logs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task?: Task;

  @ManyToOne(() => User, (user) => user.task_progress_logs, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "member_id" })
  member?: User;

  @OneToMany(() => TaskLike, (like) => like.progress_log)
  likes?: TaskLike[];
}
