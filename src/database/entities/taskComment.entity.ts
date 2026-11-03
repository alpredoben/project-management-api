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

@Entity({ name: SCHEMA_NAMES.TASK_COMMENTS })
@Unique(["id", "task_id"])
export class TaskComment extends BaseAuditEntity {
  @Column({ name: "task_id", type: "uuid" })
  task_id!: string;

  @Column({ name: "member_id", type: "uuid" })
  member_id!: string;

  @Column({ name: "parent_comment_id", type: "uuid", nullable: true })
  parent_comment_id?: string | null;

  @Column({ type: "varchar", length: 20, default: "comment" })
  comment_type!: string;

  @Column({ type: "text" })
  content!: string;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task?: Task;

  @ManyToOne(() => User, (user) => user.task_comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "member_id" })
  member?: User;

  @ManyToOne(() => TaskComment, (comment) => comment.replies, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parent_comment_id" })
  parent_comment?: TaskComment | null;

  @OneToMany(() => TaskComment, (comment) => comment.parent_comment)
  replies?: TaskComment[];

  @OneToMany(() => TaskLike, (like) => like.comment)
  likes?: TaskLike[];
}
