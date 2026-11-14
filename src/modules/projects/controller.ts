import { NextFunction, Request, RequestHandler, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  parseListQuery,
  pick,
} from "../../shared/utils/controller.util";
import {
  makeBaseAudit,
  makeSuccessMessage,
  reqIdParam,
} from "../../shared/utils/helper";
import { ResponseAPI } from "../../shared/utils/response-api.util";
import {
  PROJECT_MILESTONE_SORT_FIELDS,
  PROJECT_SORT_FIELDS,
  ProjectSortField,
} from "./dto";
import { projectService as service } from "./service";

export class ProjectController {
  fetchPagination = handleList<ProjectSortField>(
    "proyek",
    PROJECT_SORT_FIELDS,
    "created_at",
    (query) => service.fetchPagination(query),
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "proyek", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "proyek", (req) =>
    service.create({
      workspace_id: req.body.workspace_id,
      project_type_id: req.body.project_type_id ?? null,
      project_status_id: req.body.project_status_id ?? null,
      name: req.body.name,
      key: req.body.key,
      description: req.body.description ?? null,
      start_date: req.body.start_date ?? null,
      end_date: req.body.end_date ?? null,
      ...makeBaseAudit(req, "create"),
    }),
  );

  update = handle(HTTP_STATUS.OK, "updated", "proyek", (req) =>
    service.update(reqIdParam(req), {
      ...pick(req.body, [
        "workspace_id",
        "project_type_id",
        "project_status_id",
        "name",
        "key",
        "description",
        "start_date",
        "end_date",
      ]),
      ...makeBaseAudit(req, "update"),
    }),
  );

  delete = handle(HTTP_STATUS.OK, "deleted", "proyek", (req) =>
    service.delete(reqIdParam(req), makeBaseAudit(req, "delete")),
  );

  changeStatus = handle(HTTP_STATUS.OK, "updated", "status proyek", (req) =>
    service.changeStatus(
      reqIdParam(req),
      req.body.project_status_id,
      makeBaseAudit(req, "update"),
    ),
  );

  changeType = handle(HTTP_STATUS.OK, "updated", "tipe proyek", (req) =>
    service.changeType(
      reqIdParam(req),
      req.body.project_type_id,
      makeBaseAudit(req, "update"),
    ),
  );

  fetchMilestones: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { data, meta } = await service.fetchMilestones(
        reqIdParam(req),
        parseListQuery(
          req,
          PROJECT_MILESTONE_SORT_FIELDS,
          "due_date",
        ),
      );
      ResponseAPI.successPagination(
        res,
        HTTP_STATUS.OK,
        makeSuccessMessage(req, "retrieved", "milestone proyek"),
        data,
        meta,
      );
    } catch (error) {
      next(error);
    }
  };
}