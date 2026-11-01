import { Request } from "express";
import dayjs from "dayjs";
import { config } from "../../config";
import { In_DTO_Pagination } from "../../interfaces/dto.interface";
import { BaseAuditEntity } from "../../database/entities";

export const makeBaseAudit = (
  req: Request,
  type: string,
): Partial<BaseAuditEntity> => {
  const today = new Date();

  switch (type) {
    case "create":
      return {
        created_at: today,
        updated_at: today,
        created_by: req.user?.id,
        updated_by: req.user?.id,
      };
    case "update":
      return {
        updated_at: today,
        updated_by: req.user?.id,
      };

    case "delete":
      return {
        deleted_at: today,
        deleted_by: req.user?.id,
      };

    default:
      return {
        created_at: today,
        updated_at: today,
        deleted_at: today,
        created_by: req.user?.id,
        updated_by: req.user?.id,
        deleted_by: req.user?.id,
      };
  }
};

export const getStringMessage = (
  req: Request,
  key: string,
  fallback: string,
  params: Record<string, string> = {},
): string => req.t?.(key, { ...params }) ?? fallback;

export const createSlug = (text: any): any => {
  if (text == "") return null;
  return text
    .toString() // Memastikan input adalah string
    .normalize("NFD") // Memecah karakter beraksen (misal: é menjadi e + ´)
    .replace(/[\u0300-\u036f]/g, "") // Menghapus tanda diakritik/aksen
    .toLowerCase() // Mengubah huruf menjadi kecil semua
    .trim() // Menghapus spasi di awal dan akhir string
    .replace(/\s+/g, "-") // Mengganti spasi atau sekumpulan spasi dengan tanda hubung (-)
    .replace(/[^\w\-]+/g, "") // Menghapus semua karakter non-word (simbol, tanda baca, dll)
    .replace(/\-\-+/g, "-") // Mengganti tanda hubung ganda (-) menjadi satu saja
    .replace(/^-+/, "") // Menghapus tanda hubung di awal string
    .replace(/-+$/, ""); // Menghapus tanda hubung di akhir string
};

export const devModeSlug = (str: string) => {
  const mode: string = config.app.env?.toLowerCase();
  if (mode == "development" || mode == "dev") {
    return `${str}_dev`;
  }
  return str;
};

export const paginationClear = (req: Request): In_DTO_Pagination => {
  const page: number = Number(req?.query?.["page"] ?? 1);
  const limit: number = Number(req.query?.["limit"] ?? 10);
  return {
    page,
    limit,
    sort_by:
      typeof req?.query["sort_by"] === "string" ? req.query["sort_by"] : "",
    order_by:
      String(req.query["order_by"]).toUpperCase() === "ASC" ? "ASC" : "DESC",
    search:
      typeof req.query?.["search"] === "string" ? req.query["search"] : "",
  } as In_DTO_Pagination;
};

export const splitDate = (dateStr: string): Record<string, any> => {
  const date = dayjs(dateStr);
  const day = date.format("DD");
  const month = date.format("MM");
  const year = date.format("YYYY");

  return {
    day,
    month,
    year,
  };
};

export const getFormatDate = (
  dateStr: string = "",
  formatted: string = "YYYY-MM-DD",
): string => {
  if (dateStr == "") {
    return dayjs().format(formatted);
  }
  return dayjs(dateStr).format(formatted);
};

export const combineArray = (arr: any[]): string => arr.join(", ");
