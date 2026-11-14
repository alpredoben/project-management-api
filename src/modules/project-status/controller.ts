import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  pick,
} from "../../shared/utils/controller.util";
import { makeBaseAudit, reqIdParam } from "../../shared/utils/helper";
import {
  PROJECT_STATUS_SORT_FIELDS,
  ProjectStatusSortField,
} from "./dto";
import { projectStatusService as service } from "./service";

export class ProjectStatusController {
  fetchPagination = handleList<ProjectStatusSortField>(
    "project status",
    PROJECT_STATUS_SORT_FIELDS,
    "sequence_order",
    (query) => service.fetchPagination(query),
    "ASC",
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "project status", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "project status", (req) =>
    service.create({
      name: req.body.name,
      color_code: req.body.color_code ?? "#FFFFFF",
      sequence_order: req.body.sequence_order ?? 0,
      ...makeBaseAudit(req, "create"),
    }),
  );

  update = handle(HTTP_STATUS.OK, "updated", "project status", (req) =>
    service.update(reqIdParam(req), {
      ...pick(req.body, ["name", "color_code", "sequence_order"]),
      ...makeBaseAudit(req, "update"),
    }),
  );

  delete = handle(HTTP_STATUS.OK, "deleted", "project status", (req) =>
    service.delete(reqIdParam(req), makeBaseAudit(req, "delete")),
  );
}