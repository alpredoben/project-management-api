import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  pick,
} from "../../shared/utils/controller.util";
import { makeBaseAudit, reqIdParam } from "../../shared/utils/helper";
import { TASK_STATUS_SORT_FIELDS, TaskStatusSortField } from "./dto";
import { taskStatusService as service } from "./service";

export class TaskStatusController {
  fetchPagination = handleList<TaskStatusSortField>(
    "status tugas",
    TASK_STATUS_SORT_FIELDS,
    "sequence_order",
    (query) => service.fetchPagination(query),
    "ASC",
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "status tugas", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "status tugas", (req) =>
    service.create({
      name: req.body.name,
      color_code: req.body.color_code ?? "#FFFFFF",
      sequence_order: req.body.sequence_order ?? 0,
      is_closed: req.body.is_closed ?? false,
      ...makeBaseAudit(req, "create"),
    }),
  );

  update = handle(HTTP_STATUS.OK, "updated", "status tugas", (req) =>
    service.update(reqIdParam(req), {
      ...pick(req.body, [
        "name",
        "color_code",
        "sequence_order",
        "is_closed",
      ]),
      ...makeBaseAudit(req, "update"),
    }),
  );

  delete = handle(HTTP_STATUS.OK, "deleted", "status tugas", (req) =>
    service.delete(reqIdParam(req), makeBaseAudit(req, "delete")),
  );
}