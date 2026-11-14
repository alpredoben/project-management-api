import { Role } from "../../database/entities/role.entity";
import { existsError, notFoundError } from "../../shared/utils/error.util";
import { createSlug } from "../../shared/utils/helper";
import {
  RoleListQuery,
} from "./dto";
import { RoleRepository } from "./repository";

export class RoleService {
  private readonly repository: RoleRepository;

  constructor() {
    this.repository = new RoleRepository();
  }

  fetchPagination(query: RoleListQuery) {
    return this.repository.fetchPagination(query);
  }

  async findById(id: string): Promise<Role> {
    const role = await this.repository.findById(id);
    if (!role) throw notFoundError("role");
    return role;
  }

  async create(input: Partial<Role>): Promise<Role> {
    const existRow = input?.slug
      ? await this.repository.findBySlug(input.slug)
      : input.name !== undefined
        ? await this.repository.findByName(input.name)
        : null;

    if (existRow) {
      throw existsError("role");
    }

    const role = this.repository.create(input);

    try {
      return await this.repository.save(role);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) throw existsError("role");
      throw error;
    }
  }

  async update(id: string, input: Partial<Role>): Promise<Role> {
    const slug = createSlug(input.name)
    const role = await this.findById(id);

    if (
      input.name !== undefined &&
      input.name !== role.name &&
      (await this.repository.findByName(input.name))
    ) {
      throw existsError("role");
    }
    if (await this.repository.findBySlug(slug)) {
      throw existsError("role");
    }

    if (input.name !== undefined) {
      role.name = input.name;
      role.slug = slug;
    }
    
    if (input.description !== undefined) role.description = input.description;

    try {
      return await this.repository.save({
        ...role,
        updated_at: input.updated_at ?? role.updated_at,
        updated_by: input.updated_by ?? role.updated_by,
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) throw existsError("role");
      throw error;
    }
  }

  async setPermissions(id: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findById(id);
    const permissions = await this.repository.findPermissionsByIds(permissionIds);
    if (permissions.length !== new Set(permissionIds).size) {
      throw notFoundError("permission");
    }

    role.permissions = permissions;
    return this.repository.save(role);
  }

  async delete(id: string, payload: Partial<Role>): Promise<void> {
    let role = await this.findById(id);

    if(!role) {
      throw notFoundError('role')
    }
    role = {...role, ...payload}
    await this.repository.softDelete(role);
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "driverError" in error &&
      typeof error.driverError === "object" &&
      error.driverError !== null &&
      "code" in error.driverError &&
      ["23505", "ER_DUP_ENTRY", 1062].includes(error.driverError.code as string | number)
    );
  }
}

export const roleService = new RoleService();