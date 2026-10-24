import React, { useState } from 'react';
import { api } from '../../lib/api/client';
import { Business, CustomColumn } from '../../types';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from '../../components/Alert';
import { Building2, Plus, Trash2, Tag, Info } from 'lucide-react';

interface BusinessCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBusiness: Business) => void;
}

export const BusinessCreateModal: React.FC<BusinessCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState<CustomColumn[]>([
    { key: 'budget', label: 'Budget', type: 'text' },
    { key: 'location', label: 'Preferred Location', type: 'text' },
  ]);
  const [newColLabel, setNewColLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddColumn = () => {
    if (!newColLabel.trim()) return;
    const key = newColLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!key) return;

    // Check for duplicate key
    if (columns.some((c) => c.key === key)) {
      setError(`Column with key '${key}' already exists.`);
      return;
    }

    setColumns([...columns, { key, label: newColLabel.trim(), type: 'text' }]);
    setNewColLabel('');
    setError(null);
  };

  const handleRemoveColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Business name is required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/businesses', {
        name: name.trim(),
        description: description.trim() || undefined,
        custom_columns: columns,
      });

      if (res.success) {
        onSuccess(res.data);
        onClose();
        setName('');
        setDescription('');
        setColumns([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create business.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Business Category"
      description="Define custom business attributes and dynamic data columns for lead imports"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={handleSubmit} isLoading={isLoading}>
            Create Business
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert type="error">{error}</Alert>}

        <Input
          label="Business Name *"
          placeholder="e.g. Real Estate Projects, Health Insurance, Study Abroad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full text-sm bg-white border border-zinc-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Brief notes about this business vertical or campaign..."
          />
        </div>

        {/* Dynamic Custom Columns Section */}
        <div className="border-t border-zinc-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                Business-Specific Custom Columns
              </label>
              <p className="text-xs text-zinc-500">
                Specify any custom fields (e.g., Budget, Location, Course, Vehicle Model) that CSV imports will map.
              </p>
            </div>
          </div>

          {/* Existing Columns Pills / List */}
          <div className="space-y-2 mt-3">
            {columns.length === 0 ? (
              <div className="p-3 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-center text-xs text-zinc-500">
                No custom columns added yet. Standard columns (Phone, Name, Email, Company, Notes) are always included.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {columns.map((col, index) => (
                  <div
                    key={col.key}
                    className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-900 px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    <span>{col.label}</span>
                    <span className="text-[10px] text-purple-400 font-mono">({col.key})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(index)}
                      className="ml-1 text-purple-400 hover:text-red-500 transition-colors"
                      title="Remove column"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Column Input */}
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              placeholder="e.g. Budget, Property Type, Experience"
              value={newColLabel}
              onChange={(e) => setNewColLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddColumn();
                }
              }}
              className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddColumn}
            >
              Add Column
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-700">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span>
            When you select this business during CSV import, these column headers will automatically be recognized and stored with each lead.
          </span>
        </div>
      </form>
    </Modal>
  );
};
