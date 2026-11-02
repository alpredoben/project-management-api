import { Column, Entity } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.TASK_STATUS })
export class TaskStatus extends BaseAuditEntity {
  @Column({
    name: "status_name",
    type: "varchar",
    length: 100,
    unique: true,
  })
  status_name!: string;

  @Column({ type: "int", default: 0 })
  sort_order!: number;
}
