import { Workspace } from "../../database/entities/workspace.entity";
import { HTTP_STATUS } from "../../shared/constants";
import {
  AppError,
  existsError,
  notFoundError,
} from "../../shared/utils/error.util";
import i18next from "i18next";
import { WorkspaceListQuery } from "./dto";
import { WorkspaceRepository } from "./repository";

export class WorkspaceService {
  private readonly repository: WorkspaceRepository;

  constructor() {
    this.repository = new WorkspaceRepository();
  }

  fetchPagination(query: WorkspaceListQuery) {
    return this.repository.fetchPagination(query);
  }

  async findById(id: string): Promise<Workspace> {
    const workspace = await this.repository.findById(id);
    if (!workspace) throw notFoundError("workspace");
    return workspace;
  }

  async create(
    input: Partial<Workspace> & Pick<Workspace, "name" | "slug">,
  ): Promise<Workspace> {
    if (!input.slug) {
      throw new AppError(
        i18next.t("error.default.invalid_workspace_name"),
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (await this.repository.findBySlug(input.slug)) {
      throw existsError("workspace");
    }

    try {
      return await this.repository.save(this.repository.create(input));
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("workspace");
      }
      throw error;
    }
  }

  async update(id: string, input: Partial<Workspace>): Promise<Workspace> {
    const workspace = await this.findById(id);

    if (input.name !== undefined && !input.slug) {
      throw new AppError(
        i18next.t("error.default.invalid_workspace_name"),
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (
      input.slug !== undefined &&
      input.slug !== workspace.slug &&
      (await this.repository.findBySlug(input.slug))
    ) {
      throw existsError("workspace");
    }

    if (input.name !== undefined) workspace.name = input.name;
    if (input.slug !== undefined) workspace.slug = input.slug;
    if (input.logo_url !== undefined) workspace.logo_url = input.logo_url;

    try {
      return await this.repository.save({
        ...workspace,
        updated_at: input.updated_at ?? workspace.updated_at,
        updated_by: input.updated_by ?? workspace.updated_by,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("workspace");
      }
      throw error;
    }
  }

  async delete(id: string, audit: Partial<Workspace>): Promise<void> {
    const workspace = await this.findById(id);
    await this.repository.softDelete({ ...workspace, ...audit });
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

export const workspaceService = new WorkspaceService();