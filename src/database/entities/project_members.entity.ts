import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { User } from './user.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';
import { Project } from './project.entity';
import { Position } from './position.entity';


@Entity({name: SCHEMA_NAMES.PROJECT_MEMBERS})
export class ProjectMember extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'project_id', type: 'uuid' })
  project_id!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

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
}