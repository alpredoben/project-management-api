import { Repository } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { Position } from "../../database/entities/position.entity";
import { ProjectMember } from "../../database/entities/project_members.entity";
import { User } from "../../database/entities/user.entity";
import { In_API_AttributMeta } from "../../interfaces/responseApi.interface";
import { toPaginationResult } from "../../shared/utils/pagination.util";
import { ProjectMemberListQuery } from "./dto";

const SORT_COLUMNS = {
  project_id: "projectMember.project_id",
  user_id: "projectMember.userId",
  position_id: "projectMember.position_id",
  created_at: "projectMember.created_at",
  updated_at: "projectMember.updated_at",
} as const;

export class ProjectMemberRepository {
  private readonly projectMembers: Repository<ProjectMember>;
  private readonly users: Repository<User>;
  private readonly positions: Repository<Position>;

  constructor() {
    this.projectMembers = OpenDataSource.getRepository(ProjectMember);
    this.users = OpenDataSource.getRepository(User);
    this.positions = OpenDataSource.getRepository(Position);
  }

  async fetchPagination(
    query: ProjectMemberListQuery,
  ): Promise<{ data: ProjectMember[]; meta: In_API_AttributMeta }> {
    const queryBuilder = this.projectMembers
      .createQueryBuilder("projectMember")
      .select([
        "projectMember.id",
        "projectMember.project_id",
        "projectMember.userId",
        "projectMember.position_id",
        "projectMember.created_at",
        "projectMember.updated_at",
      ])
      .leftJoin("projectMember.project", "project")
      .leftJoin("projectMember.user", "user")
      .leftJoin("projectMember.position", "position")
      .addSelect([
        "project.id",
        "project.name",
        "project.key",
        "user.id",
        "user.name",
        "user.avatarUrl",
        "position.id",
        "position.name",
        "position.slug",
      ]);

    if (query.search) {
      queryBuilder.andWhere(
        `(
          LOWER(project.name) LIKE LOWER(:search)
          OR LOWER(project.key) LIKE LOWER(:search)
          OR LOWER(user.name) LIKE LOWER(:search)
          OR LOWER(position.name) LIKE LOWER(:search)
        )`,
        { search: `%${query.search}%` },
      );
    }

    const [data, totalItems] = await queryBuilder
      .orderBy(SORT_COLUMNS[query.sortBy], query.orderBy)
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return toPaginationResult(data, query.page, query.limit, totalItems);
  }

  findById(id: string): Promise<ProjectMember | null> {
    return this.projectMembers.findOne({ where: { id } });
  }

  findByProjectAndUser(
    projectId: string,
    user_id: string,
  ): Promise<ProjectMember | null> {
    return this.projectMembers.findOne({
      where: { project_id: projectId, user_id },
      withDeleted: true,
      select: [
        "id",
        "project_id",
        "user_id",
        "position_id",
        "updated_at",
        "updated_by",
        "deleted_at",
        "deleted_by",
      ],
    });
  }

  findActiveUserById(id: string): Promise<User | null> {
    return this.users.findOne({
      where: { id, isActive: true },
      select: ["id"],
    });
  }

  findPositionById(id: string): Promise<Position | null> {
    return this.positions.findOne({
      where: { id },
      select: ["id"],
    });
  }

  create(data: Partial<ProjectMember>): ProjectMember {
    return this.projectMembers.create(data);
  }

  save(member: ProjectMember): Promise<ProjectMember> {
    return this.projectMembers.save(member);
  }

  softDelete(member: ProjectMember): Promise<ProjectMember> {
    return this.projectMembers.save(member);
  }
}