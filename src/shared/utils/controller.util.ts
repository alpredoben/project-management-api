import { NextFunction, Request, RequestHandler, Response } from "express";
import { In_DTO_ListQuery } from "../../interfaces/dto.interface";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { HTTP_STATUS } from "../constants";
import { getStringMessage } from "./helper";
import { getPageAndLimit } from "./pagination.util";
import { ResponseAPI } from "./response-api.util";

const SUCCESS_VERB = {
  created: "disimpan",
  retrieved: "diambil",
  updated: "diperbarui",
  deleted: "dihapus",
} as const;

export type T_SuccessKind = keyof typeof SUCCESS_VERB;

const successMessage = (
  req: Request,
  kind: T_SuccessKind,
  label: string,
): string =>
  getStringMessage(
    req,
    `success.default.${kind}`,
    `Data ${label} berhasil ${SUCCESS_VERB[kind]}.`,
    { m: label },
  );

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export const idParam = (req: Request): string => req.params["id"] as string;

/** Mengambil hanya field yang diizinkan dari body (mencegah mass assignment). */
export const pick = <K extends string>(
  body: Record<string, unknown>,
  keys: readonly K[],
): Partial<Record<K, any>> =>
  Object.fromEntries(
    keys
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, body[key]]),
  ) as Partial<Record<K, any>>;

/** Normalisasi query string menjadi filter list yang aman dipakai repository. */
export const parseListQuery = <S extends string>(
  req: Request,
  sortFields: readonly S[],
  defaultSort: S,
): In_DTO_ListQuery<S> => {
  const { currentPage, perPage } = getPageAndLimit({
    page: asString(req.query["page"]),
    limit: asString(req.query["limit"]),
  });
  const sortBy = asString(req.query["sort_by"]);

  return {
    page: currentPage,
    limit: perPage,
    sort_by: sortFields.find((field) => field === sortBy) ?? defaultSort,
    order_by:
      asString(req.query["order_by"])?.toUpperCase() === "ASC" ? "ASC" : "DESC",
    search: asString(req.query["search"])?.trim() ?? "",
  };
};

/**
 * Membungkus action menjadi request handler: menjalankan action,
 * mengirim response sukses, dan meneruskan error ke error middleware.
 */
export const handle =
  (
    status: number,
    kind: T_SuccessKind,
    label: string,
    action: (req: Request) => Promise<object | void>,
  ): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = (await action(req)) as object | undefined;
      ResponseAPI.success(res, status, successMessage(req, kind, label), data);
    } catch (error) {
      next(error);
    }
  };

/** Seperti `handle`, tetapi untuk endpoint list berpaginasi. */
export const handleList =
  <S extends string>(
    label: string,
    sortFields: readonly S[],
    defaultSort: S,
    action: (
      query: In_DTO_ListQuery<S>,
    ) => Promise<{ data: any[]; meta: In_API_AttributMeta }>,
  ): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { data, meta } = await action(
        parseListQuery(req, sortFields, defaultSort),
      );
      ResponseAPI.successPagination(
        res,
        HTTP_STATUS.OK,
        successMessage(req, "retrieved", label),
        data,
        meta,
      );
    } catch (error) {
      next(error);
    }
  };
