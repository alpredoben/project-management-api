import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseAuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  created_by?: string | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  updated_by?: string | null;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deleted_at?: Date | null;

  @Column({
    name: 'deleted_by',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  deleted_by?: string | null;
}
