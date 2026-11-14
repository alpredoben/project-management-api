import { Permission } from "../../database/entities/permission.entity";
import { existsError, notFoundError } from "../../shared/utils/error.util";
import {
  PermissionListQuery,
} from "./dto";
import { PermissionRepository } from "./repository";

export class PermissionService {
  private readonly repository: PermissionRepository;

  constructor() {
    this.repository = new PermissionRepository();
  }

  fetchPagination(query: PermissionListQuery) {
    return this.repository.fetchPagination(query);
  }

  async findById(id: string): Promise<Permission> {
    const permission = await this.repository.findById(id);
    if (!permission) {
      throw notFoundError("permission");
    }
    return permission;
  }

  async create(input: Partial<Permission>): Promise<Permission> {
    if (input.name !== undefined) {
      const existRow = await this.repository.findByName(input.name);
      if (existRow) {
        throw existsError("permission");
      }
    }

    const permission = this.repository.create(input);

    try {
      return await this.repository.save(permission);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("permission");
      }
      throw error;
    }
  }

  async update(id: string, input: Partial<Permission>): Promise<Permission> {
    const permission = await this.findById(id);

    if (
      input.name !== undefined &&
      input.name !== permission.name &&
      (await this.repository.findByName(input.name))
    ) {
      throw existsError("permission");
    }

    if (input.name !== undefined) permission.name = input.name;
    if (input.module !== undefined) permission.module = input.module;
    if (input.description !== undefined) {
      permission.description = input.description;
    }

    try {
      return await this.repository.save({
        ...permission,
        updated_at: input.updated_at ?? permission.updated_at,
        updated_by: input.updated_by ?? permission.updated_by
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("permission");
      }
      throw error;
    }
  }

  async delete(id: string, payload: Partial<Permission>): Promise<void> {
    const permission = await this.findById(id);
    if(!permission) {
      throw notFoundError('permission') 
    }
    await this.repository.softDelete({...permission, ...payload});
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "driverError" in error &&
      typeof error.driverError === "object" &&
      error.driverError !== null &&
      "code" in error.driverError &&
      error.driverError.code === "23505"
    );
  }
}

export const permissionService = new PermissionService();