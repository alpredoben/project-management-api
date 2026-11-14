import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AuditBaseEntity } from './base.entity';
import { SCHEMA_NAMES } from '../../shared/constants/schemaNames';

@Entity({name: SCHEMA_NAMES.POSITIONS})
export class Position extends AuditBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  slug!: string;
}
