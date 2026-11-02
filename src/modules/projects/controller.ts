import { Request, RequestHandler, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../../shared/constants";
import { getStringMessage, makeBaseAudit } from "../../shared/utils/helper";
import {
  handle,
  idParam,
  parseListQuery,
  pick,
} from "../../shared/utils/controller.util";
import { ResponseAPI } from "../../shared/utils/response-api.util";
import {
  In_DTO_CreateProject,
  PROJECT_FIELDS,
  PROJECT_SORT_FIELDS,
} from "./dto";
import { service } from "./services";

const LABEL = "Project";

const handleProjectList: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = parseListQuery(req, PROJECT_SORT_FIELDS, "created_at");
    const result = await service.fetchPagination({
      ...query,
      project_type_id:
        typeof req.query["project_type_id"] === "string"
          ? req.query["project_type_id"]
          : undefined,
      project_status_id:
        typeof req.query["project_status_id"] === "string"
          ? req.query["project_status_id"]
          : undefined,
    });
    ResponseAPI.successPagination(
      res,
      HTTP_STATUS.OK,
      getStringMessage(
        req,
        "success.default.retrieved",
        "Data project berhasil diambil.",
        { m: LABEL },
      ),
      result.data,
      result.meta,
    );
  } catch (error) {
    next(error);
  }
};

export class ProjectController {
  public store = handle(HTTP_STATUS.CREATED, "created", LABEL, (req) =>
    service.store(
      {
        project_code: req.body.project_code,
        project_name: req.body.project_name,
        project_type_id: req.body.project_type_id,
        project_status_id: req.body.project_status_id,
        description: req.body.description,
        owner_id: req.body.owner_id,
        parent_id: req.body.parent_id,
        max_contributors: req.body.max_contributors,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
      } satisfies In_DTO_CreateProject,
      makeBaseAudit(req, "create"),
    ),
  );

  public fetchById = handle(HTTP_STATUS.OK, "retrieved", LABEL, (req) =>
    service.fetchById(idParam(req)),
  );

  public update = handle(HTTP_STATUS.OK, "updated", LABEL, (req) =>
    service.update(
      idParam(req),
      pick(req.body, PROJECT_FIELDS),
      makeBaseAudit(req, "update"),
    ),
  );

  public delete = handle(HTTP_STATUS.OK, "deleted", LABEL, (req) =>
    service.delete(idParam(req), makeBaseAudit(req, "delete")),
  );

  public fetchPagination = handleProjectList;
}

export const projectController = new ProjectController();
