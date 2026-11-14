import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { User } from './user.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';
import { Project } from './project.entity';
import { Milestone } from './milestone.entity';
import { TaskType } from './task_type.entity';
import { TaskStatus } from './task_status.entity';

@Entity({name: SCHEMA_NAMES.TASKS})
@Index(['project_id'])
@Index(['milestone_id'])
@Index(['parentId'])
@Index(['task_status_id'])
@Index(['user_requested_id'])
@Index(['task_key'])
@Index(['due_date'])
export class Task extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'project_id', type: 'uuid' })
  project_id!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column({ name: 'milestone_id', type: 'uuid', nullable: true })
  milestone_id!: string;

  @ManyToOne(() => Milestone, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'milestone_id' })
  milestone!: Milestone;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId!: string;

  @ManyToOne(() => Task, (task) => task.sub_tasks, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent_task!: Task;

  @OneToMany(() => Task, (task) => task.parent_task)
  sub_tasks!: Task[];

  @Column({ name: 'task_type_id', type: 'uuid', nullable: true })
  task_type_id!: string;

  @ManyToOne(() => TaskType, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'task_type_id' })
  task_type!: TaskType;

  @Column({ name: 'task_status_id', type: 'uuid', nullable: true })
  task_status_id!: string;

  @ManyToOne(() => TaskStatus, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'task_status_id' })
  task_status!: TaskStatus;

  @Column({ name: 'user_requested_id', type: 'uuid', nullable: true })
  user_requested_id!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_requested_id' })
  user_requested!: User;

  @Column({ name: 'task_key', type: 'varchar', length: 50, nullable: false })
  task_key!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 50, default: 'medium' })
  priority!: string;

  @Column({ name: 'estimated_hours', type: 'numeric', precision: 5, scale: 2, default: 0.00 })
  estimatedHours!: number;

  @Column({ name: 'due_date', type: 'timestamp with time zone', nullable: true })
  due_date!: Date;

  @Column({ name: 'mom_number', type: 'varchar', length: 100, nullable: true })
  mom_number!: string;

  @Column({ name: 'mom_date', type: 'date', nullable: true })
  mom_date!: string;
}