import { Column, Entity } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.ACTIVITY_LOGS })
export class ActivityLog extends BaseAuditEntity {
  @Column({ name: "actor_user_id", type: "uuid", nullable: true })
  actor_user_id?: string | null;

  @Column({
    name: "actor_name",
    type: "varchar",
    length: 200,
    default: "system",
  })
  actor_name!: string;

  @Column({ type: "varchar", length: 30 })
  action!: string;

  @Column({ name: "entity_type", type: "varchar", length: 30 })
  entity_type!: string;

  @Column({ name: "entity_id", type: "uuid", nullable: true })
  entity_id?: string | null;

  @Column({
    name: "reference_type",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  reference_type?: string | null;

  @Column({ name: "reference_id", type: "uuid", nullable: true })
  reference_id?: string | null;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ name: "old_values", type: "jsonb", nullable: true })
  old_values?: Record<string, any> | null;

  @Column({ name: "new_values", type: "jsonb", nullable: true })
  new_values?: Record<string, any> | null;

  @Column({ type: "jsonb", default: () => ({}) })
  metadata!: Record<string, any>;

  @Column({ type: "varchar", length: 20, default: "WEB" })
  source!: string;

  @Column({ name: "request_id", type: "varchar", length: 100, nullable: true })
  request_id?: string | null;

  @Column({ name: "ip_address", type: "inet", nullable: true })
  ip_address?: string | null;

  @Column({ name: "user_agent", type: "text", nullable: true })
  user_agent?: string | null;

  @Column({
    name: "occurred_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  occurred_at!: Date;
}
