import { In_ENTITY_Permission, In_ENTITY_Role, In_ENTITY_User } from "./entity.interface";

export interface In_AUTH_JwtPayload extends Partial<In_ENTITY_User> {
  remember_me?: boolean | false;
  [key: string]: any;
}

export interface In_AUTH_SignInResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
}

export interface In_AUTH_RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}
