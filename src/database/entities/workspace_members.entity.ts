import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { User } from './user.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';
import { Workspace } from './workspace.entity';
import { Position } from './position.entity';


@Entity({name: SCHEMA_NAMES.WORKSPACE_MEMBERS})
export class WorkspaceMember extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspace_id!: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Workspace;

  @Column({ name: 'user_id', type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'position_id', type: 'uuid', nullable: true })
  position_id!: string | null;

  @ManyToOne(() => Position, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'position_id' })
  position!: Position | null;

  @Column({ name: 'joined_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  joined_at!: Date;
}