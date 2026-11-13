import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { User } from './user.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';
import { Project } from './project.entity';
import { Milestone } from './milestone.entity';
import { TaskType } from './task_type.entity';
import { TaskStatus } from './task_status.entity';

@Entity({name: SCHEMA_NAMES.TASKS})
@Index(['projectId'])
@Index(['milestoneId'])
@Index(['parentId'])
@Index(['taskStatusId'])
@Index(['userRequestedId'])
@Index(['taskKey'])
@Index(['dueDate'])
export class Task extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column({ name: 'milestone_id', type: 'uuid', nullable: true })
  milestoneId!: string;

  @ManyToOne(() => Milestone, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'milestone_id' })
  milestone!: Milestone;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId!: string;

  @ManyToOne(() => Task, (task) => task.subTasks, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parentTask!: Task;

  @OneToMany(() => Task, (task) => task.parentTask)
  subTasks!: Task[];

  @Column({ name: 'task_type_id', type: 'uuid', nullable: true })
  taskTypeId!: string;

  @ManyToOne(() => TaskType, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'task_type_id' })
  taskType!: TaskType;

  @Column({ name: 'task_status_id', type: 'uuid', nullable: true })
  taskStatusId!: string;

  @ManyToOne(() => TaskStatus, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'task_status_id' })
  taskStatus!: TaskStatus;

  @Column({ name: 'user_requested_id', type: 'uuid', nullable: true })
  userRequestedId!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_requested_id' })
  userRequested!: User;

  @Column({ name: 'task_key', type: 'varchar', length: 50, nullable: false })
  taskKey!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 50, default: 'medium' })
  priority!: string;

  @Column({ name: 'estimated_hours', type: 'numeric', precision: 5, scale: 2, default: 0.00 })
  estimatedHours!: number;

  @Column({ name: 'due_date', type: 'timestamp with time zone', nullable: true })
  dueDate!: Date;

  @Column({ name: 'mom_number', type: 'varchar', length: 100, nullable: true })
  momNumber!: string;

  @Column({ name: 'mom_date', type: 'date', nullable: true })
  momDate!: string;
}