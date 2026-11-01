import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants";
import { ResponseAPI } from "../../shared/utils/response-api.util";
import { getPageAndLimit } from "../../shared/utils/pagination.util";
import {
  In_DTO_PermissionListQuery,
  PERMISSION_SORT_FIELDS,
  T_PermissionSortField,
} from "./dto";
import { service } from "./services";
import {
  createSlug,
  getStringMessage,
  makeBaseAudit,
} from "../../shared/utils/helper";
import { In_ENTITY_Permission } from "../../interfaces/entity.interface";

export class PermissionController {
  public async fetchById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const permission = await service.findById(req.params["id"] as string);
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.retrieved",
          "Permission berhasil diambil.",
        ),
        permission,
      );
    } catch (error) {
      next(error);
    }
  }

  public async store(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const payload: Partial<In_ENTITY_Permission> = {
        name: req.body.name.trim(),
        slug: createSlug(req.body.name),
        ...makeBaseAudit(req, "create"),
      };
      const permission = await service.store(payload);
      ResponseAPI.success(
        res,
        HTTP_STATUS.CREATED,
        getStringMessage(
          req,
          "success.default.created",
          "Permission berhasil dibuat.",
        ),
        permission,
      );
    } catch (error) {
      next(error);
    }
  }

  public async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const payload: Partial<In_ENTITY_Permission> = {
        ...(typeof req.body.name === "string"
          ? {
              name: req.body.name.trim(),
              slug: createSlug(req.body.name),
            }
          : {}),
        ...makeBaseAudit(req, "update"),
      };
      const permission = await service.update(
        req.params["id"] as string,
        payload,
      );
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.updated",
          "Permission berhasil diperbarui.",
        ),
        permission,
      );
    } catch (error) {
      next(error);
    }
  }

  public async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const payload: Partial<In_ENTITY_Permission> = {
        ...makeBaseAudit(req, "delete"),
      };
      await service.delete(req.params["id"] as string, payload);
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.deleted",
          "Permission berhasil dihapus.",
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  public fetchPagination = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const filter = this.generateFilter(req);
    try {
      const result = await service.fetchPagination(filter);
      ResponseAPI.successPagination(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.retrieved",
          "Daftar permission berhasil diambil.",
        ),
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  };

  private validateSortBy(value: unknown): value is T_PermissionSortField {
    return (
      typeof value === "string" &&
      (new Set(PERMISSION_SORT_FIELDS) as ReadonlySet<string>).has(value)
    );
  }

  private generateFilter(req: Request): In_DTO_PermissionListQuery {
    const pagination = getPageAndLimit({
      page:
        typeof req.query["page"] === "string" ? req.query["page"] : undefined,
      limit:
        typeof req.query["limit"] === "string" ? req.query["limit"] : undefined,
    });

    return {
      page: pagination.currentPage,
      limit: pagination.perPage,
      sort_by:
        typeof req.query["sort_by"] === "string" &&
        this.validateSortBy(req.query["sort_by"])
          ? req.query["sort_by"]
          : "created_at",
      order_by:
        String(req.query["order_by"]).toUpperCase() === "ASC" ? "ASC" : "DESC",
      search:
        typeof req.query["search"] === "string"
          ? req.query["search"].trim()
          : "",
    } as In_DTO_PermissionListQuery;
  }
}

export const permissionController = new PermissionController();
