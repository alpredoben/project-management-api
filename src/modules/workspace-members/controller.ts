import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  pick,
} from "../../shared/utils/controller.util";
import { makeBaseAudit, reqIdParam } from "../../shared/utils/helper";
import {
  WORKSPACE_MEMBER_SORT_FIELDS,
  WorkspaceMemberSortField,
} from "./dto";
import { workspaceMemberService as service } from "./service";

export class WorkspaceMemberController {
  fetchPagination = handleList<WorkspaceMemberSortField>(
    "anggota workspace",
    WORKSPACE_MEMBER_SORT_FIELDS,
    "joined_at",
    (query) => service.fetchPagination(query),
  );

  findById = handle(
    HTTP_STATUS.OK,
    "retrieved",
    "anggota workspace",
    (req) => service.findById(reqIdParam(req)),
  );

  create = handle(
    HTTP_STATUS.CREATED,
    "created",
    "anggota workspace",
    (req) =>
      service.create({
        workspace_id: req.body.workspace_id,
        user_id: req.body.user_id,
        role_id: req.body.role_id ?? null,
        ...(req.body.joined_at !== undefined
          ? { joined_at: new Date(req.body.joined_at) }
          : {}),
        ...makeBaseAudit(req, "create"),
      }),
  );

  update = handle(
    HTTP_STATUS.OK,
    "updated",
    "anggota workspace",
    (req) =>
      service.update(reqIdParam(req), {
        ...pick(req.body, ["workspace_id", "user_id", "role_id"]),
        ...(req.body.joined_at !== undefined
          ? { joined_at: new Date(req.body.joined_at) }
          : {}),
        ...makeBaseAudit(req, "update"),
      }),
  );

  delete = handle(
    HTTP_STATUS.OK,
    "deleted",
    "anggota workspace",
    (req) =>
      service.delete(reqIdParam(req), makeBaseAudit(req, "delete")),
  );
}