import { HTTP_STATUS } from "../../shared/constants";
import { NextFunction, Request, RequestHandler, Response } from "express";
import {
  handle,
  handleList,
  pick,
  parseListQuery,
} from "../../shared/utils/controller.util";
import {
  createSlug,
  makeBaseAudit,
  makeSuccessMessage,
  reqIdParam,
} from "../../shared/utils/helper";
import { ResponseAPI } from "../../shared/utils/response-api.util";
import { WORKSPACE_SORT_FIELDS, WorkspaceSortField } from "./dto";
import { workspaceService as service } from "./service";

export class WorkspaceController {
  fetchPagination = handleList<WorkspaceSortField>(
    "workspace",
    WORKSPACE_SORT_FIELDS,
    "created_at",
    (query) => service.fetchPagination(query),
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "workspace", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "workspace", (req) =>
    service.create({
      name: req.body.name,
      slug: createSlug(req.body.name),
      logo_url: req.body.logo_url ?? null,
      ...makeBaseAudit(req, "create"),
    }),
  );

  update = handle(HTTP_STATUS.OK, "updated", "workspace", (req) =>
    service.update(reqIdParam(req), {
      ...pick(req.body, ["name", "logo_url"]),
      ...(req.body.name !== undefined
        ? { slug: createSlug(req.body.name) }
        : {}),
      ...makeBaseAudit(req, "update"),
    }),
  );

  delete = handle(HTTP_STATUS.OK, "deleted", "workspace", (req) =>
    service.delete(reqIdParam(req), makeBaseAudit(req, "delete")),
  );

  fetchMembers: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { data, meta } = await service.fetchMembers(
        reqIdParam(req),
        parseListQuery(
          req,
          [
            "workspace_id",
            "user_id",
            "position_id",
            "joined_at",
            "created_at",
            "updated_at",
          ] as const,
          "joined_at",
        ),
      );
      ResponseAPI.successPagination(
        res,
        HTTP_STATUS.OK,
        makeSuccessMessage(req, "retrieved", "anggota workspace"),
        data,
        meta,
      );
    } catch (error) {
      next(error);
    }
  };

  addMembers = handle(
    HTTP_STATUS.OK,
    "updated",
    "anggota workspace",
    (req) =>
      service.addMembers(
        reqIdParam(req),
        req.body.user_ids,
        makeBaseAudit(req, "create"),
      ),
  );
}