import { HTTP_STATUS } from "../../shared/constants";
import {
  AppError,
  existsError,
  notFoundError,
} from "../../shared/utils/error.util";
import {
  In_DTO_CreateProjectType,
  In_DTO_ProjectType,
  In_DTO_ProjectTypeListQuery,
  In_DTO_UpdateProjectType,
  T_Audit,
} from "./dto";
import { repository } from "./repository";

const LABEL = "Tipe project";

export class ProjectTypeService {
  public async store(
    { type_name, sort_order }: In_DTO_CreateProjectType,
    audit: T_Audit,
  ): Promise<In_DTO_ProjectType> {
    await this.assertAvailable({ type_name, sort_order });
    return repository.create({ type_name, sort_order, ...audit });
  }

  public async fetchById(id: string): Promise<In_DTO_ProjectType> {
    const result = await repository.findById(id);
    if (!result) {
      throw notFoundError(LABEL);
    }
    return result;
  }

  public async update(
    id: string,
    fields: In_DTO_UpdateProjectType,
    audit: T_Audit,
  ): Promise<In_DTO_ProjectType> {
    await this.assertAvailable(fields, id);

    const updated = await repository.update(id, { ...fields, ...audit });
    if (!updated) {
      throw notFoundError(LABEL);
    }
    return updated;
  }

  public async delete(id: string, audit: T_Audit): Promise<void> {
    if (await repository.isInUse(id)) {
      throw new AppError(
        "Tipe project masih digunakan oleh project.",
        HTTP_STATUS.CONFLICT,
      );
    }
    if (!(await repository.softDelete(id, audit))) {
      throw notFoundError(LABEL);
    }
  }

  public fetchPagination(query: In_DTO_ProjectTypeListQuery) {
    return repository.fetchPagination(query);
  }

  /** Nama dan no. urut harus unik; keduanya dicek dalam satu query. */
  private async assertAvailable(
    fields: In_DTO_UpdateProjectType,
    exceptId?: string,
  ): Promise<void> {
    const { name_taken, sort_order_taken } = await repository.findConflicts(
      fields,
      exceptId,
    );
    if (name_taken) {
      throw existsError("Nama tipe project");
    }
    if (sort_order_taken) {
      throw existsError("No. urut tipe project");
    }
  }
}

export const service = new ProjectTypeService();
