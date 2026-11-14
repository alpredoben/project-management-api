import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  pick,
} from "../../shared/utils/controller.util";
import { makeBaseAudit, reqIdParam } from "../../shared/utils/helper";
import {
  PROJECT_TYPE_SORT_FIELDS,
  ProjectTypeSortField,
} from "./dto";
import { projectTypeService as service } from "./service";

export class ProjectTypeController {
  fetchPagination = handleList<ProjectTypeSortField>(
    "project type",
    PROJECT_TYPE_SORT_FIELDS,
    "name",
    (query) => service.fetchPagination(query),
    "ASC",
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "project type", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "project type", (req) =>
    service.create({
      name: req.body.name,
      description: req.body.description ?? null,
      ...makeBaseAudit(req, "create"),
    }),
  );

  update = handle(HTTP_STATUS.OK, "updated", "project type", (req) =>
    service.update(reqIdParam(req), {
      ...pick(req.body, ["name", "description"]),
      ...makeBaseAudit(req, "update"),
    }),
  );

  delete = handle(HTTP_STATUS.OK, "deleted", "project type", (req) =>
    service.delete(reqIdParam(req), makeBaseAudit(req, "delete")),
  );
}