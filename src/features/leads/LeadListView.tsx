import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import { api } from '../../lib/api/client';
import { Lead, User, Business } from '../../types';
import { Button } from '../../components/Button';
import { StatusBadge, Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { EmptyState, LoadingSkeleton } from '../../components/EmptyState';
import { LeadCreateModal } from './LeadCreateModal';
import { LeadAssignModal } from './LeadAssignModal';
import { LeadBulkAssignModal } from './LeadBulkAssignModal';
import { CsvImportModal } from './CsvImportModal';
import { LeadCard } from './LeadCard';
import { LeadUpdateModal } from './LeadUpdateModal';
import { BusinessCreateModal } from '../businesses/BusinessCreateModal';
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
  Building2,
  Users,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';

export const LeadListView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, hasPermission } = useAuth();
  const isTelecaller = user?.role?.slug === 'telecaller';

  // Category filter state synced with URL searchParams (fresh, calls_today, interested, converted, priority, all)
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
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
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [isCreateBusinessOpen, setIsCreateBusinessOpen] = useState(false);
  const [assigningLead, setAssigningLead] = useState<Lead | null>(null);
  const [callingLead, setCallingLead] = useState<Lead | null>(null);
  const [updatingLead, setUpdatingLead] = useState<Lead | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const fetchBusinesses = async () => {
    try {
      const res = await api.get('/businesses');
      if (res.success) {
        setBusinesses(res.data);
      }
    } catch {
      // ignore
    }
  };

  const fetchLeads = async (page = 1, categoryToFetch = selectedCategory) => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        search,
        status,
        source,
        owner_id: ownerId,
        business_id: selectedBusinessId || undefined,
        per_page: 15,
      };
      if (categoryToFetch && categoryToFetch !== 'all') {
        params.category = categoryToFetch;
      }
      const res = await api.get('/leads', params);
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

  // Sync category state when URL changes
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    fetchBusinesses();
    api.get('/users').then((res) => res.success && setUsers(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchLeads(1, selectedCategory);
  }, [status, source, ownerId, selectedBusinessId, selectedCategory]);

  const handleCategoryChange = (newCat: string) => {
    setSelectedCategory(newCat);
    const newParams = new URLSearchParams(searchParams);
    if (newCat === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', newCat);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(1, selectedCategory);
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

  const handleWhatsApp = (lead: Lead) => {
    let clean = (lead.phone || '').replace(/[^0-9]/g, '');
    if (clean.length === 10) clean = `91${clean}`;
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  const handleOpenUpdate = (lead: Lead) => {
    setUpdatingLead(lead);
    setIsUpdateModalOpen(true);
  };

  const handleLeadUpdated = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
  };

  const selectedBusiness = businesses.find((b) => String(b.id) === selectedBusinessId);

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Leads Directory</h1>
            {selectedBusiness && (
              <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg border border-purple-200">
                🏢 {selectedBusiness.name}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Browse, search, assign, and manage customer records across your business campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {!isTelecaller && hasPermission('leads.export') && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCsv}
            >
              Export
            </Button>
          )}

          {!isTelecaller && hasPermission('leads.assign') && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Users className="w-3.5 h-3.5 text-purple-600" />}
              onClick={() => setIsBulkAssignOpen(true)}
            >
              Bulk Assign
            </Button>
          )}

          {!isTelecaller && hasPermission('leads.import') && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-pink-600" />}
              onClick={() => setIsImportModalOpen(true)}
            >
              Import CSV
            </Button>
          )}

          {!isTelecaller && hasPermission('leads.create') && (
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

      {/* Category Filter Pills (Sync with Telecaller Home categories) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Leads' },
          { id: 'fresh', label: 'Fresh' },
          { id: 'calls_today', label: 'Calls Today' },
          { id: 'interested', label: 'Interested' },
          { id: 'converted', label: 'Converted' },
          { id: 'priority', label: 'Priority (10-12 PM)' },
        ].map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-[#FBFAF9] text-zinc-600 hover:bg-stone-100 border border-[#E9E6E2]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Active Category Filter Banner */}
      {selectedCategory !== 'all' && (
        <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-purple-950">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span>
              Showing category: <strong className="capitalize">{selectedCategory.replace('_', ' ')}</strong> ({meta.total} records found)
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className="text-[11px] text-purple-700 hover:text-purple-950 font-bold underline cursor-pointer"
          >
            Show All Leads
          </button>
        </div>
      )}

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
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {/* Business Vertical Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="text-xs rounded-xl border border-purple-200 bg-purple-50/40 py-2 px-2.5 font-medium text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">All Businesses</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    🏢 {b.name} ({b.leads_count ?? 0})
                  </option>
                ))}
              </select>

              {(user?.role?.slug === 'owner' || user?.role?.slug === 'admin') && (
                <button
                  type="button"
                  onClick={() => setIsCreateBusinessOpen(true)}
                  title="Create New Business Vertical"
                  className="p-2 rounded-xl text-purple-600 hover:bg-purple-100/60 border border-purple-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs rounded-xl border border-zinc-200 py-2 px-2.5 bg-white focus:outline-none"
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
              className="text-xs rounded-xl border border-zinc-200 py-2 px-2.5 bg-white focus:outline-none"
            >
              <option value="">All Sources</option>
              {['Website', 'Referral', 'Cold Call', 'Campaign', 'Inbound', 'Events', 'CSV Import'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {user?.role?.slug !== 'telecaller' && (
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="text-xs rounded-xl border border-zinc-200 py-2 px-2.5 bg-white focus:outline-none"
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

      {/* Active Business Column Notice (if business selected) */}
      {selectedBusiness && selectedBusiness.custom_columns && selectedBusiness.custom_columns.length > 0 && (
        <div className="bg-purple-50/70 border border-purple-100 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-purple-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              Showing custom dynamic columns for <strong>{selectedBusiness.name}</strong>:{' '}
              {selectedBusiness.custom_columns.map((c) => c.label).join(', ')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedBusinessId('')}
            className="text-[11px] text-purple-700 hover:text-purple-950 underline font-medium"
          >
            Clear Business Filter
          </button>
        </div>
      )}

      {/* Leads Content: Cards or Table */}
      {isLoading ? (
        <Card className="p-6">
          <LoadingSkeleton rows={6} />
        </Card>
      ) : leads.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="No leads found"
            description="Try adjusting your search criteria or import a CSV for this business."
            actionLabel={hasPermission('leads.import') ? 'Import Leads' : undefined}
            onAction={hasPermission('leads.import') ? () => setIsImportModalOpen(true) : undefined}
          />
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onCall={handleInitiateCall}
                onWhatsApp={handleWhatsApp}
                onUpdate={handleOpenUpdate}
                onViewDetails={(l) => navigate(`/leads/${l.id}`)}
              />
            ))}
          </div>

          {meta.last_page > 1 && (
            <Card className="p-3 flex items-center justify-between text-xs text-zinc-500">
              <span>Showing {leads.length} of {meta.total} records</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.current_page <= 1}
                  onClick={() => fetchLeads(meta.current_page - 1)}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="px-2 font-medium">Page {meta.current_page} of {meta.last_page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => fetchLeads(meta.current_page + 1)}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Phone / Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Agent</th>

                  {/* Dynamic Business Columns (if a business is filtered) */}
                  {selectedBusiness?.custom_columns?.map((col) => (
                    <th key={col.key} className="py-3 px-4 text-purple-900 bg-purple-50/60">
                      {col.label}
                    </th>
                  ))}

                  <th className="py-3 px-4">Deal Value</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900">
                        {lead.first_name} {lead.last_name || ''}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-zinc-500">
                          {lead.company || <span className="italic text-zinc-400">No Company</span>}
                        </span>
                        {lead.business && !selectedBusinessId && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium border border-purple-100">
                            🏢 {lead.business.name}
                          </span>
                        )}
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

                    {/* Dynamic column data rendering */}
                    {selectedBusiness?.custom_columns?.map((col) => (
                      <td key={col.key} className="py-3.5 px-4 font-medium text-purple-950 bg-purple-50/10">
                        {lead.custom_fields?.[col.key] || '—'}
                      </td>
                    ))}

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
      )}

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
        onSuccess={() => {
          fetchLeads(1);
          fetchBusinesses();
        }}
        defaultBusinessId={selectedBusinessId}
      />

      <LeadBulkAssignModal
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        onSuccess={() => fetchLeads(meta.current_page)}
        defaultBusinessId={selectedBusinessId}
      />

      <BusinessCreateModal
        isOpen={isCreateBusinessOpen}
        onClose={() => setIsCreateBusinessOpen(false)}
        onSuccess={(newBiz) => {
          setBusinesses((prev) => [...prev, newBiz]);
          setSelectedBusinessId(String(newBiz.id));
        }}
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

      <LeadUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatingLead(null);
        }}
        lead={updatingLead}
        onSuccess={handleLeadUpdated}
      />
    </div>
  );
};
