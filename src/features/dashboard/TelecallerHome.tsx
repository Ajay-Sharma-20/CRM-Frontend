import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { api } from '../../lib/api/client';
import {
  Users,
  PhoneCall,
  Star,
  TrendingUp,
  Megaphone,
  ArrowRight,
  Clock,
  Sparkles,
  CalendarCheck,
  BarChart2,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TelecallerHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch metrics & announcements
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

  const announcement = metrics?.announcement;
  const categories = metrics?.categories || metrics?.summary || {};

  // Check if current hour is in 10 AM - 12 PM window
  const currentHour = new Date().getHours();
  const isPriorityWindowActive = currentHour >= 10 && currentHour < 12;

  // Navigate directly to Leads tab with selected category
  const handleOpenCategory = (catKey: string) => {
    navigate(`/leads?category=${catKey}`);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-12">
      {/* Top Header: Online Status & Workspace Title (#FBFAF9 Light Theme) */}
      <div className="bg-[#FBFAF9] text-zinc-900 p-5 rounded-2xl border border-[#E9E6E2] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{user?.name || 'TELECALLER'} • ONLINE</span>
          </div>

          <span className="text-[11px] bg-white text-zinc-700 px-2.5 py-1 rounded-lg font-semibold border border-stone-200 shadow-2xs">
            {user?.tenant?.name || 'CRM SaaS'}
          </span>
        </div>

        <div className="mt-3">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Performance</h1>
          <p className="text-[11px] font-bold tracking-widest text-purple-700 uppercase mt-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            REAL-TIME ANALYTICS ENGINE
          </p>
        </div>
      </div>

      {/* Broadcast Announcement Banner (from Admin / Settings) */}
      {announcement && announcement.active !== false && (
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white rounded-2xl p-4 shadow-md flex items-center gap-3.5 border border-white/20">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-zinc-950 px-2 py-0.5 rounded shadow-xs">
                {announcement.badge || 'BROADCAST'}
              </span>
              <span className="text-[11px] text-white/90 font-medium">
                {announcement.date || 'Today'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug line-clamp-2">
              {announcement.message || 'Ajay Ji Sudarshan Tehnologies welcomes you'}
            </p>
          </div>
        </div>
      )}

      {/* 4 Category Metric Cards (2x2 Grid) - Clicking navigates to /leads?category=... */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
            Assigned Leads Queue
          </span>
          <span className="text-[11px] text-purple-700 font-semibold">
            Tap a card to view leads
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 1. Fresh Leads */}
          <div
            onClick={() => handleOpenCategory('fresh')}
            className="bg-[#FBFAF9] border border-[#E9E6E2] hover:border-cyan-400 hover:shadow-md p-4 rounded-2xl transition-all cursor-pointer group active:scale-[0.98] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center shadow-2xs">
                <Users className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-3 font-mono">
              {categories.fresh_leads ?? 0}
            </div>
            <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-wide mt-1">
              FRESH LEADS
            </div>
            <div className="text-[10px] text-cyan-700 font-semibold mt-1 flex items-center gap-0.5">
              <span>Open fresh leads</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* 2. Calls Today */}
          <div
            onClick={() => handleOpenCategory('calls_today')}
            className="bg-[#FBFAF9] border border-[#E9E6E2] hover:border-emerald-400 hover:shadow-md p-4 rounded-2xl transition-all cursor-pointer group active:scale-[0.98] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-2xs">
                <PhoneCall className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-3 font-mono">
              {categories.calls_today ?? 0}
            </div>
            <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-wide mt-1">
              CALLS TODAY
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-0.5">
              <span>View today's calls</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* 3. Interested */}
          <div
            onClick={() => handleOpenCategory('interested')}
            className="bg-[#FBFAF9] border border-[#E9E6E2] hover:border-amber-400 hover:shadow-md p-4 rounded-2xl transition-all cursor-pointer group active:scale-[0.98] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-2xs">
                <Star className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-3 font-mono">
              {categories.interested ?? 0}
            </div>
            <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-wide mt-1">
              INTERESTED
            </div>
            <div className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center gap-0.5">
              <span>View warm leads</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* 4. Converted */}
          <div
            onClick={() => handleOpenCategory('converted')}
            className="bg-[#FBFAF9] border border-[#E9E6E2] hover:border-pink-400 hover:shadow-md p-4 rounded-2xl transition-all cursor-pointer group active:scale-[0.98] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-700 border border-pink-200 flex items-center justify-center shadow-2xs">
                <TrendingUp className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-3 font-mono">
              {categories.converted ?? 0}
            </div>
            <div className="text-[11px] font-bold text-zinc-600 uppercase tracking-wide mt-1">
              CONVERTED
            </div>
            <div className="text-[10px] text-pink-700 font-semibold mt-1 flex items-center gap-0.5">
              <span>View converted</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Insight / 10 AM - 12 PM Priority Reminder (#FBFAF9 Light Theme) */}
      <div className="bg-[#FBFAF9] border border-[#E9E6E2] rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-1 rounded-md border border-purple-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-700" />
            10:00 AM — 12:00 PM STRATEGIC WINDOW
          </span>
          {isPriorityWindowActive ? (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-pulse">
              ● Active Now
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
              Scheduled Daily
            </span>
          )}
        </div>

        <h2 className="text-lg sm:text-xl font-black text-zinc-900 mt-2.5 tracking-tight">
          Maximize Reach & Call Priority Leads
        </h2>
        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
          High-priority leads respond best between <strong>10 AM — 12 PM</strong>. Engage these key prospects during the morning calling window for maximum conversion rate.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenCategory('priority')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gradient text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all active:scale-[0.98]"
          >
            <span>VIEW PRIORITY SCHEDULE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {categories.priority_leads_count > 0 && (
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl font-bold">
              🔥 {categories.priority_leads_count} Priority Due Today
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions Navigation Strip */}
      <div className="bg-[#FBFAF9] border border-[#E9E6E2] rounded-2xl p-4 shadow-2xs space-y-2.5">
        <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
          Quick Workspaces
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => navigate('/leads')}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E9E6E2] hover:border-purple-300 hover:shadow-xs transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900">All Leads</div>
                <div className="text-[10px] text-zinc-500">View cards list</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/follow-ups')}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E9E6E2] hover:border-purple-300 hover:shadow-xs transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900">Follow-ups</div>
                <div className="text-[10px] text-zinc-500">Upcoming tasks</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E9E6E2] hover:border-purple-300 hover:shadow-xs transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-700 flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900">My Reports</div>
                <div className="text-[10px] text-zinc-500">Daily performance</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
