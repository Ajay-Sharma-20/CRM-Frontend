import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { Business, User } from '../../types';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import { UserCheck, Users, Filter, Hash, CheckCircle2, Building2 } from 'lucide-react';

interface LeadBulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultBusinessId?: string;
}

export const LeadBulkAssignModal: React.FC<LeadBulkAssignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultBusinessId = '',
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(defaultBusinessId);
  const [telecallers, setTelecallers] = useState<User[]>([]);
  const [selectedTelecallerId, setSelectedTelecallerId] = useState<string>('');

  const [mode, setMode] = useState<'range' | 'count'>('range');
  const [fromIndex, setFromIndex] = useState<string>('1');
  const [toIndex, setToIndex] = useState<string>('10');
  const [batchCount, setBatchCount] = useState<string>('25');
  const [statusFilter, setStatusFilter] = useState<string>('unassigned');
  const [reason, setReason] = useState<string>('');

  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Fetch initial options
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessInfo(null);
      if (defaultBusinessId) {
        setSelectedBusinessId(defaultBusinessId);
      }

      // Fetch businesses
      api.get('/businesses').then((res) => {
        if (res.success) setBusinesses(res.data);
      }).catch(() => {});

      // Fetch users
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
  }, [isOpen, defaultBusinessId]);

  // Fetch available count based on selected business & status filter
  useEffect(() => {
    if (isOpen) {
      setIsCounting(true);
      const params: Record<string, any> = {
        per_page: 1,
      };
      if (selectedBusinessId) {
        params.business_id = selectedBusinessId;
      }
      if (statusFilter === 'unassigned') {
        params.owner_id = 'unassigned';
      } else if (statusFilter) {
        params.status = statusFilter;
      }

      api.get('/leads', params)
        .then((res) => {
          if (res.success && res.meta) {
            setAvailableCount(res.meta.total);
          }
        })
        .catch(() => {})
        .finally(() => setIsCounting(false));
    }
  }, [isOpen, selectedBusinessId, statusFilter]);

  const calculateTargetCount = () => {
    if (mode === 'range') {
      const from = parseInt(fromIndex, 10) || 0;
      const to = parseInt(toIndex, 10) || 0;
      if (to >= from && from > 0) {
        return to - from + 1;
      }
      return 0;
    } else {
      return parseInt(batchCount, 10) || 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!selectedTelecallerId) {
      setError('Please select a telecaller to assign leads.');
      return;
    }

    if (mode === 'range') {
      const from = parseInt(fromIndex, 10);
      const to = parseInt(toIndex, 10);
      if (isNaN(from) || isNaN(to) || from < 1 || to < from) {
        setError('Please enter a valid starting and ending range (e.g. 1 to 8, or 12 to 22).');
        return;
      }
    } else {
      const count = parseInt(batchCount, 10);
      if (isNaN(count) || count < 1) {
        setError('Please enter a valid lead count to assign.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload: any = {
        telecaller_id: parseInt(selectedTelecallerId, 10),
        business_id: selectedBusinessId ? parseInt(selectedBusinessId, 10) : undefined,
        status: statusFilter || undefined,
        mode,
        reason: reason || undefined,
      };

      if (mode === 'range') {
        payload.from_index = parseInt(fromIndex, 10);
        payload.to_index = parseInt(toIndex, 10);
      } else {
        payload.count = parseInt(batchCount, 10);
      }

      const res = await api.post('/leads/bulk-assign', payload);
      if (res.success) {
        setSuccessInfo(res.message);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to bulk assign leads.');
    } finally {
      setIsLoading(false);
    }
  };

  const targetCount = calculateTargetCount();
  const selectedCaller = telecallers.find((t) => String(t.id) === selectedTelecallerId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Assign Leads by Range"
      description="Quickly distribute batches of leads (e.g. 1 to 8, 12 to 22) to specific telecallers"
      maxWidth="lg"
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
            Assign {targetCount > 0 ? `${targetCount} Leads` : 'Leads'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        {successInfo && <Alert type="success">{successInfo}</Alert>}

        {/* Filter scope card */}
        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-purple-600" />
              Lead Queue Filters
            </span>
            <div className="text-xs text-purple-800 font-medium">
              {isCounting ? (
                <span className="text-zinc-400">Counting leads...</span>
              ) : (
                <span>
                  Available Pool: <strong className="font-bold text-purple-950">{availableCount ?? 0} leads</strong>
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Business / Campaign"
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              placeholder="All Businesses"
              options={businesses.map((b) => ({
                label: `${b.name} (${b.leads_count ?? 0} leads)`,
                value: String(b.id),
              }))}
            />

            <Select
              label="Lead Status Pool"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'Unassigned Leads Only', value: 'unassigned' },
                { label: 'New Leads', value: 'New' },
                { label: 'All Pool Leads', value: '' },
              ]}
            />
          </div>
        </div>

        {/* Assignment Mode Switcher */}
        <div>
          <label className="block text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-2">
            Selection Method
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('range')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                mode === 'range'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              By Index Range (e.g. 1 to 8, 12 to 22)
            </button>
            <button
              type="button"
              onClick={() => setMode('count')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                mode === 'count'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              By Batch Count (e.g. First 50)
            </button>
          </div>
        </div>

        {/* Range or Count inputs */}
        {mode === 'range' ? (
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-700">
              <Hash className="w-4 h-4 text-purple-600" />
              Specify Lead Range in Queue:
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="From Index #"
                type="number"
                min="1"
                placeholder="1"
                value={fromIndex}
                onChange={(e) => setFromIndex(e.target.value)}
                required
              />
              <Input
                label="To Index #"
                type="number"
                min="1"
                placeholder="8"
                value={toIndex}
                onChange={(e) => setToIndex(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-200/60">
              <span>Quick Example: 1 to 8 (8 leads), or 12 to 22 (11 leads).</span>
              <span className="font-semibold text-purple-700">
                Selected: {targetCount} leads
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
            <Input
              label="Number of Leads to Assign"
              type="number"
              min="1"
              max="1000"
              placeholder="e.g. 25"
              value={batchCount}
              onChange={(e) => setBatchCount(e.target.value)}
              required
            />
            <p className="text-xs text-zinc-500">
              Assigns the next {batchCount || 0} leads from the top of the pool.
            </p>
          </div>
        )}

        {/* Telecaller Selection */}
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
          {selectedCaller && (
            <div className="mt-2 text-xs bg-purple-50 text-purple-900 border border-purple-200/80 rounded-xl px-3 py-2 flex items-center justify-between">
              <span>Current Workload: <strong>{selectedCaller.due_leads_count ?? selectedCaller.leads_count ?? 0} due leads</strong></span>
              <span className="text-zinc-500 text-[11px]">Total assigned: {selectedCaller.leads_count ?? 0}</span>
            </div>
          )}
        </div>

        {/* Batch Note */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
            Allocation Note / Reason (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Morning Calling Batch, High-Intent Follow-ups"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs bg-white border border-zinc-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Summary Preview Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/70 p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-zinc-900">
                Assigning {targetCount} leads to {selectedCaller ? selectedCaller.name : 'Selected Agent'}
                {selectedCaller && (
                  <span className="ml-2 text-purple-700 font-normal">
                    (Currently has <strong>{selectedCaller.due_leads_count ?? selectedCaller.leads_count ?? 0}</strong> due leads)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-600">
                These leads will instantly appear in their personal work queue and disappear from unassigned pool.
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
