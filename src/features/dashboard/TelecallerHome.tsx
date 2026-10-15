import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { api } from '../../lib/api/client';
import { Lead } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge, Badge } from '../../components/Badge';
import { EmptyState, LoadingSkeleton } from '../../components/EmptyState';
import { CallOutcomeModal } from '../calls/CallOutcomeModal';
import {
  PhoneCall,
  CalendarCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TelecallerHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'overdue'>('all');

  // Call outcome modal state
  const [callingLead, setCallingLead] = useState<Lead | null>(null);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, leadsRes] = await Promise.all([
        api.get('/dashboard/metrics'),
        api.get('/leads', { per_page: 50 }),
      ]);
      if (metricsRes.success) setMetrics(metricsRes.data);
      if (leadsRes.success) setLeads(leadsRes.data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInitiateCall = (lead: Lead) => {
    // Open tel: link
    window.location.href = `tel:${lead.phone}`;
    // Immediately prompt for outcome logging
    setCallingLead(lead);
    setIsOutcomeModalOpen(true);
  };

  const handleOutcomeSaved = () => {
    setIsOutcomeModalOpen(false);
    setCallingLead(null);
    fetchData();
  };

  const summary = metrics?.summary || {};
  const nextLead = metrics?.next_lead;

  const filteredLeads = leads.filter((l) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        l.first_name.toLowerCase().includes(q) ||
        (l.last_name && l.last_name.toLowerCase().includes(q)) ||
        l.phone.includes(q) ||
        (l.company && l.company.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (activeTab === 'today') {
      return ['Assigned', 'Follow-up', 'New'].includes(l.status);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Telecaller Header */}
      <div className="bg-brand-gradient text-white p-5 rounded-2xl shadow-brand flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
              Telecaller Queue
            </span>
            <span className="text-xs text-purple-100">{user?.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">Today's Calling Target</h1>
          <p className="text-xs text-purple-100 mt-0.5">
            Tap the phone button to dial directly from your device and record notes instantly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-center">
            <div className="text-lg font-bold">{summary.calls_today ?? 0}</div>
            <div className="text-[10px] text-purple-200 uppercase font-semibold">Calls Today</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-center">
            <div className="text-lg font-bold">{summary.my_assigned_leads ?? 0}</div>
            <div className="text-[10px] text-purple-200 uppercase font-semibold">My Leads</div>
          </div>
        </div>
      </div>

      {/* Next Eligible Lead Quick Call Action Banner */}
      {nextLead && (
        <div className="bg-white border-2 border-purple-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-bold">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">Next Lead In Queue</span>
                <StatusBadge status={nextLead.status} size="sm" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mt-0.5">
                {nextLead.first_name} {nextLead.last_name} {nextLead.company && `• ${nextLead.company}`}
              </h3>
              <p className="text-xs text-zinc-500">{nextLead.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="gradient"
              leftIcon={<PhoneCall className="w-4 h-4" />}
              onClick={() => handleInitiateCall(nextLead)}
            >
              Call {nextLead.first_name}
            </Button>
          </div>
        </div>
      )}

      {/* Leads Work Queue */}
      <Card
        title="My Assigned Leads Queue"
        subtitle={`${filteredLeads.length} leads assigned to you`}
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500 w-40 sm:w-52"
              />
            </div>
          </div>
        }
      >
        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="You currently have no leads matching your search criteria."
          />
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/70 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {lead.first_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-zinc-900 text-xs sm:text-sm">
                        {lead.first_name} {lead.last_name}
                      </h4>
                      <StatusBadge status={lead.status} size="sm" />
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{lead.phone}</span>
                      {lead.company && <span>• {lead.company}</span>}
                      {lead.estimated_value && (
                        <span className="font-semibold text-zinc-700">
                          • ₹{Number(lead.estimated_value).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {lead.notes && (
                      <p className="text-[11px] text-zinc-400 mt-1 italic line-clamp-1">
                        "{lead.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
                    onClick={() => handleInitiateCall(lead)}
                  >
                    Call Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Call Outcome Logging Modal */}
      {callingLead && (
        <CallOutcomeModal
          isOpen={isOutcomeModalOpen}
          onClose={() => setIsOutcomeModalOpen(false)}
          lead={callingLead}
          onSuccess={handleOutcomeSaved}
        />
      )}
    </div>
  );
};
