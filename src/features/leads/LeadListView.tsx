import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { api } from '../../lib/api/client';
import { Lead, User } from '../../types';
import { Button } from '../../components/Button';
import { StatusBadge, Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { EmptyState, LoadingSkeleton } from '../../components/EmptyState';
import { LeadCreateModal } from './LeadCreateModal';
import { LeadAssignModal } from './LeadAssignModal';
import { CsvImportModal } from './CsvImportModal';
import { CallOutcomeModal } from '../calls/CallOutcomeModal';
import {
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  PhoneCall,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

export const LeadListView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, hasPermission } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(searchParams.get('create') === '1');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [assigningLead, setAssigningLead] = useState<Lead | null>(null);
  const [callingLead, setCallingLead] = useState<Lead | null>(null);

  const fetchLeads = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get('/leads', {
        page,
        search,
        status,
        source,
        owner_id: ownerId,
        per_page: 15,
      });
      if (res.success) {
        setLeads(res.data);
        setMeta(res.meta);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
  }, [status, source, ownerId]);

  useEffect(() => {
    api.get('/users').then((res) => res.success && setUsers(res.data)).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const handleExportCsv = async () => {
    try {
      const blob = await api.get('/leads/export');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Export failed.');
    }
  };

  const handleInitiateCall = (lead: Lead) => {
    window.location.href = `tel:${lead.phone}`;
    setCallingLead(lead);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Leads Directory</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Browse, search, assign, and manage customer records across your workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasPermission('leads.export') && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCsv}
            >
              Export
            </Button>
          )}

          {hasPermission('leads.import') && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              onClick={() => setIsImportModalOpen(true)}
            >
              Import CSV
            </Button>
          )}

          {hasPermission('leads.create') && (
            <Button
              variant="gradient"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Lead
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, email, or company..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs rounded-lg border border-zinc-200 py-2 px-2.5 bg-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              {['New', 'Assigned', 'Contacted', 'Interested', 'Follow-up', 'Qualified', 'Converted', 'Lost'].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>

            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="text-xs rounded-lg border border-zinc-200 py-2 px-2.5 bg-white focus:outline-none"
            >
              <option value="">All Sources</option>
              {['Website', 'Referral', 'Cold Call', 'Campaign', 'Inbound', 'Events'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {user?.role?.slug !== 'telecaller' && (
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="text-xs rounded-lg border border-zinc-200 py-2 px-2.5 bg-white focus:outline-none"
              >
                <option value="">All Assignees</option>
                <option value="unassigned">Unassigned Only</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}

            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Leads Table */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="Try adjusting your search criteria or create a new lead."
            actionLabel={hasPermission('leads.create') ? 'Create Lead' : undefined}
            onAction={hasPermission('leads.create') ? () => setIsCreateModalOpen(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Phone / Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4">Deal Value</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {lead.company ? `${lead.company}` : <span className="italic text-zinc-400">No Company</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-zinc-800 font-semibold">{lead.phone}</div>
                      <div className="text-zinc-400 font-sans">{lead.email || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={lead.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.owner ? (
                        <span className="font-medium text-zinc-800">{lead.owner.name}</span>
                      ) : (
                        <Badge variant="warning" size="sm">Unassigned</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">
                      {lead.estimated_value ? `₹${Number(lead.estimated_value).toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInitiateCall(lead)}
                          title="Call Lead"
                          className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </button>
                        {hasPermission('leads.assign') && (
                          <button
                            type="button"
                            onClick={() => setAssigningLead(lead)}
                            title="Assign Lead"
                            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {meta.last_page > 1 && (
          <div className="p-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Showing {leads.length} of {meta.total} records
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page <= 1}
                onClick={() => fetchLeads(meta.current_page - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="px-2 font-medium">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => fetchLeads(meta.current_page + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <LeadCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSearchParams({});
        }}
        onSuccess={() => fetchLeads(1)}
      />

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => fetchLeads(1)}
      />

      {assigningLead && (
        <LeadAssignModal
          isOpen={!!assigningLead}
          onClose={() => setAssigningLead(null)}
          lead={assigningLead}
          onSuccess={() => {
            setAssigningLead(null);
            fetchLeads(meta.current_page);
          }}
        />
      )}

      {callingLead && (
        <CallOutcomeModal
          isOpen={!!callingLead}
          onClose={() => setCallingLead(null)}
          lead={callingLead}
          onSuccess={() => {
            setCallingLead(null);
            fetchLeads(meta.current_page);
          }}
        />
      )}
    </div>
  );
};
