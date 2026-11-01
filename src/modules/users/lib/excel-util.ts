import ExcelJS from "exceljs";
import { In_DTO_UserExportRow } from "../dto";

// Excel Export
const COLUMNS: Array<Partial<ExcelJS.Column>> = [
  { header: "No.", key: "no", width: 8 },
  { header: "Name", key: "name", width: 30 },
  { header: "Email", key: "email", width: 36 },
  { header: "Phone", key: "phone", width: 22 },
  { header: "Status", key: "status", width: 16 },
  { header: "Roles", key: "roles", width: 40 },
];

/** Baris sudah diformat & disanitasi di query, sehingga langsung ditulis tanpa transformasi. */
export const buildUsersWorkbook = async (
  rows: In_DTO_UserExportRow[],
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Users");
  worksheet.columns = COLUMNS;
  worksheet.getRow(1).font = { bold: true };
  worksheet.addRows(rows);
  return Buffer.from(await workbook.xlsx.writeBuffer());
};
