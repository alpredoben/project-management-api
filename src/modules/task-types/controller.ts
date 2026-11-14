import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  pick,
} from "../../shared/utils/controller.util";
import { makeBaseAudit, reqIdParam } from "../../shared/utils/helper";
import { TASK_TYPE_SORT_FIELDS, TaskTypeSortField } from "./dto";
import { taskTypeService as service } from "./service";

export class TaskTypeController {
  fetchPagination = handleList<TaskTypeSortField>(
    "jenis tugas",
    TASK_TYPE_SORT_FIELDS,
    "name",
    (query) => service.fetchPagination(query),
    "ASC",
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "jenis tugas", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "jenis tugas", (req) =>
    service.create({
      name: req.body.name,
      icon: req.body.icon ?? null,
      ...makeBaseAudit(req, "create"),
    }),
  );

  update = handle(HTTP_STATUS.OK, "updated", "jenis tugas", (req) =>
    service.update(reqIdParam(req), {
      ...pick(req.body, ["name", "icon"]),
      ...makeBaseAudit(req, "update"),
    }),
  );

  delete = handle(HTTP_STATUS.OK, "deleted", "jenis tugas", (req) =>
    service.delete(reqIdParam(req), makeBaseAudit(req, "delete")),
  );
}