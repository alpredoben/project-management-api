export interface BaseEntity {
    created_at: Date;
    created_by: string | null;
    updated_at?: Date | null;
    updated_by?: string | null;  
    deleted_at?: Date | null;
    deleted_by?: string | null;
}

export interface In_ENTITY_Role extends BaseEntity {
    id: string;
    name: string;
    slug: string;
    description: string;
    users?: In_ENTITY_User[];
    role_menu_permissions?: In_ENTITY_RoleMenuPermission[];
}

export interface In_ENTITY_User extends BaseEntity {
    id: string;
    name: string;
    email: string;
    phone: string;
    is_active: boolean;
    roles?: In_ENTITY_Role[];
}

export interface In_ENTITY_Permission extends BaseEntity {
    id: string;
    name: string;
    slug: string;
    description: string;
}

export interface In_ENTITY_Menu extends BaseEntity {
    id: string;
    name: string;
    slug: string;
    path?: string | null;
    description?: string | null;
    icon?: string | null;
    parent_id?: string | null;
    order_number?: number | null;
    children?: In_ENTITY_Menu[];
}


export interface In_ENTITY_RoleMenuPermission extends BaseEntity {
    id: string;
    role_id: string;
    menu_id: string;
    permission_id: string
    role?: In_ENTITY_Role;
    menu?: In_ENTITY_Menu;
    permission?: In_ENTITY_Permission; 
}


