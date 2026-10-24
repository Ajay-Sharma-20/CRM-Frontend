import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { api } from '../../lib/api/client';
import { Lead } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge, Badge } from '../../components/Badge';
import { Alert } from '../../components/Alert';
import { CallOutcomeModal } from '../calls/CallOutcomeModal';
import { LeadAssignModal } from './LeadAssignModal';
import {
  ArrowLeft,
  PhoneCall,
  UserCheck,
  CalendarCheck,
  Building,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  CheckCircle,
  FileText,
  Plus,
  Building2,
  Tag,
} from 'lucide-react';

export const LeadDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'calls' | 'followups' | 'notes'>('timeline');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Note
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Modals
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchLead = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/leads/${id}`);
      if (res.success) {
        setLead(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Lead not found or permission denied.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLead();
  }, [id]);

  const handleInitiateCall = () => {
    if (lead) {
      window.location.href = `tel:${lead.phone}`;
      setIsCallModalOpen(true);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !lead) return;

    setIsSavingNote(true);
    try {
      await api.put(`/leads/${lead.id}`, { notes: noteContent });
      setNoteContent('');
      fetchLead();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setIsSavingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Alert type="error" title="Access Denied / Not Found">
          {error || 'Unable to load lead details.'}
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/leads')}>
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/leads')}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leads</span>
        </button>

        <div className="flex items-center gap-2">
          {hasPermission('leads.assign') && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UserCheck className="w-4 h-4" />}
              onClick={() => setIsAssignModalOpen(true)}
            >
              Assign
            </Button>
          )}
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<PhoneCall className="w-4 h-4" />}
            onClick={handleInitiateCall}
          >
            Call Lead
          </Button>
        </div>
      </div>

      {/* Lead Header Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-xl font-bold shadow-brand">
            {lead.first_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900">
                {lead.first_name} {lead.last_name}
              </h1>
              <StatusBadge status={lead.status} />
              <Badge variant="gray">{lead.source}</Badge>
              {lead.business && (
                <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2.5 py-0.5 rounded-lg border border-purple-200">
                  🏢 {lead.business.name}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-zinc-600 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                {lead.phone}
              </span>
              {lead.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  {lead.email}
                </span>
              )}
              {lead.company && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-zinc-400" />
                  {lead.company} {lead.job_title && `(${lead.job_title})`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-1.5 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100">
          <div className="text-xs text-zinc-400">Assigned Owner</div>
          <div className="text-sm font-semibold text-zinc-900">
            {lead.owner ? lead.owner.name : <span className="text-amber-600">Unassigned</span>}
          </div>
          {lead.estimated_value && (
            <div className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full mt-1">
              ₹{Number(lead.estimated_value).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Business-Specific Custom Attributes Card */}
      {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
        <Card title={`Business Attributes (${lead.business?.name || 'Custom Data'})`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(lead.custom_fields).map(([key, val]) => {
              const matchedCol = lead.business?.custom_columns?.find((c) => c.key === key);
              const label = matchedCol?.label || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
              return (
                <div key={key} className="bg-purple-50/50 border border-purple-100/80 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider block mb-1">
                    {label}
                  </span>
                  <span className="text-xs font-semibold text-zinc-800 break-words">
                    {String(val) || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        {[
          { key: 'timeline', label: 'Activity Timeline' },
          { key: 'calls', label: `Call History (${lead.call_logs?.length ?? 0})` },
          { key: 'followups', label: `Follow-ups (${lead.follow_ups?.length ?? 0})` },
          { key: 'notes', label: `Notes (${lead.lead_notes?.length ?? 0})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === t.key
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Activity Timeline */}
      {activeTab === 'timeline' && (
        <Card title="Chronological Lead History">
          <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:left-2.5 before:w-0.5 before:bg-zinc-200">
            {lead.activities && lead.activities.length > 0 ? (
              lead.activities.map((act) => (
                <div key={act.id} className="relative flex items-start gap-3">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                  <div className="flex-1 bg-zinc-50/70 p-3 rounded-xl border border-zinc-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900 capitalize">
                        {act.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(act.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1 leading-normal">{act.description}</p>
                    {act.user && (
                      <span className="text-[10px] text-purple-600 font-medium mt-1 block">
                        by {act.user.name}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 py-4">No activity logged yet.</p>
            )}
          </div>
        </Card>
      )}

      {/* Tab 2: Call History */}
      {activeTab === 'calls' && (
        <Card title="Call Logs" subtitle="Manual outcomes and audio connection attempts">
          <div className="divide-y divide-zinc-100">
            {lead.call_logs && lead.call_logs.length > 0 ? (
              lead.call_logs.map((call) => (
                <div key={call.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900">{call.outcome}</span>
                        {call.duration_seconds && (
                          <span className="text-[10px] text-zinc-400">
                            • {gmdate(call.duration_seconds)}
                          </span>
                        )}
                      </div>
                      {call.notes && <p className="text-xs text-zinc-600 mt-1">{call.notes}</p>}
                      <div className="text-[10px] text-zinc-400 mt-1">
                        Called by {call.user?.name || 'Agent'} on{' '}
                        {new Date(call.called_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 py-4 text-center">No calls recorded yet for this lead.</p>
            )}
          </div>
        </Card>
      )}

      {/* Tab 3: Follow-ups */}
      {activeTab === 'followups' && (
        <Card title="Scheduled Follow-ups">
          <div className="divide-y divide-zinc-100">
            {lead.follow_ups && lead.follow_ups.length > 0 ? (
              lead.follow_ups.map((fu) => (
                <div key={fu.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-zinc-900">{fu.title}</h4>
                      <StatusBadge status={fu.status} size="sm" />
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>Due: {new Date(fu.due_at).toLocaleString()}</span>
                    </div>
                    {fu.notes && <p className="text-xs text-zinc-600 mt-1">"{fu.notes}"</p>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-400 py-4 text-center">No follow-ups scheduled.</p>
            )}
          </div>
        </Card>
      )}

      {/* Tab 4: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <Card title="Add Discussion Note">
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write a note about this customer..."
                rows={3}
                className="w-full text-xs rounded-lg border border-zinc-300 p-2.5 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
              />
              <div className="flex justify-end">
                <Button variant="gradient" size="sm" isLoading={isSavingNote}>
                  Post Note
                </Button>
              </div>
            </form>
          </Card>

          <Card title="Saved Notes">
            <div className="divide-y divide-zinc-100">
              {lead.lead_notes && lead.lead_notes.length > 0 ? (
                lead.lead_notes.map((n) => (
                  <div key={n.id} className="py-3">
                    <p className="text-xs text-zinc-800 leading-relaxed">{n.content}</p>
                    <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-2">
                      <span>{n.user?.name || 'User'}</span>
                      <span>•</span>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 py-4 text-center">No notes saved yet.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modals */}
      <CallOutcomeModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        lead={lead}
        onSuccess={() => {
          setIsCallModalOpen(false);
          fetchLead();
        }}
      />

      <LeadAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        lead={lead}
        onSuccess={() => {
          setIsAssignModalOpen(false);
          fetchLead();
        }}
      />
    </div>
  );
};

function gmdate(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}
