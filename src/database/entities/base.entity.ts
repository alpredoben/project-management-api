import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column } from 'typeorm';

export abstract class AuditBaseEntity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
    created_by!: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
    updated_by!: string;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
    deleted_at!: Date;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
    deleted_by!: string;
}