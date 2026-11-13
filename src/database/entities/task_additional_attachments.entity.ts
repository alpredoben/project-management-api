import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { Task } from './task.entity';
import { User } from './user.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';

@Entity({name: SCHEMA_NAMES.TASK_ADDITIONAL_ATTACHMENTS})
@Index(['taskId'])
export class TaskAdditionalAttachment extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId!: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: false })
  fileName!: string;

  @Column({ name: 'file_url', type: 'text', nullable: false })
  fileUrl!: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize!: number;

  @Column({ name: 'file_type', type: 'varchar', length: 100, nullable: true })
  fileType!: string;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedById!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy!: User;
}