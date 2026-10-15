import React, { useState } from 'react';
import { Lead } from '../../types';
import { api } from '../../lib/api/client';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import { PhoneCall, Calendar, Clock, CheckCircle } from 'lucide-react';

interface CallOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess: () => void;
}

export const CallOutcomeModal: React.FC<CallOutcomeModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const [outcome, setOutcome] = useState('Connected');
  const [duration, setDuration] = useState('60'); // in seconds
  const [notes, setNotes] = useState('');
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  const [followUpDueAt, setFollowUpDueAt] = useState('');
  const [followUpTitle, setFollowUpTitle] = useState('Follow-up Discussion');
  const [updateStatus, setUpdateStatus] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outcomesList = [
    { label: 'Connected', value: 'Connected' },
    { label: 'Interested', value: 'Interested' },
    { label: 'Follow-up Required', value: 'Follow-up Required' },
    { label: 'Call Later', value: 'Call Later' },
    { label: 'Busy', value: 'Busy' },
    { label: 'No Answer', value: 'No Answer' },
    { label: 'Not Reachable', value: 'Not Reachable' },
    { label: 'Wrong Number', value: 'Wrong Number' },
    { label: 'Not Interested', value: 'Not Interested' },
    { label: 'Demo/Meeting Scheduled', value: 'Demo/Meeting Scheduled' },
    { label: 'Converted', value: 'Converted' },
    { label: 'Lost', value: 'Lost' },
  ];

  const handleOutcomeChange = (val: string) => {
    setOutcome(val);
    if (val === 'Follow-up Required' || val === 'Call Later' || val === 'Demo/Meeting Scheduled') {
      setScheduleFollowUp(true);
      if (!followUpDueAt) {
        // default to tomorrow same time
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setMinutes(0);
        setFollowUpDueAt(tomorrow.toISOString().slice(0, 16));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (outcome === 'Follow-up Required' && !followUpDueAt) {
      setError('Please select a Follow-up date and time for this outcome.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/calls', {
        lead_id: lead.id,
        outcome,
        duration_seconds: duration ? parseInt(duration, 10) : null,
        notes: notes || undefined,
        schedule_follow_up: scheduleFollowUp,
        follow_up_due_at: scheduleFollowUp ? followUpDueAt : undefined,
        follow_up_title: scheduleFollowUp ? followUpTitle : undefined,
        follow_up_notes: notes || undefined,
        update_lead_status: updateStatus || undefined,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to record call outcome.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Call Outcome & Notes"
      description={`Logging call with ${lead.first_name} ${lead.last_name || ''} (${lead.phone})`}
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={handleSubmit} isLoading={isLoading}>
            Save Call Outcome
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Call Outcome *"
            value={outcome}
            onChange={(e) => handleOutcomeChange(e.target.value)}
            options={outcomesList}
          />

          <Input
            label="Approx. Duration (Seconds)"
            type="number"
            min="0"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 120"
            leftIcon={<Clock className="w-4 h-4 text-zinc-400" />}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">
            Call Discussion Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key discussion points, customer requirements, pain points..."
            rows={3}
            className="w-full text-xs rounded-lg border border-zinc-300 p-2.5 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
          />
        </div>

        {/* Follow-up Section */}
        <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              Schedule Next Follow-up
            </label>
            <input
              type="checkbox"
              id="schedule_fu"
              checked={scheduleFollowUp}
              onChange={(e) => setScheduleFollowUp(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
            />
          </div>

          {scheduleFollowUp && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Input
                label="Follow-up Date & Time *"
                type="datetime-local"
                required={scheduleFollowUp}
                value={followUpDueAt}
                onChange={(e) => setFollowUpDueAt(e.target.value)}
              />
              <Input
                label="Follow-up Title"
                value={followUpTitle}
                onChange={(e) => setFollowUpTitle(e.target.value)}
                placeholder="e.g. Demo Walkthrough"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
