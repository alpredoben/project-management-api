import {
  In_ENTITY_Menu,
  In_ENTITY_Permission,
  In_ENTITY_Role,
  In_ENTITY_User,
} from "./entity.interface";

export type In_AUTH_TokenType = "access" | "refresh";

export interface In_AUTH_JwtPayload extends Pick<
  In_ENTITY_User,
  "id" | "email" | "name"
> {
  token_type: In_AUTH_TokenType;
  remember_me?: boolean;
}

export interface In_AUTH_UserProfile extends Pick<
  In_ENTITY_User,
  "id" | "name" | "email" | "phone" | "is_active"
> {
  roles: Pick<In_ENTITY_Role, "id" | "name" | "slug">[];
  role_menu_permissions:
    | [
        {
          permission: Pick<In_ENTITY_Permission, "id" | "name" | "slug">;
          menu: Pick<
            In_ENTITY_Menu,
            | "id"
            | "slug"
            | "name"
            | "icon"
            | "parent_id"
            | "order_number"
            | "path"
          >;
        },
      ]
    | [];
}

export interface In_AUTH_SignInResponse {
  token_type: "Bearer";
  access_token: string;
  refresh_token: string;
}

export interface In_AUTH_RefreshTokenResponse {
  token_type: "Bearer";
  access_token: string;
  refresh_token: string;
}
