import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { Task } from "./tasks.entity";
import { User } from "./user.entity";
import { TaskComment } from "./taskComment.entity";
import { TaskProgressLog } from "./taskProgressLog.entity";

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

  @ManyToOne(() => Task, (task) => task.likes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task?: Task;

  @ManyToOne(() => User, (user) => user.task_likes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "member_id" })
  member?: User;

  @ManyToOne(() => TaskComment, (comment) => comment.likes, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "comment_id" })
  comment?: TaskComment | null;

  @ManyToOne(() => TaskProgressLog, (log) => log.likes, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "progress_log_id" })
  progress_log?: TaskProgressLog | null;
}
