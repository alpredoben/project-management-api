import { ProjectMember } from "../../database/entities/project_members.entity";
import { existsError, notFoundError } from "../../shared/utils/error.util";
import { projectService } from "../projects/service";
import { CreateProjectMemberInput, ProjectMemberListQuery } from "./dto";
import { ProjectMemberRepository } from "./repository";

export class ProjectMemberService {
  private readonly repository: ProjectMemberRepository;

  constructor() {
    this.repository = new ProjectMemberRepository();
  }

  fetchPagination(query: ProjectMemberListQuery) {
    return this.repository.fetchPagination(query);
  }

  async findById(id: string): Promise<ProjectMember> {
    const member = await this.repository.findById(id);
    if (!member) throw notFoundError("anggota proyek");
    return member;
  }

  async create(input: CreateProjectMemberInput): Promise<ProjectMember> {
    await this.validateReferences(input);
    const existing = await this.repository.findByProjectAndUser(
      input.project_id,
      input.user_id,
    );
    if (existing) {
      if (!existing.deleted_at) {
        throw existsError("anggota proyek");
      }

      if (input.position_id !== undefined) {
        existing.position_id = input.position_id;
      }
      return this.repository.save({
        ...existing,
        deleted_at: null,
        deleted_by: null,
        updated_at: input.updated_at ?? existing.updated_at,
        updated_by: input.updated_by ?? existing.updated_by,
      });
    }

    try {
      return await this.repository.save(this.repository.create(input));
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("anggota proyek");
      }
      throw error;
    }
  }

  async update(
    id: string,
    input: Partial<ProjectMember>,
  ): Promise<ProjectMember> {
    const member = await this.findById(id);
    await this.validateReferences(input);

    const projectId = input.project_id ?? member.project_id;
    const userId = input.user_id ?? member.user_id;
    if (projectId !== member.project_id || userId !== member.user_id) {
      const duplicate = await this.repository.findByProjectAndUser(
        projectId,
        userId,
      );
      if (duplicate && duplicate.id !== member.id) {
        throw existsError("anggota proyek");
      }
    }

    if (input.project_id !== undefined) member.project_id = input.project_id;
    if (input.user_id !== undefined) member.user_id = input.user_id;
    if (input.position_id !== undefined) {
      member.position_id = input.position_id;
    }

    try {
      return await this.repository.save({
        ...member,
        updated_at: input.updated_at ?? member.updated_at,
        updated_by: input.updated_by ?? member.updated_by,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("anggota proyek");
      }
      throw error;
    }
  }

  async delete(id: string, audit: Partial<ProjectMember>): Promise<void> {
    const member = await this.findById(id);
    await this.repository.softDelete({ ...member, ...audit });
  }

  private async validateReferences(
    input: Partial<ProjectMember>,
  ): Promise<void> {
    if (input.project_id !== undefined) {
      await projectService.findById(input.project_id);
    }
    if (
      input.user_id !== undefined &&
      !(await this.repository.findActiveUserById(input.user_id))
    ) {
      throw notFoundError("pengguna aktif");
    }
    if (
      input.position_id !== undefined &&
      input.position_id !== null &&
      !(await this.repository.findPositionById(input.position_id))
    ) {
      throw notFoundError("posisi");
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "driverError" in error &&
      typeof error.driverError === "object" &&
      error.driverError !== null &&
      "code" in error.driverError &&
      ["23505", "ER_DUP_ENTRY", 1062].includes(
        error.driverError.code as string | number,
      )
    );
  }
}

export const projectMemberService = new ProjectMemberService();