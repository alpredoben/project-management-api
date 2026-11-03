import { IsNull } from "typeorm";
import { OpenDataSource } from "../../database/data-source";
import { User } from "../../database/entities/user.entity";
import {
  In_AUTH_Permission,
  In_AUTH_Role,
  In_AUTH_RoleMenuPermission,
} from "../../interfaces/auth.interface";
import { SCHEMA_NAMES } from "../../shared/constants/schemaNames";

interface RolePermissionResult {
  roles: In_AUTH_Role[];
  permissions: In_AUTH_Permission[];
}

export class AuthRepository {
  private get repoUser() {
    return OpenDataSource.getRepository(User);
  }

  public findByEmail(email: string): Promise<User | null> {
    return this.repoUser
      .createQueryBuilder("user")
      .where("LOWER(user.email) = :email", { email: email.toLowerCase() })
      .getOne();
  }

  public findActiveById(id: string): Promise<User | null> {
    return this.repoUser.findOne({
      where: { id, is_active: true, deleted_at: IsNull() },
    });
  }

  public async findRolePermissions(
    userId: string,
  ): Promise<RolePermissionResult> {
    const [result] = (await OpenDataSource.query(
      `
        WITH active_roles AS (
          SELECT DISTINCT role.id, role.name, role.slug
          FROM ${SCHEMA_NAMES.USER_ROLES} user_role
          INNER JOIN ${SCHEMA_NAMES.ROLES} role
            ON role.id = user_role.role_id
           AND role.deleted_at IS NULL
          WHERE user_role.user_id = $1
            AND user_role.deleted_at IS NULL
        ),
        active_role_permissions AS (
          SELECT DISTINCT
            role.id AS role_id,
            permission.id,
            permission.name,
            permission.slug
          FROM active_roles role
          INNER JOIN ${SCHEMA_NAMES.ROLE_PERMISSIONS} role_permission
            ON role_permission.role_id = role.id
           AND role_permission.deleted_at IS NULL
          INNER JOIN ${SCHEMA_NAMES.PERMISSIONS} permission
            ON permission.id = role_permission.permission_id
           AND permission.deleted_at IS NULL
        ),
        role_json AS (
          SELECT
            role.id,
            role.name,
            role.slug,
            COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', permission.id,
                    'name', permission.name,
                    'slug', permission.slug
                  )
                  ORDER BY permission.name, permission.id
                )
                FROM active_role_permissions permission
                WHERE permission.role_id = role.id
              ),
              '[]'::jsonb
            ) AS permissions
          FROM active_roles role
        )
        SELECT
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', role.id,
                  'name', role.name,
                  'slug', role.slug,
                  'permissions', role.permissions
                )
                ORDER BY role.name, role.id
              )
              FROM role_json role
            ),
            '[]'::jsonb
          ) AS roles,
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', permission.id,
                  'name', permission.name,
                  'slug', permission.slug
                )
                ORDER BY permission.name, permission.id
              )
              FROM (
                SELECT DISTINCT id, name, slug
                FROM active_role_permissions
              ) permission
            ),
            '[]'::jsonb
          ) AS permissions
      `,
      [userId],
    )) as RolePermissionResult[];

    if (!result) {
      throw new Error("Role permission query returned no result.");
    }

    return result;
  }

