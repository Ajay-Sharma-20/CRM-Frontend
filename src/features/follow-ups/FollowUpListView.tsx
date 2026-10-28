import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api/client';
import { FollowUp, Lead } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge, Badge } from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/EmptyState';
import { CallOutcomeModal } from '../calls/CallOutcomeModal';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  PhoneCall,
  AlertTriangle,
  Zap,
  MessageSquare,
  Sparkles,
  ArrowRight,
  User,
  Building2,
} from 'lucide-react';

export const FollowUpListView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial tab from query param ?view=priority or ?view=today
  const initialView = (searchParams.get('view') as any) || 'open';
  const [activeTab, setActiveTab] = useState<'priority' | 'open' | 'today' | 'overdue' | 'upcoming' | 'completed'>(initialView);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [completingItem, setCompletingItem] = useState<FollowUp | null>(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [cancellingItem, setCancellingItem] = useState<FollowUp | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [callingLead, setCallingLead] = useState<Lead | null>(null);

  const fetchFollowUps = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/follow-ups', { view: activeTab });
      if (res.success) {
        setFollowUps(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [activeTab]);

  const handleComplete = async () => {
    if (!completingItem) return;
    try {
      await api.post(`/follow-ups/${completingItem.id}/complete`, { notes: completeNotes });
      setCompletingItem(null);
      setCompleteNotes('');
      fetchFollowUps();
    } catch (err: any) {
      alert(err.message || 'Failed to complete follow-up');
    }
  };

  const handleCancel = async () => {
    if (!cancellingItem || !cancelReason.trim()) return;
    try {
      await api.post(`/follow-ups/${cancellingItem.id}/cancel`, { reason: cancelReason });
      setCancellingItem(null);
      setCancelReason('');
      fetchFollowUps();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel follow-up');
    }
  };

  const handleInitiateCall = (fu: FollowUp) => {
    if (fu.lead) {
      window.location.href = `tel:${fu.lead.phone}`;
      setCallingLead(fu.lead);
    }
  };

  const handleWhatsApp = (fu: FollowUp) => {
    if (!fu.lead) return;
    let clean = (fu.lead.phone || '').replace(/[^0-9]/g, '');
    if (clean.length === 10) clean = `91${clean}`;
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Follow-ups & Tasks</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage scheduled follow-up calls, overdue tasks, and client re-engagements.
        </p>
      </div>

      {/* Full Width Mobile Strategic Reminder Div (10 AM - 12 PM Priority Window) */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-md">
                10 AM — 12 PM CALLING WINDOW
              </span>
              <span className="text-xs text-blue-200 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Peak Response Time
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Priority Callback Queue
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed max-w-xl">
              High-priority leads respond best between <strong>10 AM — 12 PM</strong>. Engage these prospects before noon to maximize conversion rate.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('priority')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-[0.98] ${
              activeTab === 'priority'
                ? 'bg-emerald-400 text-slate-900 shadow-md ring-2 ring-emerald-300'
                : 'bg-white text-blue-900 hover:bg-blue-50 shadow-sm'
            }`}
          >
            {activeTab === 'priority' ? '✓ Showing Priority Leads' : 'Filter Priority Leads'}
          </button>
        </div>
      </div>

      {/* Filter Tabs (Horizontal scroll-free touch pills) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'priority', label: '🔥 Priority (10-12 PM)' },
          { key: 'open', label: 'All Open' },
          { key: 'today', label: 'Due Today' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl shrink-0 transition-all ${
              activeTab === tab.key
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Follow-ups List (Mobile-first cards, ZERO horizontal scrolling) */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-6">
            <LoadingSkeleton rows={4} />
          </Card>
        ) : followUps.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              title="No follow-up tasks in this view"
              description="All scheduled follow-up tasks for this category have been attended to."
              actionLabel={activeTab !== 'open' ? 'View All Open' : undefined}
              onAction={activeTab !== 'open' ? () => setActiveTab('open') : undefined}
            />
          </Card>
        ) : (
          followUps.map((fu) => {
            const isOverdue = fu.status === 'open' && new Date(fu.due_at) < new Date();
            const cleanPhone = (fu.lead?.phone || '').replace(/[^0-9]/g, '');

            return (
              <div
                key={fu.id}
                className={`bg-[#FBFAF9] rounded-2xl border p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col gap-3 ${
                  isOverdue
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-[#E9E6E2] hover:border-purple-300'
                }`}
              >
                {/* Header row: Status & Due Time */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isOverdue
                          ? 'bg-amber-100 text-amber-700'
                          : fu.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug">
                        {fu.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>
                          {new Date(fu.due_at).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status pill */}
                  <div className="flex items-center gap-1">
                    {isOverdue && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                        Overdue
                      </span>
                    )}
                    <StatusBadge status={fu.status} size="sm" />
                  </div>
                </div>

                {/* Lead Contact Info Block */}
                {fu.lead && (
                  <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-100 flex items-center justify-between text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-zinc-900 truncate">
                        {fu.lead.first_name} {fu.lead.last_name || ''}
                      </div>
                      <div className="text-zinc-500 font-mono text-[11px] mt-0.5">
                        📞 {fu.lead.phone}
                      </div>
                    </div>
                    {fu.lead.status && (
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {fu.lead.status}
                      </span>
                    )}
                  </div>
                )}

                {/* Notes if available */}
                {fu.notes && (
                  <p className="text-xs text-zinc-600 bg-zinc-50/60 p-2.5 rounded-xl border border-zinc-100 italic">
                    "{fu.notes}"
                  </p>
                )}

                {/* Action Buttons: Call, WhatsApp, Complete, Cancel */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {fu.lead && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleInitiateCall(fu)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWhatsApp(fu)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </>
                    )}
                  </div>

                  {fu.status === 'open' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCompletingItem(fu)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancellingItem(fu)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Complete Follow-up Modal */}
      {completingItem && (
        <Modal
          isOpen={!!completingItem}
          onClose={() => setCompletingItem(null)}
          title="Complete Follow-up Task"
          description={`Mark follow-up for ${completingItem.lead?.first_name || 'lead'} as finished.`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setCompletingItem(null)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleComplete}>
                Mark Completed
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <label className="block text-xs font-medium text-zinc-700">
              Outcome / Completion Notes
            </label>
            <textarea
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              placeholder="e.g. Spoke with client, scheduled property visit for Saturday..."
              rows={3}
              className="w-full text-xs rounded-xl border border-zinc-200 p-2.5 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
            />
          </div>
        </Modal>
      )}

      {/* Cancel Follow-up Modal */}
      {cancellingItem && (
        <Modal
          isOpen={!!cancellingItem}
          onClose={() => setCancellingItem(null)}
          title="Cancel Follow-up"
          description="Please specify why this scheduled callback is being cancelled."
          footer={
            <>
              <Button variant="ghost" onClick={() => setCancellingItem(null)}>
                Close
              </Button>
              <Button variant="danger" onClick={handleCancel}>
                Confirm Cancellation
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input
              label="Cancellation Reason *"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Client already purchased / Lead requested do-not-call"
              required
            />
          </div>
        </Modal>
      )}

      {/* Call Outcome Logging Modal */}
      {callingLead && (
        <CallOutcomeModal
          isOpen={!!callingLead}
          onClose={() => setCallingLead(null)}
          lead={callingLead}
          onSuccess={() => {
            setCallingLead(null);
            fetchFollowUps();
          }}
        />
      )}
    </div>
  );
};
