import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { Task } from './task.entity';
import { User } from './user.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';

@Entity({name: SCHEMA_NAMES.TASK_ADDITIONAL_ATTACHMENTS})
@Index(['task_id'])
export class TaskAdditionalAttachment extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'task_id', type: 'uuid' })
  task_id!: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: false })
  file_name!: string;

  @Column({ name: 'file_url', type: 'text', nullable: false })
  file_url!: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  file_size!: number;

  @Column({ name: 'file_type', type: 'varchar', length: 100, nullable: true })
  file_type!: string;

  @Column({ name: 'uploaded_by_id', type: 'uuid', nullable: true })
  uploaded_by_id!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploaded_by!: User;
}