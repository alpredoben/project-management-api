import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';

@Entity({name: SCHEMA_NAMES.ACTIVITY_LOGS})
@Index(['workspaceId'])
@Index(['userId'])
@Index(['entityType', 'entityId'])
@Index(['created_at'])
export class ActivityLog extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId!: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Workspace;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 100, nullable: false })
  action!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 50, nullable: false })
  entityType!: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: false })
  entityId!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string;
}