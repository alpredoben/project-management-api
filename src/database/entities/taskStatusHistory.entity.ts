import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { Task } from "./tasks.entity";
import { TaskStatus } from "./taskStatus.entity";
import { User } from "./user.entity";

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

  @ManyToOne(() => Task, (task) => task.status_histories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "task_id" })
  task?: Task;

  @ManyToOne(() => TaskStatus, (status) => status.histories_from, {
    nullable: true,
  })
  @JoinColumn({ name: "from_status_id" })
  from_status?: TaskStatus | null;

  @ManyToOne(() => TaskStatus, (status) => status.histories_to)
  @JoinColumn({ name: "to_status_id" })
  to_status?: TaskStatus;

  @ManyToOne(() => User, (user) => user.task_status_changes)
  @JoinColumn({ name: "changed_by" })
  changed_by_user?: User;
}
