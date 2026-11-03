import { randomUUID } from "crypto";
import { EntityManager } from "typeorm";
import { Role } from "../entities/role.entity";

const ROLES = [
  { name: "Super Admin", slug: "super-admin" },
  { name: "Contributor", slug: "contributor" },
  { name: "Project Owner", slug: "project-owner" },
  { name: "Developer", slug: "developer" },
] as const;

export class RolesSeeder {
  public async seed(manager: EntityManager): Promise<Role[]> {
    const repository = manager.getRepository(Role);
    const roles: Role[] = [];

    for (const seedRole of ROLES) {
      const existing = await repository.findOne({
        where: { slug: seedRole.slug },
        withDeleted: true,
      });

      const role = repository.create({
        ...existing,
        id: existing?.id ?? randomUUID(),
        ...seedRole,
        deleted_at: null,
        deleted_by: null,
      });
      roles.push(await repository.save(role));
    }

    return roles;
  }
}

export const rolesSeeder = new RolesSeeder();
