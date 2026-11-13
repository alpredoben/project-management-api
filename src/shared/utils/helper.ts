import { Request } from "express";
import dayjs from "dayjs";
import { config } from "../../config";
import { In_DTO_Pagination } from "../../interfaces/dto.interface";
import { AuditBaseEntity } from "../../database/entities/base.entity";
import { SUCCESS_VERB } from "../constants";

export const makeBaseAudit = (
  req: Request,
  type: string,
): Partial<AuditBaseEntity> => {
  const today = new Date();

  switch (type) {
    case "create":
      return {
        createdAt: today,
        updatedAt: today,
        createdBy: req.user?.id,
        updatedBy: req.user?.id,
      };
    case "update":
      return {
        updatedAt: today,
        updatedBy: req.user?.id,
      };

    case "delete":
      return {
        deletedAt: today,
        deletedBy: req.user?.id,
      };

    default:
      return {
        createdAt: today,
        updatedAt: today,
        deletedAt: today,
        createdBy: req.user?.id,
        updatedBy: req.user?.id,
        deletedBy: req.user?.id,
      };
  }
};

export const getStringMessage = (
  req: Request,
  key: string,
  fallback: string,
  params: Record<string, string> = {},
): string => req.t?.(key, { defaultValue: fallback, ...params }) ?? fallback;

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

export { devModeSlug } from "./dev-mode.util";

export const paginationClear = (req: Request): In_DTO_Pagination => {
  const page: number = Number(req?.query?.["page"] ?? 1);
  const limit: number = Number(req.query?.["limit"] ?? 10);
  return {
    page,
    limit,
    sortBy: typeof req?.query["sortBy"] === "string" ? req.query["sortBy"] : "",
    orderBy:
      String(req.query["orderBy"]).toUpperCase() === "ASC" ? "ASC" : "DESC",
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

export const convertToString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export type T_SuccessVerb = keyof typeof SUCCESS_VERB;

export const makeSuccessMessage = (
  req: Request,
  kind: T_SuccessVerb,
  label: string,
): string =>
  getStringMessage(
    req,
    `success.default.${kind}`,
    `Data ${label} berhasil ${SUCCESS_VERB[kind]}.`,
    { m: label },
  );

export const reqIdParam = (req: Request): string => req.params["id"] as string;

export const createVerificationUrl = (token: string): string => {
  const appUrl = new URL(config.app.url);
  if (!appUrl.port) {
    appUrl.port = String(config.app.port);
  }
  const apiPrefix = config.app.prefix.replace(/^\/+|\/+$/g, "");
  return `${appUrl.origin}/${apiPrefix}/auth/verified-email?token=${encodeURIComponent(token)}`;
};

export const createPasswordResetUrl = (token: string): string => {
  const baseUrl = config.app.url.replace(/\/+$/, "");
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
};
