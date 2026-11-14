import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';
import { Project } from './project.entity';


@Entity({name: SCHEMA_NAMES.WORKSPACES})
@Index(['slug'])
export class Workspace extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  slug!: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logo_url!: string | null;

  @OneToMany(() => Project, (project) => project.workspace)
  projects!: Project[];
}