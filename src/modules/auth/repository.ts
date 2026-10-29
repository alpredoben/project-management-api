import { Repository } from 'typeorm';
import { UserGudang } from '../../database/models/UserModel';
import { OpenDataSource } from '../../database/data-source';

export class AuthRepository {
  private get repoUser(): Repository<UserModel> {
    return OpenDataSource.getRepository(UserModel);
  }

}

export const repository = new AuthRepository();
