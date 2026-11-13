import { Permission } from "../../database/entities/permission.entity";
import { existsError, notFoundError } from "../../shared/utils/error.util";
import {
  CreatePermissionDto,
  PermissionListQuery,
  UpdatePermissionDto,
} from "./dto";
import { PermissionRepository } from "./repository";

export class PermissionService {
  private readonly repository: PermissionRepository;

  constructor() {
    this.repository = new PermissionRepository();
  }

  list(query: PermissionListQuery) {
    return this.repository.findAll(query);
  }

  async findById(id: string): Promise<Permission> {
    const permission = await this.repository.findById(id);
    if (!permission) {
      throw notFoundError("permission");
    }
    return permission;
  }

  async create(input: CreatePermissionDto): Promise<Permission> {
    if (await this.repository.findByName(input.name)) {
      throw existsError("permission");
    }

    const permission = this.repository.create({
      name: input.name,
      module: input.module,
      description: input.description ?? null,
    });

    try {
      return await this.repository.save(permission);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("permission");
      }
      throw error;
    }
  }

  async update(id: string, input: UpdatePermissionDto): Promise<Permission> {
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
      return await this.repository.save(permission);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw existsError("permission");
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const permission = await this.findById(id);
    await this.repository.softDelete(permission);
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