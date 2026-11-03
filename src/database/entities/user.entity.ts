import { Column, Entity, OneToMany } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { Project } from "./projects.entity";
import { UserRole } from "./userRole.entity";
import { ProjectCollaborator } from "./projectCollaborator.entity";
import { Task } from "./tasks.entity";
import { TaskMember } from "./taskMember.entity";
import { TaskComment } from "./taskComment.entity";
import { TaskProgressLog } from "./taskProgressLog.entity";
import { TaskLike } from "./taskLike.entity";
import { TaskStatusHistory } from "./taskStatusHistory.entity";
import { Notification } from "./notification.entity";
import { ActivityLog } from "./activityLog.entity";
import { AttachmentFile } from "./attachmentFile.entity";

@Entity({ name: SCHEMA_NAMES.USERS })
export class User extends BaseAuditEntity {
  @Column({ type: "varchar", length: 100, nullable: true })
  name?: string | null;

  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone?: string | null;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @Column({ type: "boolean", default: false })
  is_login!: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  refresh_token?: string | null;

  @Column({ type: "text", nullable: true })
  avatar?: string | null;

  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  last_login_at?: Date | null;

  // One To Many
  @OneToMany(() => Project, (project) => project.owner)
  projects?: Project[];

  // Has Many Through: User -> UserRole -> Role
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  user_roles?: UserRole[];

  // Has Many Through: User -> ProjectCollaborator -> Project
  @OneToMany(
    () => ProjectCollaborator,
    (collaborator) => collaborator.collaborator,
  )
  project_collaborations?: ProjectCollaborator[];

  // Tasks where the user is the PIC
  @OneToMany(() => Task, (task) => task.user_pic)
  pic_tasks?: Task[];

  // Has Many Through: User -> TaskMember -> Task
  @OneToMany(() => TaskMember, (taskMember) => taskMember.member)
  task_members?: TaskMember[];

  @OneToMany(() => TaskComment, (comment) => comment.member)
  task_comments?: TaskComment[];

  @OneToMany(() => TaskProgressLog, (log) => log.member)
  task_progress_logs?: TaskProgressLog[];

  @OneToMany(() => TaskLike, (like) => like.member)
  task_likes?: TaskLike[];

  @OneToMany(() => TaskStatusHistory, (history) => history.changed_by_user)
  task_status_changes?: TaskStatusHistory[];

  @OneToMany(() => Notification, (notification) => notification.sender)
  sent_notifications?: Notification[];

  @OneToMany(() => Notification, (notification) => notification.recipient)
  received_notifications?: Notification[];

  @OneToMany(() => ActivityLog, (log) => log.actor)
  activity_logs?: ActivityLog[];

  @OneToMany(() => AttachmentFile, (file) => file.uploaded_by)
  uploaded_files?: AttachmentFile[];
}
