import { HTTP_STATUS } from "../../shared/constants";
import {
  handle,
  handleList,
  pick,
} from "../../shared/utils/controller.util";
import { makeBaseAudit, reqIdParam } from "../../shared/utils/helper";
import {
  PROJECT_MEMBER_SORT_FIELDS,
  ProjectMemberSortField,
} from "./dto";
import { projectMemberService as service } from "./service";

export class ProjectMemberController {
  fetchPagination = handleList<ProjectMemberSortField>(
    "anggota proyek",
    PROJECT_MEMBER_SORT_FIELDS,
    "created_at",
    (query) => service.fetchPagination(query),
  );

  findById = handle(HTTP_STATUS.OK, "retrieved", "anggota proyek", (req) =>
    service.findById(reqIdParam(req)),
  );

  create = handle(HTTP_STATUS.CREATED, "created", "anggota proyek", (req) =>
    service.create({
      project_id: req.body.project_id,
      user_id: req.body.user_id,
      ...(req.body.position_id !== undefined
        ? { position_id: req.body.position_id }
        : {}),
      ...makeBaseAudit(req, "create"),
    }),
  );

  update = handle(HTTP_STATUS.OK, "updated", "anggota proyek", (req) =>
    service.update(reqIdParam(req), {
      ...pick(req.body, ["project_id", "userId", "position_id"]),
      ...makeBaseAudit(req, "update"),
    }),
  );

  delete = handle(HTTP_STATUS.OK, "deleted", "anggota proyek", (req) =>
    service.delete(reqIdParam(req), makeBaseAudit(req, "delete")),
  );
}