import { AppError } from '../../shared/utils/error.util';
import { repository } from './repository';
import { JwtService } from '../../pkg/jwt';

import { PasswordUtil } from '../../shared/utils/password.util';

import i18next from '../../lang/translation';
import { logger } from '../../pkg/loki';

export class AuthService {
  
}

export const service = new AuthService();
