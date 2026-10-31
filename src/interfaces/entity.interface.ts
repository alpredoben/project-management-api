import {
  Role,
  User,
  Permission,
  Menu,
  UserRole,
  RoleMenuPermission,
  ProjectType,
  ProjectStatus,
  Project,
  ProjectCollaborator,
  TaskStatus,
  TaskType,
  Task,
  TaskMember,
  TaskComment,
  TaskProgressLog,
  TaskLike,
  TaskStatusHistory,
  AttachmentFile,
  Notification,
  ActivityLog,
} from "../database/entities";
import { TaskStatusHistories1793323052708 } from "../database/migrations/1793323052708-TaskStatusHistories";

export interface In_ENTITY_User extends User {}

export interface In_ENTITY_Role extends Role {}

export interface In_ENTITY_Permission extends Permission {}

export interface In_ENTITY_Menu extends Menu {}

export interface In_ENTITY_UserRole extends UserRole {}

export interface In_ENTITY_RoleMenuPermission extends RoleMenuPermission {}

export interface In_ENTITY_ProjectType extends ProjectType {}

export interface In_ENTITY_ProjectStatus extends ProjectStatus {}

export interface In_ENTITY_Project extends Project {}

export interface In_ENTITY_ProjectCollaborator extends ProjectCollaborator {}

export interface In_ENTITY_TaskStatus extends TaskStatus {}

export interface In_ENTITY_TaskType extends TaskType {}

export interface In_ENTITY_Task extends Task {}

export interface In_ENTITY_TaskMember extends TaskMember {}

export interface In_ENTITY_TaskComment extends TaskComment {}

export interface In_ENTITY_TaskProgressLog extends TaskProgressLog {}

export interface In_ENTITY_TaskLike extends TaskLike {}

export interface In_ENTITY_TaskStatusHistory extends TaskStatusHistory {}

export interface In_ENTITY_AttachmentFile extends AttachmentFile {}

export interface In_ENTITY_Notification extends Notification {}

export interface In_ENTITY_ActivityLog extends ActivityLog {}
