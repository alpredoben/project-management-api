import { Column, Entity } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.ATTACHMENT_FILES })
export class AttachmentFile extends BaseAuditEntity {
  @Column({ name: "reference_id", type: "uuid" })
  reference_id!: string;

  @Column({ name: "attachment_type", type: "varchar", length: 20 })
  attachment_type!: string;

  @Column({ name: "uploaded_by_user_id", type: "uuid" })
  uploaded_by_user_id!: string;

  @Column({ name: "original_name", type: "varchar", length: 255 })
  original_name!: string;

  @Column({ name: "stored_name", type: "varchar", length: 255 })
  stored_name!: string;

  @Column({
    name: "file_extension",
    type: "varchar",
    length: 20,
    nullable: true,
  })
  file_extension?: string | null;

  @Column({
    name: "file_category",
    type: "varchar",
    length: 20,
    default: "other",
  })
  file_category!: string;

  @Column({ name: "mime_type", type: "varchar", length: 150 })
  mime_type!: string;

  @Column({ name: "file_size", type: "bigint" })
  file_size!: number;

  @Column({ name: "checksum_sha256", type: "char", length: 64 })
  checksum_sha256!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({
    name: "storage_provider",
    type: "varchar",
    length: 20,
    default: "local",
  })
  storage_provider!: string;

  @Column({
    name: "storage_bucket",
    type: "varchar",
    length: 200,
    nullable: true,
  })
  storage_bucket?: string | null;

  @Column({ name: "storage_path", type: "text" })
  storage_path!: string;

  @Column({ name: "thumbnail_path", type: "text", nullable: true })
  thumbnail_path?: string | null;

  @Column({ name: "download_count", type: "int", default: 0 })
  download_count!: number;

  @Column({ name: "last_downloaded_at", type: "timestamp", nullable: true })
  last_downloaded_at?: Date | null;
}
