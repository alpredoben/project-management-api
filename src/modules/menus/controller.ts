import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants";
import { In_ENTITY_Menu } from "../../interfaces/entity.interface";
import { ResponseAPI } from "../../shared/utils/response-api.util";
import { getPageAndLimit } from "../../shared/utils/pagination.util";
import {
  createSlug,
  getStringMessage,
  makeBaseAudit,
} from "../../shared/utils/helper";
import {
  In_DTO_AddRolePermissionMenu,
  In_DTO_MenuListQuery,
  MENU_SORT_FIELDS,
  T_MenuSortField,
} from "./dto";
import { service } from "./services";

export class MenuController {
  public async fetchById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const menu = await service.findById(req.params["id"] as string);
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.retrieved",
          "Menu berhasil diambil.",
        ),
        menu,
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
      const payload: Partial<In_ENTITY_Menu> = {
        name: req.body.name.trim(),
        slug: createSlug(req.body.name),
        path: req.body.path.trim(),
        icon: req.body.icon?.trim() || null,
        parent_id: req.body.parent_id || null,
        order_number: req.body.order_number ?? 0,
        ...makeBaseAudit(req, "create"),
      };
      const menu = await service.store(payload);
      ResponseAPI.success(
        res,
        HTTP_STATUS.CREATED,
        getStringMessage(
          req,
          "success.default.created",
          "Menu berhasil dibuat.",
        ),
        menu,
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
      const payload: Partial<In_ENTITY_Menu> = {
        ...(typeof req.body.name === "string"
          ? {
              name: req.body.name.trim(),
              slug: createSlug(req.body.name),
            }
          : {}),
        ...(typeof req.body.path === "string"
          ? { path: req.body.path.trim() }
          : {}),
        ...(req.body.icon !== undefined
          ? { icon: req.body.icon?.trim() || null }
          : {}),
        ...(req.body.parent_id !== undefined
          ? { parent_id: req.body.parent_id || null }
          : {}),
        ...(req.body.order_number !== undefined
          ? { order_number: req.body.order_number }
          : {}),
        ...makeBaseAudit(req, "update"),
      };
      const menu = await service.update(req.params["id"] as string, payload);
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.updated",
          "Menu berhasil diperbarui.",
        ),
        menu,
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
      await service.delete(
        req.params["id"] as string,
        makeBaseAudit(req, "delete"),
      );
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.deleted",
          "Menu berhasil dihapus.",
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  public async addRolePermissionMenu(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const payload: In_DTO_AddRolePermissionMenu = {
      role_id: req.body.role_id,
      menu_id: req.body.menu_id,
      permissions_ids: req.body.permissions_ids,
    };
    try {
      const assignments = await service.addRolePermissionMenu(
        payload,
        makeBaseAudit(req, "create"),
      );
      ResponseAPI.success(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.updated",
          "Permission berhasil ditambahkan ke menu untuk role.",
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
    try {
      const result = await service.fetchPagination(this.generateFilter(req));
      ResponseAPI.successPagination(
        res,
        HTTP_STATUS.OK,
        getStringMessage(
          req,
          "success.default.retrieved",
          "Daftar menu berhasil diambil.",
        ),
        result.data,
        result.meta,
      );
    } catch (error) {
      next(error);
    }
  };

  private isMenuSortBy(value: unknown): value is T_MenuSortField {
    return (
      typeof value === "string" &&
      (new Set(MENU_SORT_FIELDS) as ReadonlySet<string>).has(value)
    );
  }

  private generateFilter(req: Request): In_DTO_MenuListQuery {
    const pagination = getPageAndLimit({
      page:
        typeof req.query["page"] === "string" ? req.query["page"] : undefined,
      limit:
        typeof req.query["limit"] === "string"
          ? req.query["limit"]
          : undefined,
    });
    return {
      page: pagination.currentPage,
      limit: pagination.perPage,
      sort_by:
        typeof req.query["sort_by"] === "string" &&
        this.isMenuSortBy(req.query["sort_by"])
          ? req.query["sort_by"]
          : "created_at",
      order_by:
        String(req.query["order_by"]).toUpperCase() === "ASC" ? "ASC" : "DESC",
      search:
        typeof req.query["search"] === "string"
          ? req.query["search"].trim()
          : "",
    };
  }
}

export const menuController = new MenuController();