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
import { Project } from "./projects.entity";
import { TaskType } from "./taskType.entity";
import { TaskStatus } from "./taskStatus.entity";
import { User } from "./user.entity";
import { TaskMember } from "./taskMember.entity";
import { TaskComment } from "./taskComment.entity";
import { TaskProgressLog } from "./taskProgressLog.entity";
import { TaskLike } from "./taskLike.entity";
import { TaskStatusHistory } from "./taskStatusHistory.entity";
import { ActivityLog } from "./activityLog.entity";

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

  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "project_id" })
  project?: Project;

  @ManyToOne(() => TaskType, (type) => type.tasks, { nullable: true })
  @JoinColumn({ name: "task_type_id" })
  task_type?: TaskType | null;

  @ManyToOne(() => TaskStatus, (status) => status.tasks, { nullable: true })
  @JoinColumn({ name: "task_status_id" })
  task_status?: TaskStatus | null;

  @ManyToOne(() => User, (user) => user.pic_tasks, { nullable: true })
  @JoinColumn({ name: "user_pic_id" })
  user_pic?: User | null;

  // Has Many Through: Task -> TaskMember -> User
  @OneToMany(() => TaskMember, (member) => member.task)
  members?: TaskMember[];

  @OneToMany(() => TaskComment, (comment) => comment.task)
  comments?: TaskComment[];

  @OneToMany(() => TaskProgressLog, (log) => log.task)
  progress_logs?: TaskProgressLog[];

  @OneToMany(() => TaskLike, (like) => like.task)
  likes?: TaskLike[];

  @OneToMany(() => TaskStatusHistory, (history) => history.task)
  status_histories?: TaskStatusHistory[];

  @OneToMany(() => ActivityLog, (log) => log.task)
  activity_logs?: ActivityLog[];
}
