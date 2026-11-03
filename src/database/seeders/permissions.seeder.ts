import { randomUUID } from "crypto";
import { EntityManager } from "typeorm";
import { Permission } from "../entities/permission.entity";

const PERMISSIONS = [
  "create",
  "update",
  "delete",
  "view",
  "import",
  "export",
  "download",
  "approve",
  "reject",
] as const;

export class PermissionsSeeder {
  public async seed(manager: EntityManager): Promise<Permission[]> {
    const repository = manager.getRepository(Permission);
    const permissions: Permission[] = [];

    for (const slug of PERMISSIONS) {
      const existing = await repository.findOne({
        where: { slug },
        withDeleted: true,
      });
      const permission = repository.create({
        ...existing,
        id: existing?.id ?? randomUUID(),
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug,
        deleted_at: null,
        deleted_by: null,
      });
      permissions.push(await repository.save(permission));
    }

    return permissions;
  }
}

export const permissionsSeeder = new PermissionsSeeder();
