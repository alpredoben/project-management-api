import { Column, Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { Task } from "./tasks.entity";
import { User } from "./user.entity";

@Entity({ name: SCHEMA_NAMES.TASK_MEMBERS })
@Unique(["task_id", "member_id"])
export class TaskMember extends BaseAuditEntity {
  @Column({ name: "task_id", type: "uuid" })
  task_id!: string;

  @Column({ name: "member_id", type: "uuid" })
  member_id!: string;

  @Column({ type: "boolean", default: false })
  is_pic!: boolean;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @ManyToOne(() => Task, (task) => task.members, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task?: Task;

  @ManyToOne(() => User, (user) => user.task_members, { onDelete: "CASCADE" })
  @JoinColumn({ name: "member_id" })
  member?: User;
}
