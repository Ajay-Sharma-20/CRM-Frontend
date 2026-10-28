import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { useAuth } from '../../lib/auth/AuthContext';
import { Card } from '../../components/Card';
import { StatusBadge, Badge } from '../../components/Badge';
import { LoadingSkeleton } from '../../components/EmptyState';
import {
  BarChart3,
  TrendingUp,
  PhoneCall,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Award,
  Sparkles,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { user } = useAuth();
  const isTelecaller = user?.role?.slug === 'telecaller';

  const [leadStats, setLeadStats] = useState<any>(null);
  const [callStats, setCallStats] = useState<any>(null);
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, callsRes, teamRes] = await Promise.allSettled([
        api.get('/reports/leads-by-status'),
        api.get('/reports/calls-by-outcome'),
        api.get('/reports/team-performance'),
      ]);

      if (leadsRes.status === 'fulfilled' && leadsRes.value.success) {
        setLeadStats(leadsRes.value.data);
      }
      if (callsRes.status === 'fulfilled' && callsRes.value.success) {
        setCallStats(callsRes.value.data);
      }
      if (teamRes.status === 'fulfilled' && teamRes.value.success) {
        setTeamStats(teamRes.value.data);
      }
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
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  const dailyProgress = callStats?.daily_progress || [];
  const todaySummary = callStats?.summary_today || {
    attempts: 0,
    connected: 0,
    converted: 0,
    connect_rate: 0,
    talk_time_minutes: 0,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
          {isTelecaller ? 'My Daily Performance & Progress' : 'Reports & Performance Analytics'}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          {isTelecaller
            ? 'Track your daily calling attempts, connected outcomes, and conversions.'
            : 'Aggregated analytics and calling productivity across your workspace pipeline.'}
        </p>
      </div>

      {/* Row 1: Today's Snapshot Metrics (#FBFAF9 Light Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FBFAF9] border border-[#E9E6E2] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Calls</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 mt-2 font-mono">
            {todaySummary.attempts}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Dialed attempts today</div>
        </div>

        <div className="bg-[#FBFAF9] border border-[#E9E6E2] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Connected</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">
            {todaySummary.connected}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">
            {todaySummary.connect_rate}% connect rate
          </div>
        </div>

        <div className="bg-[#FBFAF9] border border-[#E9E6E2] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Converted</span>
            <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-700 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-pink-700 mt-2 font-mono">
            {todaySummary.converted}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Deals won today</div>
        </div>

        <div className="bg-[#FBFAF9] border border-[#E9E6E2] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Talk Time</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 mt-2 font-mono">
            {todaySummary.talk_time_minutes}m
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Total duration today</div>
        </div>
      </div>

      {/* Row 2: Day-by-Day Calling Progress (Per day progress) */}
      <div className="bg-[#FBFAF9] border border-[#E9E6E2] rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900">
              📅 Day-by-Day Calling Progress
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Daily breakdown of calls dialed, connects, and conversions
            </p>
          </div>
          <span className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-semibold">
            Last 14 Days
          </span>
        </div>

        <div className="space-y-2.5">
          {dailyProgress.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-400">
              No calling activity recorded yet.
            </div>
          ) : (
            dailyProgress.map((day: any) => (
              <div
                key={day.date}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  day.attempts > 0
                    ? 'bg-white border-[#E9E6E2]'
                    : 'bg-stone-50/60 border-stone-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">{day.label}</div>
                    <div className="text-[10px] font-mono text-zinc-400">{day.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Attempts</span>
                    <span className="font-bold text-zinc-900 font-mono">{day.attempts}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Connected</span>
                    <span className="font-bold text-emerald-700 font-mono">{day.connected}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Connect Rate</span>
                    <span className="font-bold text-zinc-800 font-mono">{day.connect_rate}%</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Converted</span>
                    <span className="font-bold text-pink-700 font-mono">{day.converted}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Talk Time</span>
                    <span className="font-bold text-zinc-700 font-mono">{day.talk_time_minutes}m</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Row 3: Pipeline & Call Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Leads by Status Pipeline */}
        <div className="bg-[#FBFAF9] border border-[#E9E6E2] rounded-2xl p-5 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Leads by Status Pipeline</h3>
            <p className="text-xs text-zinc-500">Volume and estimated pipeline values</p>
          </div>
          <div className="space-y-2">
            {leadStats?.by_status?.map((item: any) => (
              <div
                key={item.status}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white border border-[#E9E6E2]"
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-900 font-mono">{item.count} leads</span>
                  {item.total_value && (
                    <span className="text-zinc-500 font-semibold font-mono">
                      ₹{Number(item.total_value).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call Outcomes Distribution */}
        <div className="bg-[#FBFAF9] border border-[#E9E6E2] rounded-2xl p-5 shadow-2xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Call Outcomes Distribution</h3>
            <p className="text-xs text-zinc-500">Results from dialed phone attempts</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {callStats?.by_outcome?.map((item: any) => (
              <div
                key={item.outcome}
                className="p-3 bg-white border border-[#E9E6E2] rounded-xl"
              >
                <div className="text-[10px] font-bold text-zinc-500 uppercase truncate">
                  {item.outcome}
                </div>
                <div className="text-lg font-black text-zinc-900 mt-1 font-mono">
                  {item.count}
                </div>
                {item.avg_duration > 0 && (
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Avg: {Math.round(item.avg_duration)}s
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Productivity Leaderboard (for Managers / Owners or Telecaller personal row) */}
      {teamStats.length > 0 && (
        <div className="bg-[#FBFAF9] border border-[#E9E6E2] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                {isTelecaller ? 'My Overall Productivity Score' : 'Team Agent Productivity & Conversion'}
              </h3>
              <p className="text-xs text-zinc-500">
                Lifetime conversion rates and call connection ratio
              </p>
            </div>
            <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-lg border border-purple-200">
              Verified Metrics
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/70 text-zinc-500 uppercase tracking-wider font-semibold border-b border-[#E9E6E2]">
                <tr>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Assigned</th>
                  <th className="py-2.5 px-3">Calls Dialed</th>
                  <th className="py-2.5 px-3">Connected</th>
                  <th className="py-2.5 px-3">Connect Rate</th>
                  <th className="py-2.5 px-3">Converted</th>
                  <th className="py-2.5 px-3">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E6E2] text-zinc-700">
                {teamStats.map((agent: any) => (
                  <tr key={agent.id} className="hover:bg-white transition-colors">
                    <td className="py-3 px-3 font-semibold text-zinc-900">
                      {agent.name} {agent.id === user?.id && <span className="text-[10px] text-purple-600 font-bold">(You)</span>}
                    </td>
                    <td className="py-3 px-3 font-mono">{agent.leads_assigned}</td>
                    <td className="py-3 px-3 font-semibold text-purple-700 font-mono">
                      {agent.calls_attempted}
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-semibold font-mono">
                      {agent.calls_connected}
                    </td>
                    <td className="py-3 px-3 font-bold font-mono">
                      {agent.connect_rate_percent}%
                    </td>
                    <td className="py-3 px-3 font-bold text-pink-700 font-mono">
                      {agent.leads_converted}
                    </td>
                    <td className="py-3 px-3 font-bold text-zinc-900 font-mono">
                      {agent.conversion_rate_percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
