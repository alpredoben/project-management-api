import { randomUUID } from "crypto";
import { EntityManager } from "typeorm";
import { createSlug } from "../../shared/utils/helper";
import { Position } from "../entities/position.entity";

const DATA = [
  { name: "Owner" },
  { name: "Leader" },
  { name: "Contributor" },
  { name: "Personal Priority" },
] as const;


export class PositionSeeder {
  public async seed(manager: EntityManager): Promise<void> {
    const repository = manager.getRepository(Position);

    for (const r of DATA) {
      const existing = await repository.findOne({
        where: { slug: createSlug(r.name) },
        withDeleted: true,
      });

      if(!existing) {
        const result = repository.create({
          id: randomUUID(),
          name: r.name,
          slug: createSlug(r.name)
        })

        await repository.save(result);
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

export const positionSeeder = new PositionSeeder();