import { Column, Entity, Unique } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.TASK_COMMENTS })
@Unique(["id", "task_id"])
export class TaskComment extends BaseAuditEntity {
  @Column({ name: "task_id", type: "uuid" })
  task_id!: string;

  @Column({ name: "member_id", type: "uuid" })
  member_id!: string;

  @Column({ name: "parent_comment_id", type: "uuid", nullable: true })
  parent_comment_id?: string | null;

  @Column({ type: "varchar", length: 20, default: "comment" })
  comment_type!: string;

  @Column({ type: "text" })
  content!: string;
}
