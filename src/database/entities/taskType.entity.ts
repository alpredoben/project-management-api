import { Column, Entity } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.TASK_TYPES })
export class TaskType extends BaseAuditEntity {
  @Column({
    name: "type_name",
    type: "varchar",
    length: 100,
    unique: true,
  })
  type_name!: string;

  @Column({ type: "int", default: 0, unique: true })
  sort_order!: number;
}
