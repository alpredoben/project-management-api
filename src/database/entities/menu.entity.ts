import { Column, Entity } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";

@Entity({ name: SCHEMA_NAMES.MENUS })
export class Menu extends BaseAuditEntity {
  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug!: string;

  @Column({ type: "varchar", length: 255 })
  path!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  icon?: string | null;

  @Column({ name: "parent_id", type: "uuid", nullable: true })
  parent_id?: string | null;

  @Column({ type: "int", default: 0 })
  order_number!: number;
}
