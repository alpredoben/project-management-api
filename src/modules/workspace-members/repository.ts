import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { WorkspaceMember } from "../../database/entities/workspace_members.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { WorkspaceMemberListQuery } from "./dto";

export class WorkspaceMemberRepository {
  private readonly workspaceMembers: Repository<WorkspaceMember>;

  constructor() {
    this.workspaceMembers = OpenDataSource.getRepository(WorkspaceMember);
  }

  async fetchPagination(
    query: WorkspaceMemberListQuery,
  ): Promise<{ data: WorkspaceMember[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.workspaceMembers
      .createQueryBuilder("workspaceMember")
      .select([
        "workspaceMember.id",
        "workspaceMember.workspace_id",
        "workspaceMember.user_id",
        "workspaceMember.role_id",
        "workspaceMember.joined_at",
        "workspaceMember.created_at",
        "workspaceMember.updated_at",
      ])
      .leftJoin("workspaceMember.workspace", "workspace")
      .leftJoin("workspaceMember.user", "user")
      .leftJoin("workspaceMember.role", "role")
      .addSelect([
        "workspace.id",
        "workspace.name",
        "workspace.slug",
        "workspace.logo_url",
        "user.id",
        "user.name",
        "user.avatarUrl",
        "role.id",
        "role.name",
        "role.slug",
      ]);

    if (query.search) {
      queryBuilder.andWhere(
        `(
          CAST(workspaceMember.workspace_id AS TEXT) ILIKE :search
          OR CAST(workspaceMember.user_id AS TEXT) ILIKE :search
          OR CAST(workspaceMember.role_id AS TEXT) ILIKE :search
        )`,
        { search: `%${query.search}%` },
      );
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(`workspaceMember.${query.sortBy}`, query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  findById(id: string): Promise<WorkspaceMember | null> {
    return this.workspaceMembers.findOne({ where: { id } });
  }

  create(data: Partial<WorkspaceMember>): WorkspaceMember {
    return this.workspaceMembers.create(data);
  }

  save(member: WorkspaceMember): Promise<WorkspaceMember> {
    return this.workspaceMembers.save(member);
  }

  softDelete(member: WorkspaceMember): Promise<WorkspaceMember> {
    return this.workspaceMembers.save(member);
  }
}