  public async findRoleMenuPermissions(
    userId: string,
  ): Promise<In_AUTH_RoleMenuPermission[]> {
    const [result] = (await OpenDataSource.query(
      `
        WITH RECURSIVE
        assignments AS (
          SELECT DISTINCT
            role.id AS role_id,
            role.name AS role_name,
            role.slug AS role_slug,
            menu.id AS menu_id,
            menu.name AS menu_name,
            menu.order_number AS menu_order_number
          FROM ${SCHEMA_NAMES.USER_ROLES} user_role
          INNER JOIN ${SCHEMA_NAMES.ROLES} role
            ON role.id = user_role.role_id
           AND role.deleted_at IS NULL
          INNER JOIN ${SCHEMA_NAMES.ROLE_MENU_PERMISSIONS} role_menu_permission
            ON role_menu_permission.role_id = role.id
           AND role_menu_permission.deleted_at IS NULL
          INNER JOIN ${SCHEMA_NAMES.PERMISSIONS} permission
            ON permission.id = role_menu_permission.permission_id
           AND permission.deleted_at IS NULL
          INNER JOIN ${SCHEMA_NAMES.MENUS} menu
            ON menu.id = role_menu_permission.menu_id
           AND menu.deleted_at IS NULL
          WHERE user_role.user_id = $1
            AND user_role.deleted_at IS NULL
        ),
        menu_ranked AS (
          SELECT
            menu.id,
            menu.name,
            menu.slug,
            menu.icon,
            menu.parent_id,
            menu.order_number,
            row_number() OVER (
              PARTITION BY menu.parent_id
              ORDER BY menu.order_number, menu.name, menu.id
            ) AS sibling_order
          FROM ${SCHEMA_NAMES.MENUS} menu
          WHERE menu.deleted_at IS NULL
        ),
        menu_hierarchy AS (
          SELECT
            menu.id,
            menu.name,
            menu.slug,
            menu.icon,
            menu.parent_id,
            menu.order_number,
            menu.sibling_order,
            NULL::jsonb AS parent_json,
            ARRAY[menu.id] AS ancestry
          FROM menu_ranked menu
          WHERE menu.parent_id IS NULL
             OR NOT EXISTS (
               SELECT 1
               FROM menu_ranked parent
               WHERE parent.id = menu.parent_id
             )

          UNION ALL

          SELECT
            child.id,
            child.name,
            child.slug,
            child.icon,
            child.parent_id,
            child.order_number,
            child.sibling_order,
            jsonb_build_object(
              'id', parent.id,
              'name', parent.name,
              'slug', parent.slug,
              'icon', parent.icon,
              'order_number', parent.order_number,
              'parent', parent.parent_json,
              'children', '[]'::jsonb
            ),
            parent.ancestry || child.id
          FROM menu_hierarchy parent
          INNER JOIN menu_ranked child ON child.parent_id = parent.id
          WHERE NOT child.id = ANY(parent.ancestry)
        ),
        menu_subtree AS (
          SELECT
            assignment.role_id,
            assignment.menu_id AS assigned_menu_id,
            assignment.role_name,
            assignment.role_slug,
            assignment.menu_order_number,
            assignment.menu_name,
            menu.id,
            menu.name,
            menu.slug,
            menu.icon,
            menu.order_number,
            menu.parent_json,
            ARRAY[]::integer[] AS order_path,
            ARRAY[]::text[] AS json_path
          FROM assignments assignment
          INNER JOIN menu_hierarchy menu ON menu.id = assignment.menu_id

          UNION ALL

          SELECT
            parent.role_id,
            parent.assigned_menu_id,
            parent.role_name,
            parent.role_slug,
            parent.menu_order_number,
            parent.menu_name,
            child.id,
            child.name,
            child.slug,
            child.icon,
            child.order_number,
            child.parent_json,
            parent.order_path || child.sibling_order::integer,
            parent.json_path || ARRAY[
              'children',
              (child.sibling_order - 1)::integer::text
            ]
          FROM menu_subtree parent
          INNER JOIN menu_hierarchy child ON child.parent_id = parent.id
        ),
        ordered_subtree AS (
          SELECT
            subtree.*,
            row_number() OVER (
              PARTITION BY subtree.role_id, subtree.assigned_menu_id
              ORDER BY subtree.order_path
            ) AS step_number
          FROM menu_subtree subtree
        ),
        tree_fold AS (
          SELECT
            subtree.role_id,
            subtree.assigned_menu_id,
            subtree.step_number,
            subtree.order_path,
            subtree.json_path,
            jsonb_build_object(
              'id', subtree.id,
              'name', subtree.name,
              'slug', subtree.slug,
              'icon', subtree.icon,
              'order_number', subtree.order_number,
              'parent', subtree.parent_json,
              'children', '[]'::jsonb
            ) AS tree
          FROM ordered_subtree subtree
          WHERE subtree.step_number = 1

          UNION ALL

          SELECT
            current_tree.role_id,
            current_tree.assigned_menu_id,
            next_node.step_number,
            next_node.order_path,
            next_node.json_path,
            jsonb_set(
              current_tree.tree,
              COALESCE(
                next_node.json_path[
                  1:cardinality(next_node.json_path) - 2
                ],
                ARRAY[]::text[]
              ) || 'children',
              COALESCE(
                current_tree.tree #> (
                  COALESCE(
                    next_node.json_path[
                      1:cardinality(next_node.json_path) - 2
                    ],
                    ARRAY[]::text[]
                  ) || 'children'
                ),
                '[]'::jsonb
              ) || jsonb_build_array(
                jsonb_build_object(
                  'id', next_node.id,
                  'name', next_node.name,
                  'slug', next_node.slug,
                  'icon', next_node.icon,
                  'order_number', next_node.order_number,
                  'parent', next_node.parent_json,
                  'children', '[]'::jsonb
                )
              ),
              true
            )
          FROM tree_fold current_tree
          INNER JOIN ordered_subtree next_node
            ON next_node.role_id = current_tree.role_id
           AND next_node.assigned_menu_id = current_tree.assigned_menu_id
           AND next_node.step_number = current_tree.step_number + 1
        ),
        completed_trees AS (
          SELECT DISTINCT ON (tree.role_id, tree.assigned_menu_id)
            tree.role_id,
            tree.assigned_menu_id,
            tree.tree
          FROM tree_fold tree
          ORDER BY
            tree.role_id,
            tree.assigned_menu_id,
            tree.step_number DESC
        )
        SELECT COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'role', jsonb_build_object(
                'id', assignment.role_id,
                'name', assignment.role_name,
                'slug', assignment.role_slug
              ),
              'menu', completed.tree
            )
            ORDER BY
              assignment.role_name,
              assignment.menu_order_number,
              assignment.menu_name,
              assignment.menu_id
          ),
          '[]'::jsonb
        ) AS role_menu_permission
        FROM assignments assignment
        INNER JOIN completed_trees completed
          ON completed.role_id = assignment.role_id
         AND completed.assigned_menu_id = assignment.menu_id
      `,
      [userId],
    )) as [{ role_menu_permission: In_AUTH_RoleMenuPermission[] }];

    if (!result) {
      throw new Error("Role menu permission query returned no result.");
    }

    return result.role_menu_permission;
  }

  public async updateLogin(
    userId: string,
    refreshTokenHash: string,
    passwordHash?: string,
  ): Promise<boolean> {
    const updates: Partial<User> = {
      is_login: true,
      refresh_token: refreshTokenHash,
      last_login_at: new Date(),
    };

    if (passwordHash) {
      updates.password = passwordHash;
    }

    const result = await this.repoUser.update(
      { id: userId, is_active: true },
      updates,
    );
    return result.affected === 1;
  }

  public async rotateRefreshToken(
    userId: string,
    previousHash: string,
    nextHash: string,
  ): Promise<boolean> {
    const result = await this.repoUser
      .createQueryBuilder()
      .update(User)
      .set({ refresh_token: nextHash, is_login: true })
      .where({
        id: userId,
        refresh_token: previousHash,
        is_active: true,
      })
      .execute();

    return result.affected === 1;
  }

  public async logout(userId: string): Promise<void> {
    await this.repoUser.update(
      { id: userId },
      { is_login: false, refresh_token: null },
    );
  }
}

export const repository = new AuthRepository();
