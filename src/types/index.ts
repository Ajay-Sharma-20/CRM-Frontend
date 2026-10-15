export interface Tenant {
  id: number;
  name: string;
  slug: string;
  timezone: string;
}

export interface Role {
  id: number;
  name: string;
  slug: 'owner' | 'admin' | 'manager' | 'telecaller';
  description?: string;
  is_system?: boolean;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  key: string;
  module: string;
  label: string;
  description?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  is_configurable?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'deactivated';
  role?: Role;
  tenant?: Tenant;
  teams?: Team[];
  effective_permissions?: string[];
  leads_count?: number;
  calls_count?: number;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  leader_id?: number;
  leader?: { id: number; name: string; email: string };
  members?: User[];
  leads_count?: number;
}

export interface LeadNote {
  id: number;
  lead_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user?: { id: number; name: string };
}

export interface LeadActivity {
  id: number;
  lead_id: number;
  user_id: number;
  type: string;
  description: string;
  metadata?: any;
  created_at: string;
  user?: { id: number; name: string };
}

export interface CallLog {
  id: number;
  lead_id: number;
  user_id: number;
  outcome: string;
  duration_seconds?: number;
  notes?: string;
  called_at: string;
  created_at: string;
  user?: { id: number; name: string };
  lead?: { id: number; first_name: string; last_name: string; phone: string; company?: string };
}

export interface FollowUp {
  id: number;
  lead_id: number;
  user_id: number;
  title: string;
  due_at: string;
  status: 'open' | 'completed' | 'cancelled';
  notes?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancelled_reason?: string;
  created_at: string;
  lead?: Lead;
  user?: { id: number; name: string };
}

export interface Lead {
  id: number;
  tenant_id: number;
  first_name: string;
  last_name?: string;
  phone: string;
  normalized_phone?: string;
  email?: string;
  company?: string;
  job_title?: string;
  status: 'New' | 'Assigned' | 'Contacted' | 'Interested' | 'Follow-up' | 'Qualified' | 'Converted' | 'Lost' | 'Invalid';
  source: string;
  owner_id?: number;
  team_id?: number;
  estimated_value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  owner?: { id: number; name: string; email: string; phone?: string };
  team?: { id: number; name: string };
  creator?: { id: number; name: string };
  call_logs?: CallLog[];
  follow_ups?: FollowUp[];
  lead_notes?: LeadNote[];
  activities?: LeadActivity[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'assignment' | 'overdue' | 'reminder' | 'system' | 'info';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditEvent {
  id: number;
  action: string;
  entity_type: string;
  entity_id?: number;
  description?: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
  user?: { id: number; name: string; email: string };
}
