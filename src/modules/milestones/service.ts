import { Milestone } from "../../database/entities/milestone.entity";
import { notFoundError } from "../../shared/utils/error.util";
import { projectService } from "../projects/service";
import { CreateMilestoneInput, MilestoneListQuery } from "./dto";
import { MilestoneRepository } from "./repository";

export class MilestoneService {
  private readonly repository: MilestoneRepository;

  constructor() {
    this.repository = new MilestoneRepository();
  }

  fetchPagination(query: MilestoneListQuery) {
    return this.repository.fetchPagination(query);
  }

  async findById(id: string): Promise<Milestone> {
    const milestone = await this.repository.findById(id);
    if (!milestone) throw notFoundError("milestone");
    return milestone;
  }

  async create(input: CreateMilestoneInput): Promise<Milestone> {
    await projectService.findById(input.project_id);
    return this.repository.save(this.repository.create(input));
  }

  async update(
    id: string,
    input: Partial<Milestone>,
  ): Promise<Milestone> {
    const milestone = await this.findById(id);
    if (input.project_id !== undefined) {
      await projectService.findById(input.project_id);
      milestone.project_id = input.project_id;
    }
    if (input.title !== undefined) milestone.title = input.title;
    if (input.description !== undefined) {
      milestone.description = input.description;
    }
    if (input.dueDate !== undefined) milestone.dueDate = input.dueDate;
    if (input.status !== undefined) milestone.status = input.status;

    return this.repository.save({
      ...milestone,
      updated_at: input.updated_at ?? milestone.updated_at,
      updated_by: input.updated_by ?? milestone.updated_by,
    });
  }

  async delete(id: string, audit: Partial<Milestone>): Promise<void> {
    const milestone = await this.findById(id);
    await this.repository.softDelete({ ...milestone, ...audit });
  }
}

export const milestoneService = new MilestoneService();