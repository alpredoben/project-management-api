import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  idParam,
  pick,
} from "../../shared/utils/controller.util";
import { makeBaseAudit } from "../../shared/utils/helper";
import { TASK_STATUS_FIELDS, TASK_STATUS_SORT_FIELDS } from "./dto";
import { service } from "./services";

const LABEL = "Status task";

export class TaskStatusController {
  public store = handle(HTTP_STATUS.CREATED, "created", LABEL, (req) =>
    service.store(
      { status_name: req.body.status_name, sort_order: req.body.sort_order },
      makeBaseAudit(req, "create"),
    ),
  );

  public fetchById = handle(HTTP_STATUS.OK, "retrieved", LABEL, (req) =>
    service.fetchById(idParam(req)),
  );

  public update = handle(HTTP_STATUS.OK, "updated", LABEL, (req) =>
    service.update(
      idParam(req),
      pick(req.body, TASK_STATUS_FIELDS),
      makeBaseAudit(req, "update"),
    ),
  );

  public delete = handle(HTTP_STATUS.OK, "deleted", LABEL, (req) =>
    service.delete(idParam(req), makeBaseAudit(req, "delete")),
  );

  public fetchPagination = handleList(
    LABEL,
    TASK_STATUS_SORT_FIELDS,
    "sort_order",
    (query) => service.fetchPagination(query),
  );
}

export const taskStatusController = new TaskStatusController();
