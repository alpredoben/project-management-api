import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { User } from './user.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';

@Entity({name: SCHEMA_NAMES.NOTIFICATIONS})
@Index(['userId', 'isRead'], { where: 'is_read = FALSE' }) // Partial Index
@Index(['createdAt'])
export class Notification extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 150, nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: false })
  message!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  type!: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId!: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;

  @Column({ name: 'read_at', type: 'timestamp with time zone', nullable: true })
  readAt!: Date;
}