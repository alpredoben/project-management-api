import { Column, Entity } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.NOTIFICATIONS })
export class Notification extends BaseAuditEntity {
  @Column({ name: "sender_user_id", type: "uuid", nullable: true })
  sender_user_id?: string | null;

  @Column({ name: "recipient_user_id", type: "uuid" })
  recipient_user_id!: string;

  @Column({ name: "notification_type", type: "varchar", length: 100 })
  notification_type!: string;

  @Column({ type: "varchar", length: 10, default: "NORMAL" })
  priority!: string;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "text", nullable: true })
  message?: string | null;

  @Column({ type: "text", nullable: true })
  action_url?: string | null;

  @Column({ type: "jsonb", default: () => ({}) })
  data!: Record<string, any>;

  @Column({ name: "target_name", type: "varchar", length: 30, nullable: true })
  target_name?: string | null;

  @Column({ name: "target_reference_id", type: "uuid", nullable: true })
  target_reference_id?: string | null;

  @Column({ name: "dedup_key", type: "varchar", length: 200, nullable: true })
  dedup_key?: string | null;

  @Column({
    name: "notif_status",
    type: "varchar",
    length: 20,
    default: "PENDING",
  })
  notif_status!: string;

  @Column({ name: "sent_at", type: "timestamp", nullable: true })
  sent_at?: Date | null;

  @Column({ name: "read_at", type: "timestamp", nullable: true })
  read_at?: Date | null;

  @Column({ name: "archived_at", type: "timestamp", nullable: true })
  archived_at?: Date | null;

  @Column({ name: "expires_at", type: "timestamp", nullable: true })
  expires_at?: Date | null;
}
