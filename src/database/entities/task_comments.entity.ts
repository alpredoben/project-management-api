import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { Task } from './task.entity';
import { User } from './user.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';


@Entity({name: SCHEMA_NAMES.TASK_COMMENTS})
@Index(['task_id'])
@Index(['parent_comment_id'])
@Index(['user_id'])
export class TaskComment extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'task_id', type: 'uuid' })
  task_id!: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @Column({ name: 'parent_comment_id', type: 'uuid', nullable: true })
  parent_comment_id!: string;

  @ManyToOne(() => TaskComment, (comment) => comment.replies, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  parent_comment!: TaskComment;

  @OneToMany(() => TaskComment, (comment) => comment.parent_comment)
  replies!: TaskComment[];

  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text', nullable: false })
  content!: string;
}