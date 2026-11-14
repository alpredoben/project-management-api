import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';
import { Workspace } from './workspace.entity';
import { ProjectType } from './project_type.entity';
import { ProjectStatus } from './project_status.entity';
import { Milestone } from './milestone.entity';

@Entity({name: SCHEMA_NAMES.PROJECTS})
@Index(['workspace_id'])
@Index(['project_status_id'])
@Index(['key'])
export class Project extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspace_id!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace!: Workspace;

  @Column({ name: 'project_type_id', type: 'uuid', nullable: true })
  project_type_id!: string;

  @ManyToOne(() => ProjectType, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_type_id' })
  project_type!: ProjectType;

  @Column({ name: 'project_status_id', type: 'uuid', nullable: true })
  project_status_id!: string;

  @ManyToOne(() => ProjectStatus, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_status_id' })
  project_status!: ProjectStatus;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  key!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  start_date!: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  end_date!: string;

  @OneToMany(() => Milestone, (milestone) => milestone.project)
  milestones!: Milestone[];
}