import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  pick,
} from "../../shared/utils/controller.util";
import { makeBaseAudit, reqIdParam } from "../../shared/utils/helper";
import { MILESTONE_SORT_FIELDS, MilestoneSortField } from "./dto";
import { milestoneService as service } from "./service";

export class MilestoneController {
  fetchPagination = handleList<MilestoneSortField>(
    "milestone",
    MILESTONE_SORT_FIELDS,
    "created_at",
    (query) => service.fetchPagination(query),
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "milestone", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "milestone", (req) =>
    service.create({
      project_id: req.body.project_id,
      title: req.body.title,
      description: req.body.description ?? null,
      dueDate: req.body.dueDate ?? null,
      ...(req.body.status !== undefined ? { status: req.body.status } : {}),
      ...makeBaseAudit(req, "create"),
    }),
  );

  update = handle(HTTP_STATUS.OK, "updated", "milestone", (req) =>
    service.update(reqIdParam(req), {
      ...pick(req.body, [
        "project_id",
        "title",
        "description",
        "dueDate",
        "status",
      ]),
      ...makeBaseAudit(req, "update"),
    }),
  );

  delete = handle(HTTP_STATUS.OK, "deleted", "milestone", (req) =>
    service.delete(reqIdParam(req), makeBaseAudit(req, "delete")),
  );
}