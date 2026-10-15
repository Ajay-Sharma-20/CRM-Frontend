import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { api } from '../../lib/api/client';
import { StatCard } from '../../components/StatCard';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge, Badge } from '../../components/Badge';
import { LoadingSkeleton } from '../../components/EmptyState';
import {
  Users,
  PhoneCall,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  PhoneForwarded,
  ArrowRight,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/dashboard/metrics');
      if (res.success) {
        setMetrics(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-zinc-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  const role = metrics?.role || 'owner_admin';
  const summary = metrics?.summary || {};
  const statusCounts = metrics?.leads_by_status || {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              {role === 'manager' ? 'Team Sales Overview' : 'Executive Dashboard'}
            </h1>
            <Badge variant="purple">{user?.role?.name}</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time pipeline metrics and telecalling activity for {user?.tenant?.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => navigate('/leads')}>
            View All Leads
          </Button>
          <Button variant="gradient" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/leads?create=1')}>
            New Lead
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      {role === 'owner_admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Leads"
            value={summary.total_leads ?? 0}
            subtitle={`+${summary.new_leads_this_week ?? 0} new this week`}
            icon={<Users className="w-4 h-4" />}
            color="purple"
          />
          <StatCard
            title="Calls Attempted"
            value={summary.calls_attempted_total ?? 0}
            subtitle={`${summary.calls_today ?? 0} made today`}
            icon={<PhoneCall className="w-4 h-4" />}
            color="pink"
          />
          <StatCard
            title="Connect Rate"
            value={`${summary.connect_rate_percent ?? 0}%`}
            subtitle={`${summary.connected_calls ?? 0} connected calls`}
            icon={<TrendingUp className="w-4 h-4" />}
            color="green"
          />
          <StatCard
            title="Follow-ups Backlog"
            value={summary.follow_ups_due_today ?? 0}
            subtitle={`${summary.follow_ups_overdue ?? 0} overdue alerts`}
            icon={<CalendarCheck className="w-4 h-4" />}
            color={summary.follow_ups_overdue > 0 ? 'amber' : 'blue'}
          />
        </div>
      )}

      {role === 'manager' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Managed Team Leads"
            value={summary.total_team_leads ?? 0}
            subtitle={`${summary.unassigned_team_leads ?? 0} unassigned`}
            icon={<Users className="w-4 h-4" />}
            color="purple"
          />
          <StatCard
            title="Follow-ups Due Today"
            value={summary.follow_ups_due_today ?? 0}
            subtitle="Across team members"
            icon={<CalendarCheck className="w-4 h-4" />}
            color="blue"
          />
          <StatCard
            title="Overdue Tasks"
            value={summary.follow_ups_overdue ?? 0}
            subtitle="Require immediate attention"
            icon={<AlertCircle className="w-4 h-4" />}
            color={summary.follow_ups_overdue > 0 ? 'amber' : 'green'}
          />
        </div>
      )}

      {/* Pipeline Status Breakdown */}
      <Card title="Lead Pipeline by Status" subtitle="Live distribution across CRM lifecycle stages">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {['New', 'Assigned', 'Contacted', 'Interested', 'Follow-up', 'Qualified', 'Converted', 'Lost'].map((st) => (
            <div key={st} className="p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <StatusBadge status={st} size="sm" />
              </div>
              <div className="text-xl font-bold text-zinc-900">{statusCounts[st] ?? 0}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Team / Member Breakdown */}
      {role === 'owner_admin' && metrics?.teams && (
        <Card title="Company Sales Teams" subtitle="Overview of configured team structures and member capacity">
          <div className="divide-y divide-zinc-100">
            {metrics.teams.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">No teams created yet.</p>
            ) : (
              metrics.teams.map((t: any) => (
                <div key={t.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">{t.name}</h4>
                    <p className="text-xs text-zinc-500">{t.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full">
                      {t.members_count ?? 0} members
                    </span>
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                      {t.leads_count ?? 0} leads
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {role === 'manager' && metrics?.team_members && (
        <Card title="Team Member Productivity" subtitle="Daily calls, assigned lead load, and follow-up status">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Agent Name</th>
                  <th className="py-2.5 px-3 font-semibold">Assigned Leads</th>
                  <th className="py-2.5 px-3 font-semibold">Calls Logged</th>
                  <th className="py-2.5 px-3 font-semibold">Overdue Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {metrics.team_members.map((m: any) => (
                  <tr key={m.id} className="hover:bg-zinc-50/60">
                    <td className="py-3 px-3 font-medium text-zinc-900">{m.name}</td>
                    <td className="py-3 px-3">{m.assigned_leads_count ?? 0}</td>
                    <td className="py-3 px-3 font-semibold text-purple-700">{m.calls_count ?? 0}</td>
                    <td className="py-3 px-3">
                      {(m.overdue_followups_count ?? 0) > 0 ? (
                        <Badge variant="danger" size="sm">{m.overdue_followups_count} overdue</Badge>
                      ) : (
                        <Badge variant="success" size="sm">All clear</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
