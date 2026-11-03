import { Column, Entity, OneToMany } from "typeorm";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";
import { BaseAuditEntity } from "./base.entity";
import { Task } from "./tasks.entity";
import { TaskStatusHistory } from "./taskStatusHistory.entity";

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

  @OneToMany(() => Task, (task) => task.task_status)
  tasks?: Task[];

  @OneToMany(() => TaskStatusHistory, (history) => history.from_status)
  histories_from?: TaskStatusHistory[];

  @OneToMany(() => TaskStatusHistory, (history) => history.to_status)
  histories_to?: TaskStatusHistory[];
}
