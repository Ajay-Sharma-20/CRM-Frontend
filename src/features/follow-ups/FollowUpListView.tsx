import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FollowUpListView: React.FC = () => {
  const navigate = useNavigate();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [activeTab, setActiveTab] = useState<'open' | 'today' | 'overdue' | 'upcoming' | 'completed'>('open');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Follow-ups & Tasks</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Manage scheduled follow-up calls, overdue tasks, and client re-engagements.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 overflow-x-auto pb-1">
        {[
          { key: 'open', label: 'All Open' },
          { key: 'today', label: 'Due Today' },
          { key: 'overdue', label: 'Overdue Alerts' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed History' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.key
                ? 'bg-purple-100 text-purple-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Follow-ups List */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : followUps.length === 0 ? (
          <EmptyState
            title="No follow-ups in this view"
            description="All scheduled follow-up tasks for this category have been attended to."
          />
        ) : (
          <div className="divide-y divide-zinc-100">
            {followUps.map((fu) => {
              const isOverdue = fu.status === 'open' && new Date(fu.due_at) < new Date();
              return (
                <div
                  key={fu.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/70 transition-colors ${
                    isOverdue ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isOverdue
                          ? 'bg-amber-100 text-amber-700'
                          : fu.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-purple-50 text-purple-600'
                      }`}
                    >
                      <CalendarCheck className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-zinc-900">{fu.title}</span>
                        {isOverdue && <Badge variant="warning" size="sm">Overdue</Badge>}
                        <StatusBadge status={fu.status} size="sm" />
                      </div>

                      {fu.lead && (
                        <div className="text-xs text-zinc-600 mt-0.5">
                          Lead:{' '}
                          <button
                            onClick={() => navigate(`/leads/${fu.lead?.id}`)}
                            className="font-semibold text-purple-700 hover:underline"
                          >
                            {fu.lead.first_name} {fu.lead.last_name} ({fu.lead.phone})
                          </button>
                        </div>
                      )}

                      <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          Due: {new Date(fu.due_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        {fu.user && <span>• Assigned: {fu.user.name}</span>}
                      </div>

                      {fu.notes && (
                        <p className="text-[11px] text-zinc-500 mt-1 italic">
                          "{fu.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {fu.status === 'open' && (
                      <>
                        {fu.lead && (
                          <Button
                            variant="gradient"
                            size="sm"
                            leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
                            onClick={() => handleInitiateCall(fu)}
                          >
                            Call
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                          onClick={() => setCompletingItem(fu)}
                        >
                          Complete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancellingItem(fu)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Complete Modal */}
      {completingItem && (
        <Modal
          isOpen={!!completingItem}
          onClose={() => setCompletingItem(null)}
          title="Complete Follow-up"
          description={`Mark '${completingItem.title}' as completed`}
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
            <label className="block text-xs font-medium text-zinc-700">Completion Notes (Optional)</label>
            <textarea
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              placeholder="What was the result of this follow-up?"
              rows={3}
              className="w-full text-xs rounded-lg border border-zinc-300 p-2.5 focus:border-purple-600 outline-none"
            />
          </div>
        </Modal>
      )}

      {/* Cancel Modal */}
      {cancellingItem && (
        <Modal
          isOpen={!!cancellingItem}
          onClose={() => setCancellingItem(null)}
          title="Cancel Follow-up"
          description={`Please provide a reason for cancelling this follow-up`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setCancellingItem(null)}>
                Close
              </Button>
              <Button variant="danger" onClick={handleCancel}>
                Cancel Follow-up
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <Input
              label="Cancellation Reason *"
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Lead requested no more calls, duplicate task..."
            />
          </div>
        </Modal>
      )}

      {/* Outcome Modal if call initiated */}
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
