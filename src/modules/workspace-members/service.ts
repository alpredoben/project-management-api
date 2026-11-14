import { WorkspaceMember } from "../../database/entities/workspace_members.entity";
import { notFoundError } from "../../shared/utils/error.util";
import { WorkspaceMemberListQuery } from "./dto";
import { WorkspaceMemberRepository } from "./repository";

export class WorkspaceMemberService {
  private readonly repository: WorkspaceMemberRepository;

  constructor() {
    this.repository = new WorkspaceMemberRepository();
  }

  fetchPagination(query: WorkspaceMemberListQuery) {
    return this.repository.fetchPagination(query);
  }

  async findById(id: string): Promise<WorkspaceMember> {
    const member = await this.repository.findById(id);
    if (!member) throw notFoundError("anggota workspace");
    return member;
  }

  create(input: Partial<WorkspaceMember>): Promise<WorkspaceMember> {
    return this.repository.save(this.repository.create(input));
  }

  async update(
    id: string,
    input: Partial<WorkspaceMember>,
  ): Promise<WorkspaceMember> {
    const member = await this.findById(id);

    if (input.workspace_id !== undefined) {
      member.workspace_id = input.workspace_id;
    }
    if (input.user_id !== undefined) member.user_id = input.user_id;
    if (input.position_id !== undefined) member.position_id = input.position_id;
    if (input.joined_at !== undefined) member.joined_at = input.joined_at;

    return this.repository.save({
      ...member,
      updated_at: input.updated_at ?? member.updated_at,
      updated_by: input.updated_by ?? member.updated_by,
    });
  }

  async delete(id: string, audit: Partial<WorkspaceMember>): Promise<void> {
    const member = await this.findById(id);
    await this.repository.softDelete({ ...member, ...audit });
  }
}

export const workspaceMemberService = new WorkspaceMemberService();