import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants";
import { ResponseAPI } from "../../shared/utils/response-api.util";
import {
  generatePaginationMeta,
  getPageAndLimit,
  getPaginationParams,
} from "../../shared/utils/pagination.util";
import {
  In_DTO_Assignment,
  In_DTO_RoleListQuery,
  ROLE_SORT_FIELDS,
  T_RoleSortField,
} from "./dto";
import { service } from "./services";
import {
  createSlug,
  getStringMessage,
  makeBaseAudit,
} from "../../shared/utils/helper";
import { In_ENTITY_Role } from "../../interfaces/entity.interface";

export class RoleController {
  // Find By Id
  public async fetchById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const role = await service.findById(req?.params?.["id"] as string);

      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.retrieved",
          "Role berhasil diambil.",
        ),
        role,
      );
    } catch (error) {
      next(error);
    }
  }

  // Store
  public async store(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const payload: Partial<In_ENTITY_Role> = {
      name: req.body.name.trim(),
      slug: createSlug(req.body.name),
      description: req.body.description?.trim() || null,
      ...makeBaseAudit(req, "create"),
    };

    try {
      const role = await service.store(payload);
      ResponseAPI.success(
        res,
        HTTP_STATUS.CREATED,
        getStringMessage(
          req,
          "success.default.created",
          "Role berhasil dibuat.",
        ),
        role,
      );
    } catch (error) {
      next(error);
    }
  }

  // Update
  public async update(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const payload: Partial<In_ENTITY_Role> = {
      ...req.body,
      slug: createSlug(req.body.name),
      ...makeBaseAudit(req, "update"),
    };

    try {
      const result = await service.update(
        req.params?.["id"] as string,
        payload,
      );
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.updated",
          "Role berhasil diperbarui.",
        ),
        result,
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete
  public async delete(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const payload: Partial<In_ENTITY_Role> = {
      ...makeBaseAudit(req, "delete"),
    };
    try {
      await service.delete(req.params?.["id"] as string, payload);
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.deleted",
          "Role berhasil dihapus.",
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  public async assignPermission(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const payload: In_DTO_Assignment = {
      role_id: req.params["id"] as string,
      permissions_ids: req.body.permission_ids as string[],
    };

    try {
      const assignments = await service.assignPermission(
        payload,
        makeBaseAudit(req, "create"),
      );
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.updated",
          "Permission berhasil ditambahkan ke role.",
        ),
        assignments,
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
          "Daftar role berhasil diambil.",
        ),
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  };

  private validateSortBy(value: unknown): value is T_RoleSortField {
    return (
      typeof value === "string" &&
      (new Set(ROLE_SORT_FIELDS) as ReadonlySet<string>).has(value)
    );
  }

  private generateFilter(req: Request): In_DTO_RoleListQuery {
    const pagination = getPageAndLimit({
      page:
        typeof req.query?.["page"] === "string" ? req.query["page"] : undefined,
      limit:
        typeof req.query?.["limit"] === "string"
          ? req.query["limit"]
          : undefined,
    });

    return {
      page: pagination.currentPage,
      limit: pagination.perPage,
      sort_by:
        typeof req.query?.["sort_by"] === "string" &&
        this.validateSortBy(req.query["sort_by"])
          ? req.query["sort_by"]
          : "created_at",
      order_by:
        String(req.query?.["order_by"]).toUpperCase() === "ASC"
          ? "ASC"
          : "DESC",
      search:
        typeof req.query?.["search"] === "string"
          ? req.query["search"].trim()
          : "",
    } as In_DTO_RoleListQuery;
  }
}

export const roleController = new RoleController();
