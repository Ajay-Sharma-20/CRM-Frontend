import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { Business } from '../../types';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Alert } from '../../components/Alert';
import { BusinessCreateModal } from '../businesses/BusinessCreateModal';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building2,
  Plus,
  Download,
  Tag,
  Sparkles,
} from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultBusinessId?: string;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultBusinessId = '',
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(defaultBusinessId);
  const [isCreateBusinessOpen, setIsCreateBusinessOpen] = useState(false);

  const [csvContent, setCsvContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (isOpen) {
      fetchBusinesses();
      if (defaultBusinessId) {
        setSelectedBusinessId(defaultBusinessId);
      }
    }
  }, [isOpen, defaultBusinessId]);

  const selectedBusiness = businesses.find((b) => String(b.id) === selectedBusinessId);

  // Generate sample CSV according to the selected business columns
  const generateSampleCsv = () => {
    const baseHeaders = ['phone', 'first_name', 'last_name', 'email', 'company', 'status'];
    const customHeaders = selectedBusiness?.custom_columns?.map((c) => c.key) || [];
    const allHeaders = [...baseHeaders, ...customHeaders];

    const row1 = [
      '+919812345678',
      'Vikas',
      'Khanna',
      'vikas@example.in',
      'Apex Corp',
      'New',
      ...(selectedBusiness?.custom_columns?.map((c) => `Sample ${c.label}`) || []),
    ];

    const row2 = [
      '+919823456789',
      'Anil',
      'Agarwal',
      'anil@example.in',
      'Horizon Ltd',
      'New',
      ...(selectedBusiness?.custom_columns?.map((c) => `Value ${c.label}`) || []),
    ];

    return `${allHeaders.join(',')}\n${row1.join(',')}\n${row2.join(',')}`;
  };

  const handleUseSample = () => {
    setCsvContent(generateSampleCsv());
    setFile(null);
  };

  const handleDownloadTemplate = () => {
    const content = generateSampleCsv();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const name = selectedBusiness ? `${selectedBusiness.slug}_template.csv` : 'leads_template.csv';
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    setError(null);
    setResult(null);

    if (!file && !csvContent.trim()) {
      setError('Please select a CSV file or paste CSV content.');
      return;
    }

    setIsLoading(true);
    try {
      let payload: any;
      if (file) {
        payload = new FormData();
        payload.append('file', file);
        if (selectedBusinessId) {
          payload.append('business_id', selectedBusinessId);
        }
      } else {
        payload = {
          csv_content: csvContent,
          business_id: selectedBusinessId ? parseInt(selectedBusinessId, 10) : undefined,
        };
      }

      const res = await api.post('/leads/import', payload);
      if (res.success) {
        setResult(res.data);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Import failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewBusinessCreated = (newBiz: Business) => {
    setBusinesses((prev) => [...prev, newBiz]);
    setSelectedBusinessId(String(newBiz.id));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Import Leads from CSV"
        description="Select a business vertical and upload leads with custom attributes"
        maxWidth="xl"
        footer={
          result ? (
            <Button variant="gradient" onClick={onClose}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleImport} isLoading={isLoading}>
                Run CSV Import
              </Button>
            </>
          )
        }
      >
        <div className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}

          {result ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Import Successful</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    <span className="font-semibold">{result.imported_count}</span> leads created successfully
                    {result.business_name && (
                      <span> under business <strong>{result.business_name}</strong></span>
                    )}.
                    {result.skipped_count > 0 && (
                      <span> ({result.skipped_count} rows skipped due to duplicate phone or errors)</span>
                    )}
                  </p>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 max-h-48 overflow-y-auto">
                  <span className="text-xs font-semibold text-zinc-700 block mb-2">Row-Level Notice / Errors:</span>
                  <ul className="text-xs text-zinc-600 space-y-1 list-disc pl-4">
                    {result.errors.map((e: string, i: number) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Business Selector + Create Business inline */}
              <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    Target Business / Campaign
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreateBusinessOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-semibold underline underline-offset-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Create New Business
                  </button>
                </div>

                <Select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  placeholder="General Leads (No specific business)"
                  options={businesses.map((b) => ({
                    label: `${b.name} (${b.custom_columns?.length || 0} custom columns)`,
                    value: String(b.id),
                  }))}
                />

                {/* Show dynamic columns for selected business */}
                {selectedBusiness && (
                  <div className="mt-2 pt-2.5 border-t border-purple-100/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-purple-900">
                        Configured Columns for {selectedBusiness.name}:
                      </span>
                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="inline-flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 font-medium"
                      >
                        <Download className="w-3 h-3" />
                        Download CSV Template
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] bg-white border border-purple-200 text-zinc-700 px-2 py-0.5 rounded font-mono">
                        phone*
                      </span>
                      <span className="text-[10px] bg-white border border-purple-200 text-zinc-700 px-2 py-0.5 rounded font-mono">
                        first_name
                      </span>
                      <span className="text-[10px] bg-white border border-purple-200 text-zinc-700 px-2 py-0.5 rounded font-mono">
                        last_name
                      </span>
                      <span className="text-[10px] bg-white border border-purple-200 text-zinc-700 px-2 py-0.5 rounded font-mono">
                        email
                      </span>
                      <span className="text-[10px] bg-white border border-purple-200 text-zinc-700 px-2 py-0.5 rounded font-mono">
                        company
                      </span>
                      {selectedBusiness.custom_columns?.map((col) => (
                        <span
                          key={col.key}
                          className="text-[10px] bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium px-2 py-0.5 rounded shadow-xs"
                          title={`Custom column for ${selectedBusiness.name}`}
                        >
                          ★ {col.label} ({col.key})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* File upload input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Upload CSV File
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-200" />
                <span className="flex-shrink mx-4 text-[10px] text-zinc-400 uppercase font-semibold">
                  Or Paste CSV Text
                </span>
                <div className="flex-grow border-t border-zinc-200" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Raw CSV Text</label>
                  <button
                    type="button"
                    onClick={handleUseSample}
                    className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    Insert Sample Format
                  </button>
                </div>
                <textarea
                  value={csvContent}
                  onChange={(e) => {
                    setCsvContent(e.target.value);
                    setFile(null);
                  }}
                  rows={4}
                  placeholder="phone,first_name,last_name,email,company,status..."
                  className="w-full text-xs font-mono rounded-xl border border-zinc-200 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="text-[11px] text-zinc-500 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <span className="font-semibold text-zinc-700">Required: </span>
                CSV header row must include <code>phone</code> or <code>mobile</code>. Any business-specific columns will be automatically mapped to lead custom attributes.
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Nested Business Create Modal */}
      <BusinessCreateModal
        isOpen={isCreateBusinessOpen}
        onClose={() => setIsCreateBusinessOpen(false)}
        onSuccess={handleNewBusinessCreated}
      />
    </>
  );
};
