import React, { useState } from 'react';
import { api } from '../../lib/api/client';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [csvContent, setCsvContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleCsv = `first_name,last_name,phone,email,company,status,source,value
Vikas,Khanna,+919812345678,vikas@spicekitchen.in,Spice Kitchen,New,Website,75000
Anil,Agarwal,+919823456789,anil@miningglobal.com,Mining Global,Assigned,Referral,120000
Meera,Deshmukh,+919834567890,meera@puneventures.org,Pune Ventures,Follow-up,Cold Call,50000`;

  const handleUseSample = () => {
    setCsvContent(sampleCsv);
    setFile(null);
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
      } else {
        payload = { csv_content: csvContent };
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Leads from CSV"
      description="Upload a CSV spreadsheet or paste text to bulk create leads"
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
                  <span className="font-semibold">{result.imported_count}</span> leads created successfully.{' '}
                  {result.skipped_count > 0 && <span>({result.skipped_count} rows skipped due to duplicates or errors)</span>}
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
            {/* File upload input */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Upload CSV File
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-200" />
              <span className="flex-shrink mx-4 text-[10px] text-zinc-400 uppercase font-semibold">
                Or Paste CSV Content
              </span>
              <div className="flex-grow border-t border-zinc-200" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-700">Raw CSV Text</label>
                <button
                  type="button"
                  onClick={handleUseSample}
                  className="text-[11px] text-purple-600 hover:text-purple-800 font-medium"
                >
                  Insert Sample Data
                </button>
              </div>
              <textarea
                value={csvContent}
                onChange={(e) => {
                  setCsvContent(e.target.value);
                  setFile(null);
                }}
                rows={5}
                placeholder="first_name,last_name,phone,email,company,status,source,value..."
                className="w-full text-xs font-mono rounded-lg border border-zinc-300 p-2.5 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
              />
            </div>

            <div className="text-[11px] text-zinc-500 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              <span className="font-semibold text-zinc-700">Supported Columns: </span>
              <code>first_name</code>, <code>last_name</code>, <code>phone</code> (required), <code>email</code>, <code>company</code>, <code>status</code>, <code>source</code>, <code>value</code>.
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
