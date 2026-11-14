import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { User } from './user.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';
import { Task } from './task.entity';


@Entity({name: SCHEMA_NAMES.TASK_SCHEDULERS})
@Index(['task_id'])
@Index(['user_id'])
@Index(['start_time', 'end_time'])
export class TaskScheduler extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'task_id', type: 'uuid' })
  task_id!: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'start_time', type: 'timestamp with time zone', nullable: false })
  start_time!: Date;

  @Column({ name: 'end_time', type: 'timestamp with time zone', nullable: false })
  end_time!: Date;

  @Column({ name: 'actual_hours', type: 'numeric', precision: 5, scale: 2, default: 0.00 })
  actual_hours!: number;

  @Column({ type: 'varchar', length: 50, default: 'scheduled' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string;
}