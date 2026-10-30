import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { lookupColumns } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class TaskStatus1793293870295 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.TASK_STATUS,
        columns: lookupColumns("task_status_name", true),
      }),
      true,
    );

    // Seed status task sesuai kebutuhan
    await q.query(`
      INSERT INTO ${SCHEMA_NAMES.TASK_STATUS} (task_status_name, sort_order) VALUES
        ('backlog',     1),
        ('to do',       2),
        ('in progress', 3),
        ('in review',   4),
        ('done',        5),
        ('problem',     6),
        ('rollback',    7),
        ('canceled',    8)
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.TASK_STATUS, true, true, true);
  }
}
