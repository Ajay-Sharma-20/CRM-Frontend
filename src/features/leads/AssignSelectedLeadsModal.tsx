import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { Lead, User } from '../../types';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Alert } from '../../components/Alert';
import { UserCheck, Users, CheckCircle2, AlertCircle } from 'lucide-react';

interface AssignSelectedLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds: number[];
  leads: Lead[];
  onSuccess: () => void;
}

export const AssignSelectedLeadsModal: React.FC<AssignSelectedLeadsModalProps> = ({
  isOpen,
  onClose,
  selectedLeadIds,
  leads,
  onSuccess,
}) => {
  const [telecallers, setTelecallers] = useState<User[]>([]);
  const [selectedTelecallerId, setSelectedTelecallerId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Fetch active telecallers / managers on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessInfo(null);
      setReason('');

      api.get('/users').then((res) => {
        if (res.success) {
          const callers = (res.data as User[]).filter(
            (u) => u.status === 'active' && (u.role?.slug === 'telecaller' || u.role?.slug === 'manager' || u.role?.slug === 'admin')
          );
          setTelecallers(callers);
          if (callers.length > 0 && !selectedTelecallerId) {
            setSelectedTelecallerId(String(callers[0].id));
          }
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  const selectedCaller = telecallers.find((t) => String(t.id) === selectedTelecallerId);
  const selectedLeadsPreview = leads.filter((l) => selectedLeadIds.includes(l.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTelecallerId) {
      setError('Please select a telecaller to assign the selected leads.');
      return;
    }
    if (selectedLeadIds.length === 0) {
      setError('No leads selected.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/leads/bulk-assign', {
        telecaller_id: parseInt(selectedTelecallerId, 10),
        mode: 'ids',
        lead_ids: selectedLeadIds,
        reason: reason || undefined,
      });

      if (res.success) {
        setSuccessInfo(res.message || `Successfully assigned ${selectedLeadIds.length} lead(s) to ${selectedCaller?.name}.`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to assign selected leads.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Selected Leads"
      description={`Assign ${selectedLeadIds.length} individually selected lead${selectedLeadIds.length === 1 ? '' : 's'} to a telecaller`}
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleSubmit}
            isLoading={isLoading}
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            Assign {selectedLeadIds.length} Selected Lead{selectedLeadIds.length === 1 ? '' : 's'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        {successInfo && <Alert type="success">{successInfo}</Alert>}

        {/* Selected Leads Summary Pill */}
        <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              Selected Leads Count
            </span>
            <span className="font-extrabold text-purple-900 bg-purple-200/60 px-2 py-0.5 rounded-md">
              {selectedLeadIds.length} Lead{selectedLeadIds.length === 1 ? '' : 's'} Selected
            </span>
          </div>

          {/* Quick list preview of selected lead names */}
          {selectedLeadsPreview.length > 0 && (
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-xs text-zinc-700 pt-1 border-t border-purple-200/50">
              {selectedLeadsPreview.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-0.5">
                  <span className="font-medium text-zinc-900">
                    {lead.first_name} {lead.last_name || ''} {lead.company ? `(${lead.company})` : ''}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">{lead.phone}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Telecaller Selection with Due Leads */}
        <div>
          <Select
            label="Assign to Telecaller *"
            value={selectedTelecallerId}
            onChange={(e) => setSelectedTelecallerId(e.target.value)}
            placeholder="Select Telecaller"
            options={telecallers.map((t) => {
              const due = t.due_leads_count ?? t.leads_count ?? 0;
              return {
                label: `${t.name} (${t.role?.name || 'Agent'}) — ${due} Due Leads`,
                value: String(t.id),
              };
            })}
            required
          />

          {/* Current Due Leads Workload Card */}
          {selectedCaller && (
            <div className="mt-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-purple-950">
                  {selectedCaller.name} ({selectedCaller.role?.name})
                </div>
                <div className="text-[11px] text-zinc-600">
                  Active workload: <strong className="text-purple-700 font-bold">{selectedCaller.due_leads_count ?? selectedCaller.leads_count ?? 0} due leads</strong>
                </div>
              </div>
              <div className="text-right text-[11px] text-zinc-500">
                Total Assigned: <span className="font-semibold text-zinc-700">{selectedCaller.leads_count ?? 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Reason / Note */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
            Assignment Reason / Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Selected from unassigned filter, priority redistribution"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs bg-white border border-zinc-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </form>
    </Modal>
  );
};
