import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { Project } from './project.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';


@Entity({name: SCHEMA_NAMES.MILESTONES})
@Index(['projectId'])
export class Milestone extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => Project, (project) => project.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column({ type: 'varchar', length: 150, nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate!: string;

  @Column({ type: 'varchar', length: 50, default: 'open' })
  status!: string;
}