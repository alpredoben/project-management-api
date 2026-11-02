import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  idParam,
  pick,
} from "../../shared/utils/controller.util";
import { makeBaseAudit } from "../../shared/utils/helper";
import { TASK_TYPE_COLUMNS, TASK_TYPE_FIELDS } from "./dto";
import { service } from "./services";

const LABEL = "Tipe task";

export class TaskTypeController {
  public store = handle(HTTP_STATUS.CREATED, "created", LABEL, (req) =>
    service.store(
      { type_name: req.body.type_name, sort_order: req.body.sort_order },
      makeBaseAudit(req, "create"),
    ),
  );

  public fetchById = handle(HTTP_STATUS.OK, "retrieved", LABEL, (req) =>
    service.fetchById(idParam(req)),
  );

  public update = handle(HTTP_STATUS.OK, "updated", LABEL, (req) =>
    service.update(
      idParam(req),
      pick(req.body, TASK_TYPE_FIELDS),
      makeBaseAudit(req, "update"),
    ),
  );

  public delete = handle(HTTP_STATUS.OK, "deleted", LABEL, (req) =>
    service.delete(idParam(req), makeBaseAudit(req, "delete")),
  );

  public fetchPagination = handleList(
    LABEL,
    TASK_TYPE_COLUMNS,
    "sort_order",
    (query) => service.fetchPagination(query),
  );
}

export const taskTypeController = new TaskTypeController();
