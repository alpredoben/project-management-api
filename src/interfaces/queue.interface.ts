export interface In_QUEUE_ActivityLog {
  action_id: string | null;
  action_name: string | null;
  entity_type: string;
  entity_data?: Record<string, any> | null;
  request_data?: Record<string, any> | null;
  snapshot_old_data?: Record<string, any> | null;
  snapshot_new_data?: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
}
