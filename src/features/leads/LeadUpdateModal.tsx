import React, { useState, useEffect } from 'react';
import { Lead } from '../../types';
import { api } from '../../lib/api/client';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import {
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Sparkles,
  PhoneCall,
  User,
} from 'lucide-react';

interface LeadUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess: (updatedLead: Lead) => void;
}

export const LeadUpdateModal: React.FC<LeadUpdateModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  if (!lead) return null;

  const [status, setStatus] = useState<string>(lead.status || 'New');
  const [callOutcome, setCallOutcome] = useState<string>('');
  const [discussionNotes, setDiscussionNotes] = useState<string>('');
  const [scheduleFollowUp, setScheduleFollowUp] = useState<boolean>(false);
  const [followUpDueAt, setFollowUpDueAt] = useState<string>('');
  const [followUpTitle, setFollowUpTitle] = useState<string>('');
  const [followUpNotes, setFollowUpNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize modal state on open
  useEffect(() => {
    if (lead) {
      setStatus(lead.status || 'New');
      setCallOutcome('');
      setDiscussionNotes('');
      setError(null);

      // Default follow up due tomorrow 11:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(11, 0, 0, 0);
      setFollowUpDueAt(tomorrow.toISOString().slice(0, 16));
      setFollowUpTitle(`Follow-up with ${lead.first_name || 'Prospect'}`);
      setFollowUpNotes('');

      // Auto-toggle follow-up if status is Follow-up
      setScheduleFollowUp(lead.status === 'Follow-up');
    }
  }, [lead, isOpen]);

  // Handle status selection
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus === 'Follow-up' || newStatus === 'Interested') {
      setScheduleFollowUp(true);
      if (!callOutcome) {
        setCallOutcome(newStatus === 'Follow-up' ? 'Follow-up Required' : 'Interested');
      }
    }
  };

  const statusOptions = [
    { label: 'Fresh (New)', value: 'New', color: 'border-cyan-500 text-cyan-600 bg-cyan-50' },
    { label: 'Contacted', value: 'Contacted', color: 'border-indigo-500 text-indigo-600 bg-indigo-50' },
    { label: 'Interested', value: 'Interested', color: 'border-amber-500 text-amber-600 bg-amber-50' },
    { label: 'Follow-up', value: 'Follow-up', color: 'border-purple-500 text-purple-600 bg-purple-50' },
    { label: 'Qualified', value: 'Qualified', color: 'border-blue-500 text-blue-600 bg-blue-50' },
    { label: 'Converted', value: 'Converted', color: 'border-emerald-500 text-emerald-600 bg-emerald-50' },
    { label: 'Lost', value: 'Lost', color: 'border-rose-500 text-rose-600 bg-rose-50' },
  ];

  const outcomesList = [
    'Connected',
    'Interested',
    'Follow-up Required',
    'Call Later',
    'Busy',
    'No Answer',
    'Not Reachable',
    'Wrong Number',
    'Not Interested',
    'Demo/Meeting Scheduled',
    'Converted',
    'Lost',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (scheduleFollowUp && !followUpDueAt) {
      setError('Please select a valid follow-up date and time.');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        status,
        notes: discussionNotes.trim() || undefined,
        call_outcome: callOutcome || undefined,
        schedule_follow_up: scheduleFollowUp,
        follow_up_due_at: scheduleFollowUp ? followUpDueAt : undefined,
        follow_up_title: scheduleFollowUp ? followUpTitle : undefined,
        follow_up_notes: scheduleFollowUp ? (followUpNotes.trim() || discussionNotes.trim()) : undefined,
      };

      const res = await api.put(`/leads/${lead.id}`, payload);
      if (res.success) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update lead status.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Lead & Schedule Follow-up"
      description={`Updating status for ${lead.first_name} ${lead.last_name || ''} (${lead.phone})`}
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={handleSubmit} isLoading={isLoading}>
            Save & Update Status
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}

        {/* Lead Summary Header Card */}
        <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient text-white flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-zinc-900">
                {lead.first_name} {lead.last_name || ''}
              </div>
              <div className="text-zinc-500 font-mono text-[11px]">{lead.phone}</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 font-medium block">Current Status</span>
            <span className="font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded text-[11px]">
              {lead.status}
            </span>
          </div>
        </div>

        {/* Select New Status */}
        <div>
          <label className="block text-xs font-bold text-zinc-800 mb-2">
            Select New Status *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {statusOptions.map((opt) => {
              const isSelected = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleStatusChange(opt.value)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'border-purple-600 bg-brand-gradient text-white shadow-sm ring-2 ring-purple-200'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Call Outcome Quick Selector */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Call Outcome (Optional)
          </label>
          <select
            value={callOutcome}
            onChange={(e) => {
              setCallOutcome(e.target.value);
              if (e.target.value === 'Follow-up Required' || e.target.value === 'Call Later') {
                setScheduleFollowUp(true);
              }
            }}
            className="w-full text-xs rounded-xl border border-zinc-200 p-2.5 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
          >
            <option value="">No call outcome / Note only</option>
            {outcomesList.map((oc) => (
              <option key={oc} value={oc}>
                {oc}
              </option>
            ))}
          </select>
        </div>

        {/* Discussion / Call Notes */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1">
            Discussion / Client Notes
          </label>
          <textarea
            value={discussionNotes}
            onChange={(e) => setDiscussionNotes(e.target.value)}
            placeholder="Record client requirement, budget discussed, reason for status update..."
            rows={3}
            className="w-full text-xs rounded-xl border border-zinc-200 p-2.5 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
          />
        </div>

        {/* Next Follow-up Section */}
        <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-zinc-900">Schedule Next Follow-up</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleFollowUp}
                onChange={(e) => setScheduleFollowUp(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {scheduleFollowUp && (
            <div className="pt-2 border-t border-purple-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Follow-up Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={followUpDueAt}
                  onChange={(e) => setFollowUpDueAt(e.target.value)}
                  className="w-full text-xs rounded-xl border border-zinc-300 p-2 bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                  required={scheduleFollowUp}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Follow-up Purpose / Title
                </label>
                <input
                  type="text"
                  value={followUpTitle}
                  onChange={(e) => setFollowUpTitle(e.target.value)}
                  placeholder="e.g. Discuss property quotation / Callback"
                  className="w-full text-xs rounded-xl border border-zinc-300 p-2 bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Follow-up Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="e.g. Send WhatsApp brochure before calling"
                  className="w-full text-xs rounded-xl border border-zinc-300 p-2 bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
