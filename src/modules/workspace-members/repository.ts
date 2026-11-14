import { Repository, SelectQueryBuilder } from "typeorm";
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
    return this.fetchPaginated(this.createPaginationQuery(query), query);
  }

  async fetchByWorkspaceId(
    workspaceId: string,
    query: WorkspaceMemberListQuery,
  ): Promise<{ data: WorkspaceMember[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.createPaginationQuery(query).andWhere(
      "workspace.id = :workspaceId",
      { workspaceId },
    );

    return this.fetchPaginated(queryBuilder, query);
  }

  async addMembers(
    workspaceId: string,
    userIds: string[],
    audit: Partial<WorkspaceMember>,
  ): Promise<void> {
    const values = [...new Set(userIds)].map((user_id) => ({
      workspace_id: workspaceId,
      user_id,
      created_by: audit.created_by,
      updated_by: audit.updated_by,
      updated_at: audit.updated_at,
    }));

    await this.workspaceMembers
      .createQueryBuilder()
      .insert()
      .into(WorkspaceMember)
      .values(values)
      .orUpdate(
        ["deleted_at", "deleted_by", "updated_at", "updated_by"],
        ["workspace_id", "user_id"],
      )
      .execute();
  }

  private createPaginationQuery(
    query: WorkspaceMemberListQuery,
  ): SelectQueryBuilder<WorkspaceMember> {
    const queryBuilder = this.workspaceMembers
      .createQueryBuilder("workspaceMember")
      .select([
        "workspaceMember.id",
        "workspaceMember.workspace_id",
        "workspaceMember.user_id",
        "workspaceMember.position_id",
        "workspaceMember.joined_at",
        "workspaceMember.created_at",
        "workspaceMember.updated_at",
      ])
      .leftJoin("workspaceMember.workspace", "workspace")
      .leftJoin("workspaceMember.user", "user")
      .leftJoin("workspaceMember.position", "position")
      .addSelect([
        "workspace.id",
        "workspace.name",
        "workspace.slug",
        "workspace.logo_url",
        "user.id",
        "user.name",
        "user.avatarUrl",
        "position.id",
        "position.name",
        "position.slug",
      ]);

    if (query.search) {
      queryBuilder.andWhere(
        "(LOWER(user.name) LIKE LOWER(:search) OR LOWER(position.name) LIKE LOWER(:search))",
        { search: `%${query.search}%` },
      );
    }

    return queryBuilder;
  }

  private async fetchPaginated(
    queryBuilder: SelectQueryBuilder<WorkspaceMember>,
    query: WorkspaceMemberListQuery,
  ): Promise<{ data: WorkspaceMember[]; meta: In_API_AttributMeta }> {
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