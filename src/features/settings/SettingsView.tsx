import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { useAuth } from '../../lib/auth/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Alert } from '../../components/Alert';
import { LoadingSkeleton } from '../../components/EmptyState';
import { Settings, Plus, X, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { hasPermission } = useAuth();
  const [statuses, setStatuses] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);

  const [newStatus, setNewStatus] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [newSource, setNewSource] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.success) {
        setStatuses(res.data.lead_statuses || []);
        setOutcomes(res.data.call_outcomes || []);
        setSources(res.data.lead_sources || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/settings', {
        lead_statuses: statuses,
        call_outcomes: outcomes,
        lead_sources: sources,
      });
      setSuccess('Workspace CRM settings saved successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const addStatus = () => {
    if (newStatus.trim() && !statuses.includes(newStatus.trim())) {
      setStatuses([...statuses, newStatus.trim()]);
      setNewStatus('');
    }
  };

  const removeStatus = (item: string) => {
    setStatuses(statuses.filter((s) => s !== item));
  };

  const addOutcome = () => {
    if (newOutcome.trim() && !outcomes.includes(newOutcome.trim())) {
      setOutcomes([...outcomes, newOutcome.trim()]);
      setNewOutcome('');
    }
  };

  const removeOutcome = (item: string) => {
    setOutcomes(outcomes.filter((o) => o !== item));
  };

  const addSource = () => {
    if (newSource.trim() && !sources.includes(newSource.trim())) {
      setSources([...sources, newSource.trim()]);
      setNewSource('');
    }
  };

  const removeSource = (item: string) => {
    setSources(sources.filter((s) => s !== item));
  };

  if (isLoading) {
    return <LoadingSkeleton rows={4} />;
  }

  const canManage = hasPermission('settings.manage');

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Workspace CRM Settings</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configure allowed CRM statuses, lead sources, and call outcomes without code changes.
          </p>
        </div>

        {canManage && (
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Settings
          </Button>
        )}
      </div>

      {success && <Alert type="success">{success}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      {/* Allowed Lead Statuses */}
      <Card title="Allowed Lead Statuses" subtitle="Lifecycle stages for leads in your company pipeline">
        <div className="flex flex-wrap gap-2 mb-4">
          {statuses.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"
            >
              {s}
              {canManage && (
                <button
                  type="button"
                  onClick={() => removeStatus(s)}
                  className="text-purple-400 hover:text-purple-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {canManage && (
          <div className="flex items-center gap-2 max-w-sm pt-2">
            <input
              type="text"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder="Add custom status..."
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 w-full outline-none focus:border-purple-600"
            />
            <Button variant="outline" size="sm" onClick={addStatus}>
              Add
            </Button>
          </div>
        )}
      </Card>

      {/* Call Outcomes */}
      <Card title="Permitted Call Outcomes" subtitle="Outcomes telecallers can select after concluding a phone attempt">
        <div className="flex flex-wrap gap-2 mb-4">
          {outcomes.map((o) => (
            <span
              key={o}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200"
            >
              {o}
              {canManage && (
                <button
                  type="button"
                  onClick={() => removeOutcome(o)}
                  className="text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {canManage && (
          <div className="flex items-center gap-2 max-w-sm pt-2">
            <input
              type="text"
              value={newOutcome}
              onChange={(e) => setNewOutcome(e.target.value)}
              placeholder="Add custom outcome..."
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 w-full outline-none focus:border-purple-600"
            />
            <Button variant="outline" size="sm" onClick={addOutcome}>
              Add
            </Button>
          </div>
        )}
      </Card>

      {/* Lead Acquisition Sources */}
      <Card title="Lead Acquisition Sources" subtitle="Campaigns and inbound channels used for lead tracking">
        <div className="flex flex-wrap gap-2 mb-4">
          {sources.map((src) => (
            <span
              key={src}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
            >
              {src}
              {canManage && (
                <button
                  type="button"
                  onClick={() => removeSource(src)}
                  className="text-blue-400 hover:text-blue-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {canManage && (
          <div className="flex items-center gap-2 max-w-sm pt-2">
            <input
              type="text"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              placeholder="Add custom source..."
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 w-full outline-none focus:border-purple-600"
            />
            <Button variant="outline" size="sm" onClick={addSource}>
              Add
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
