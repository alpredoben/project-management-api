import { TableColumnOptions, TableForeignKeyOptions } from "typeorm";

/** UUID PRIMARY KEY DEFAULT gen_random_uuid() */
export const uuidPk = (): TableColumnOptions => ({
  name: "id",
  type: "uuid",
  isPrimary: true,
  default: "gen_random_uuid()",
});

/** UUID FOREIGN KEY NOT NULL, EXCEPT isNullable = true */
export const uuidCol = (
  name: string,
  isNullable = false,
): TableColumnOptions => ({
  name,
  type: "uuid",
  isNullable,
});

/** created_at/by, updated_at/by, deleted_at/by */
export const auditColumns = (): TableColumnOptions[] => [
  { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
  { name: "created_by", type: "varchar", length: "200", isNullable: true },
  { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
  { name: "updated_by", type: "varchar", length: "200", isNullable: true },
  { name: "deleted_at", type: "timestamp", isNullable: true },
  { name: "deleted_by", type: "varchar", length: "200", isNullable: true },
];

/** Kolom standar tabel lookup: id, <nama> UNIQUE, [sort_order], audit */
export const lookupColumns = (
  nameColumn: string,
  withSortOrder = false,
): TableColumnOptions[] => [
  uuidPk(),
  { name: nameColumn, type: "varchar", length: "100", isUnique: true },
  ...(withSortOrder
    ? [{ name: "sort_order", type: "int", default: 0 } as TableColumnOptions]
    : []),
  ...auditColumns(),
];

/** Foreign key (mendukung composite). Default onDelete = NO ACTION seperti SQL asli. */
export const fk = (
  name: string,
  columnNames: string[],
  referencedTableName: string,
  referencedColumnNames: string[] = ["id"],
  onDelete?: "CASCADE" | "RESTRICT" | "SET NULL",
): TableForeignKeyOptions => ({
  name,
  columnNames,
  referencedTableName,
  referencedColumnNames,
  ...(onDelete ? { onDelete } : {}),
});
