import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api/client';
import { Business } from '../../types';
import { useAuth } from '../../lib/auth/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { EmptyState, LoadingSkeleton } from '../../components/EmptyState';
import { Alert } from '../../components/Alert';
import { BusinessCreateModal } from './BusinessCreateModal';
import { CsvImportModal } from '../leads/CsvImportModal';
import {
  Briefcase,
  Plus,
  Users,
  Tag,
  ArrowRight,
  FileSpreadsheet,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';

export const BusinessListView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [importingBusinessId, setImportingBusinessId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/businesses');
      if (res.success) {
        setBusinesses(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load businesses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleDeleteBusiness = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the business vertical '${name}'? Existing leads will be preserved as unassigned business.`)) {
      return;
    }

    try {
      const res = await api.delete(`/businesses/${id}`);
      if (res.success) {
        setBusinesses((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete business.');
    }
  };

  const totalLeads = businesses.reduce((acc, b) => acc + (b.leads_count || 0), 0);
  const totalColumns = businesses.reduce((acc, b) => acc + (b.custom_columns?.length || 0), 0);

  const filtered = businesses.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Business Verticals</h1>
            <Badge variant="purple">Admin Panel</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your organization's different business lines, define unique custom columns, and track lead distribution.
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          New Business
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* KPI Stats Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Businesses"
          value={businesses.length}
          subtitle="Configured business verticals"
          icon={<Briefcase className="w-4 h-4" />}
          color="purple"
        />
        <StatCard
          title="Total Leads Managed"
          value={totalLeads}
          subtitle="Distributed across all verticals"
          icon={<Users className="w-4 h-4" />}
          color="pink"
        />
        <StatCard
          title="Custom Attributes"
          value={totalColumns}
          subtitle="Dynamic data columns configured"
          icon={<Layers className="w-4 h-4" />}
          color="blue"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business by name or description..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-600"
          />
        </div>
        <div className="text-xs text-zinc-500 font-medium">
          Showing {filtered.length} of {businesses.length} businesses
        </div>
      </div>

      {/* Businesses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-zinc-100 rounded-2xl animate-pulse" />
          <div className="h-48 bg-zinc-100 rounded-2xl animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No business verticals found"
          description={search ? "No businesses match your search term." : "Create your first business vertical to configure custom columns and start importing leads."}
          actionLabel="Create Business"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((biz) => (
            <Card key={biz.id} className="flex flex-col justify-between hover:border-purple-200 transition-all duration-200">
              <div className="space-y-3.5">
                {/* Top Row: Icon, Title, Leads Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                        {biz.name}
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-400">
                        slug: {biz.slug}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    {biz.leads_count ?? 0} Leads
                  </span>
                </div>

                {/* Description */}
                {biz.description && (
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {biz.description}
                  </p>
                )}

                {/* Configured Custom Columns */}
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    Custom Data Columns ({biz.custom_columns?.length || 0}):
                  </span>

                  {biz.custom_columns && biz.custom_columns.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {biz.custom_columns.map((col) => (
                        <span
                          key={col.key}
                          className="inline-flex items-center gap-1 text-[11px] bg-zinc-50 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md font-medium"
                        >
                          <Tag className="w-3 h-3 text-purple-500" />
                          {col.label}
                          <span className="text-[9px] text-zinc-400 font-mono">({col.key})</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-400 italic">
                      Standard columns only (no custom attributes defined)
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteBusiness(biz.id, biz.name)}
                  className="text-xs text-zinc-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Business"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-pink-600" />}
                    onClick={() => setImportingBusinessId(String(biz.id))}
                  >
                    Import Leads
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => navigate(`/leads?business_id=${biz.id}`)}
                  >
                    View Leads
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <BusinessCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newBiz) => {
          setBusinesses((prev) => [...prev, newBiz]);
        }}
      />

      {importingBusinessId && (
        <CsvImportModal
          isOpen={!!importingBusinessId}
          onClose={() => setImportingBusinessId(null)}
          onSuccess={() => {
            fetchBusinesses();
          }}
          defaultBusinessId={importingBusinessId}
        />
      )}
    </div>
  );
};
