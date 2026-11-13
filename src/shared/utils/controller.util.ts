import { NextFunction, Request, RequestHandler, Response } from "express";
import { In_DTO_ListQuery } from "../../interfaces/dto.interface";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { HTTP_STATUS } from "../constants";
import { convertToString, makeSuccessMessage, T_SuccessVerb } from "./helper";
import { getPageAndLimit } from "./pagination.util";
import { ResponseAPI } from "./response-api.util";


export const pick = <K extends string>(
  body: Record<string, unknown>,
  keys: readonly K[],
): Partial<Record<K, any>> =>
  Object.fromEntries(
    keys
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, body[key]]),
  ) as Partial<Record<K, any>>;

export const parseListQuery = <S extends string>(
  req: Request,
  sortFields: readonly S[],
  defaultSort: S,
  defaultOrder: "ASC" | "DESC" = "DESC",
): In_DTO_ListQuery<S> => {
  const { currentPage, perPage } = getPageAndLimit({
    page: convertToString(req.query["page"]),
    limit: convertToString(req.query["limit"]),
  });
  const sortBy = convertToString(req.query["sort_by"]);

  return {
    page: currentPage,
    limit: perPage,
    sortBy: sortFields.find((field) => field === sortBy) ?? defaultSort,
    orderBy:
      convertToString(req.query["order_by"])?.toUpperCase() === "ASC"
        ? "ASC"
        : convertToString(req.query["order_by"])?.toUpperCase() === "DESC"
          ? "DESC"
          : defaultOrder,
    search: convertToString(req.query["search"])?.trim() ?? "",
  };
};


export const handle =
  (
    status: number,
    kind: T_SuccessVerb,
    label: string,
    action: (req: Request) => Promise<object | void>,
  ): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = (await action(req)) as object | undefined;
      ResponseAPI.success(res, status, makeSuccessMessage(req, kind, label), data);
    } catch (error: Error | any) {
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
    defaultOrder: "ASC" | "DESC" = "DESC",
  ): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { data, meta } = await action(
        parseListQuery(req, sortFields, defaultSort, defaultOrder),
      );
      ResponseAPI.successPagination(
        res,
        HTTP_STATUS.OK,
        makeSuccessMessage(req, "retrieved", label),
        data,
        meta,
      );
    } catch (error) {
      next(error);
    }
  };
