import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { Lead, User, Team } from '../../types';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';

interface LeadAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess: (updatedLead: Lead) => void;
}

export const LeadAssignModal: React.FC<LeadAssignModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [ownerId, setOwnerId] = useState(lead.owner_id ? String(lead.owner_id) : '');
  const [teamId, setTeamId] = useState(lead.team_id ? String(lead.team_id) : '');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOwnerId(lead.owner_id ? String(lead.owner_id) : '');
      setTeamId(lead.team_id ? String(lead.team_id) : '');
      setReason('');
      api.get('/users').then((res) => res.success && setUsers(res.data)).catch(() => {});
      api.get('/teams').then((res) => res.success && setTeams(res.data)).catch(() => {});
    }
  }, [isOpen, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post(`/leads/${lead.id}/assign`, {
        owner_id: ownerId ? parseInt(ownerId, 10) : null,
        team_id: teamId ? parseInt(teamId, 10) : null,
        reason: reason || undefined,
      });

      if (res.success) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reassign lead.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign / Reassign Lead"
      description={`Currently assigned to: ${lead.owner?.name || 'Unassigned'}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={handleSubmit} isLoading={isLoading}>
            Confirm Assignment
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}

        <Select
          label="Assign to Telecaller / User"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          placeholder="Unassigned"
          options={users.map((u) => {
            const due = u.due_leads_count ?? u.leads_count ?? 0;
            return {
              label: `${u.name} (${u.role?.name || 'Agent'}) — ${due} Due Leads`,
              value: u.id,
            };
          })}
        />

        {ownerId && (
          (() => {
            const selectedU = users.find((u) => String(u.id) === String(ownerId));
            if (!selectedU) return null;
            const due = selectedU.due_leads_count ?? selectedU.leads_count ?? 0;
            const total = selectedU.leads_count ?? 0;
            return (
              <div className="text-xs bg-purple-50 text-purple-900 border border-purple-200/80 rounded-xl px-3 py-2 flex items-center justify-between">
                <span>Workload: <strong>{due} due leads</strong></span>
                <span className="text-zinc-500 text-[11px]">Total assigned: {total}</span>
              </div>
            );
          })()
        )}

        <Select
          label="Assign to Team"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          placeholder="No Team"
          options={teams.map((t) => ({ label: t.name, value: t.id }))}
        />

        <Input
          label="Assignment Reason (Optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Territory redistribution, language match..."
        />
      </form>
    </Modal>
  );
};
