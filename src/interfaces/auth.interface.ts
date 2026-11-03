import { Permission } from "../database/entities";
import type { Menu } from "../database/entities/menu.entity";
import type { Role } from "../database/entities/role.entity";

export type In_AUTH_TokenType = "access" | "refresh";

export interface In_AUTH_JwtPayload {
  id: string;
  email: string;
  name?: string | null;
  token_type: In_AUTH_TokenType;
  remember_me?: boolean;
}

export interface In_AUTH_Permission extends Pick<
  Permission,
  "id" | "name" | "slug"
> {}

export interface In_AUTH_Role extends Pick<Role, "id" | "name" | "slug"> {
  permissions: In_AUTH_Permission[];
}

export interface In_AUTH_MenuParent extends Omit<
  Partial<Menu>,
  "parent" | "childrens"
> {
  parent: In_AUTH_MenuParent | null;
  children: In_AUTH_MenuParent[];
}

export type In_AUTH_Menu = Omit<In_AUTH_MenuParent, "children"> & {
  children: In_AUTH_Menu[];
};

export interface In_AUTH_RoleMenuPermission {
  role: Pick<In_AUTH_Role, "id" | "name" | "slug">;
  menu: In_AUTH_Menu;
}

export interface In_AUTH_UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  is_active: boolean;
  is_login: boolean;
  last_login_at: Date | null;
  roles: In_AUTH_Role[];
  permissions: In_AUTH_Permission[];
  role_menu_permission: In_AUTH_RoleMenuPermission[];
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
