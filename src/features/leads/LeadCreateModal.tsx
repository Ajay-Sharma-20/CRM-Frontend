import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { User, Team } from '../../types';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Alert } from '../../components/Alert';
import { AlertTriangle, UserCheck } from 'lucide-react';

interface LeadCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLead: any) => void;
}

export const LeadCreateModal: React.FC<LeadCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState('New');
  const [source, setSource] = useState('Website');
  const [ownerId, setOwnerId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [notes, setNotes] = useState('');

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.get('/users').then((res) => res.success && setUsers(res.data)).catch(() => {});
      api.get('/teams').then((res) => res.success && setTeams(res.data)).catch(() => {});
    }
  }, [isOpen]);

  const handleSubmit = async (ignoreDuplicate = false) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post('/leads', {
        first_name: firstName,
        last_name: lastName || undefined,
        phone,
        email: email || undefined,
        company: company || undefined,
        job_title: jobTitle || undefined,
        status,
        source,
        owner_id: ownerId ? parseInt(ownerId, 10) : undefined,
        team_id: teamId ? parseInt(teamId, 10) : undefined,
        estimated_value: estimatedValue ? parseFloat(estimatedValue) : undefined,
        notes: notes || undefined,
        ignore_duplicate_warning: ignoreDuplicate,
      });

      if (res.success) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err: any) {
      if (err.status === 409 && err.data?.is_duplicate) {
        setDuplicateWarning(err.data.duplicate_lead);
      } else {
        setError(err.message || 'Failed to create lead.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Lead"
      description="Add a prospect to the CRM pipeline"
      maxWidth="2xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={() => handleSubmit(false)} isLoading={isLoading}>
            Save Lead
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}

        {/* Duplicate Warning Prompt */}
        {duplicateWarning && (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">Potential Duplicate Detected</h4>
                <p className="text-xs text-amber-800 mt-1">
                  A lead with this phone/email already exists: <br />
                  <span className="font-semibold">{duplicateWarning.name}</span> ({duplicateWarning.phone}) — Status: {duplicateWarning.status}, Owner: {duplicateWarning.owner}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDuplicateWarning(null)}
              >
                Cancel & Edit
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSubmit(true)}
                isLoading={isLoading}
              >
                Create Anyway
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Rahul"
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Sharma"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number *"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rahul@company.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Acme Innovations"
          />
          <Input
            label="Estimated Deal Value (₹)"
            type="number"
            min="0"
            value={estimatedValue}
            onChange={(e) => setEstimatedValue(e.target.value)}
            placeholder="e.g. 50000"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Initial Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: 'New', value: 'New' },
              { label: 'Assigned', value: 'Assigned' },
              { label: 'Contacted', value: 'Contacted' },
              { label: 'Interested', value: 'Interested' },
              { label: 'Follow-up', value: 'Follow-up' },
              { label: 'Qualified', value: 'Qualified' },
            ]}
          />
          <Select
            label="Lead Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={[
              { label: 'Website', value: 'Website' },
              { label: 'Referral', value: 'Referral' },
              { label: 'Cold Call', value: 'Cold Call' },
              { label: 'Campaign', value: 'Campaign' },
              { label: 'Inbound', value: 'Inbound' },
              { label: 'Events', value: 'Events' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Assign to Telecaller / User"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            placeholder="Select User"
            options={users.map((u) => ({ label: `${u.name} (${u.role?.name})`, value: u.id }))}
          />
          <Select
            label="Assign to Team"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="Select Team"
            options={teams.map((t) => ({ label: t.name, value: t.id }))}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-700 mb-1.5">Initial Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Requirements, source campaign, discussion notes..."
            rows={2}
            className="w-full text-xs rounded-lg border border-zinc-300 p-2.5 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
          />
        </div>
      </div>
    </Modal>
  );
};
