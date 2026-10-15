import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { Card } from '../../components/Card';
import { StatusBadge, Badge } from '../../components/Badge';
import { LoadingSkeleton } from '../../components/EmptyState';
import { BarChart3, TrendingUp, PhoneCall, Users, CheckCircle2 } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [leadStats, setLeadStats] = useState<any>(null);
  const [callStats, setCallStats] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, callsRes, teamRes] = await Promise.all([
        api.get('/reports/leads-by-status'),
        api.get('/reports/calls-by-outcome'),
        api.get('/reports/team-performance'),
      ]);
      if (leadsRes.success) setLeadStats(leadsRes.data);
      if (callsRes.success) setCallStats(callsRes.data);
      if (teamRes.success) setTeamStats(teamRes.data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Reports & Performance Analytics</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Detailed metrics aggregated directly from actual database records.
        </p>
      </div>

      {/* Row 1: Pipeline & Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Leads by Status Pipeline" subtitle="Volume and deal values across stages">
          <div className="space-y-3">
            {leadStats?.by_status?.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-50">
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-zinc-900">{item.count} leads</span>
                  {item.total_value && (
                    <span className="text-zinc-500 font-semibold">₹{Number(item.total_value).toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Lead Acquisition Sources" subtitle="Where your prospective clients are coming from">
          <div className="space-y-3">
            {leadStats?.by_source?.map((item: any) => (
              <div key={item.source} className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-50">
                <span className="font-semibold text-zinc-800">{item.source}</span>
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  {item.count} leads
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Call Outcomes */}
      <Card title="Call Outcomes Distribution" subtitle="Results from outbound phone outreach">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {callStats?.by_outcome?.map((item: any) => (
            <div key={item.outcome} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase">{item.outcome}</div>
              <div className="text-lg font-bold text-zinc-900 mt-1">{item.count}</div>
              {item.avg_duration > 0 && (
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Avg: {Math.round(item.avg_duration)}s
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Row 3: Team Agent Productivity Table */}
      <Card title="Sales Agent Productivity & Conversion" subtitle="Permitted telecalling leaderboard">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100">
              <tr>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Leads Assigned</th>
                <th className="py-3 px-4">Calls Attempted</th>
                <th className="py-3 px-4">Connected Calls</th>
                <th className="py-3 px-4">Connect Rate</th>
                <th className="py-3 px-4">Converted</th>
                <th className="py-3 px-4">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {teamStats.map((agent: any) => (
                <tr key={agent.id} className="hover:bg-zinc-50/70">
                  <td className="py-3 px-4 font-semibold text-zinc-900">{agent.name}</td>
                  <td className="py-3 px-4">{agent.leads_assigned}</td>
                  <td className="py-3 px-4 font-semibold text-purple-700">{agent.calls_attempted}</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">{agent.calls_connected}</td>
                  <td className="py-3 px-4 font-bold">{agent.connect_rate_percent}%</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{agent.leads_converted}</td>
                  <td className="py-3 px-4 font-bold text-zinc-900">{agent.conversion_rate_percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
