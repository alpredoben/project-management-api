import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column } from 'typeorm';

export abstract class AuditBaseEntity {
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdBy!: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
    updatedBy!: string;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
    deletedAt!: Date;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
    deletedBy!: string;
}