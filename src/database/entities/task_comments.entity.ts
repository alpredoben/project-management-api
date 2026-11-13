import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { Task } from './task.entity';
import { User } from './user.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';


@Entity({name: SCHEMA_NAMES.TASK_COMMENTS})
@Index(['taskId'])
@Index(['parentCommentId'])
@Index(['userId'])
export class TaskComment extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId!: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @Column({ name: 'parent_comment_id', type: 'uuid', nullable: true })
  parentCommentId!: string;

  @ManyToOne(() => TaskComment, (comment) => comment.replies, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment!: TaskComment;

  @OneToMany(() => TaskComment, (comment) => comment.parentComment)
  replies!: TaskComment[];

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text', nullable: false })
  content!: string;
}