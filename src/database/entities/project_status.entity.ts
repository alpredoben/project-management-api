import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';


@Entity({name: SCHEMA_NAMES.PROJECT_STATUS})
@Index(['sequenceOrder'])
export class ProjectStatus extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  name!: string;

  @Column({ name: 'color_code', type: 'varchar', length: 7, default: '#FFFFFF' })
  colorCode!: string;

  @Column({ name: 'sequence_order', type: 'int', default: 0 })
  sequenceOrder!: number;
}