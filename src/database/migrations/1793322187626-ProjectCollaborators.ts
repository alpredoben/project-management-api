import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { uuidPk, fk, uuidCol, auditColumns } from "../migration-helper";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

export class ProjectCollaborators1793322187626 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    // Penugasan: 1 task banyak member, 1 member banyak task
    await q.createTable(
      new Table({
        name: SCHEMA_NAMES.PROJECT_COLLABORATORS,
        columns: [
          uuidPk(),
          uuidCol("collaborator_id"),
          uuidCol("project_id"),
          { name: "notes", type: "text", isNullable: true },
          ...auditColumns(),
        ],
        uniques: [
          {
            name: "uq_project_collaborators",
            columnNames: ["collaborator_id", "project_id"],
          },
        ],
        foreignKeys: [
          fk(
            "fk_project_collaborators_project",
            ["project_id"],
            SCHEMA_NAMES.PROJECTS,
            ["id"],
            "CASCADE",
          ),
          fk(
            "fk_project_collaborators_collaborator",
            ["collaborator_id"],
            SCHEMA_NAMES.USERS,
            ["id"],
          ),
        ],
        indices: [
          {
            name: "ix_project_collaborators_collaborator",
            columnNames: ["collaborator_id"],
          },
        ],
      }),
      true,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable(SCHEMA_NAMES.PROJECT_COLLABORATORS, true, true, true);
  }
}
