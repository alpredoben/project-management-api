import { randomUUID } from "crypto";
import { EntityManager } from "typeorm";
import { Role } from "../entities/role.entity";
import { createSlug } from "../../shared/utils/helper";

const ROLES = [
  { name: "Super Admin" },
  { name: "Project Manager" },
  { name: "Contributor" },
] as const;


export class RolesSeeder {
  public async seed(manager: EntityManager): Promise<void> {
    const repository = manager.getRepository(Role);

    for (const r of ROLES) {
      const existing = await repository.findOne({
        where: { slug: createSlug(r.name) },
        withDeleted: true,
      });

      if(!existing) {
        const role = repository.create({
          id: randomUUID(),
          name: r.name,
          slug: createSlug(r.name)
        })

        await repository.save(role);
      }
      else {
        await repository.update({id: existing.id}, {
          ...existing,
          name: r.name,
          slug: createSlug(r.name)
        });
      }
    }

  }
}

export const rolesSeeder = new RolesSeeder();