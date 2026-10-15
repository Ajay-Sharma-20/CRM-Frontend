import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { User } from '../../types';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Alert } from '../../components/Alert';
import { LoadingSkeleton } from '../../components/EmptyState';
import { ShieldCheck, ShieldAlert, Check, X, RotateCcw } from 'lucide-react';

interface UserPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdated: () => void;
}

export const UserPermissionModal: React.FC<UserPermissionModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdated,
}) => {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUserPermissions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/access-control/users/${user.id}/permissions`);
      if (res.success) {
        setPermissions(res.data.permissions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserPermissions();
      setReason('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, user]);

  const handleSetOverride = async (permissionId: number, isGranted: boolean) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post(`/access-control/users/${user.id}/permissions/override`, {
        permission_id: permissionId,
        is_granted: isGranted,
        reason: reason || undefined,
      });

      if (res.success) {
        setSuccess(res.message);
        setReason('');
        fetchUserPermissions();
        onUpdated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set override.');
    }
  };

  const handleRemoveOverride = async (permissionId: number) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await api.delete(`/access-control/users/${user.id}/permissions/override/${permissionId}`);
      if (res.success) {
        setSuccess(res.message);
        fetchUserPermissions();
        onUpdated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove override.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permissions & Overrides: ${user.name}`}
      description={`Role: ${user.role?.name || 'None'}. Explains effective permissions (Explicit Deny > Explicit Grant > Role Grant).`}
      maxWidth="4xl"
      footer={
        <Button variant="gradient" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-zinc-600 font-medium">
            Optional Reason for Override (recorded in Audit Log):
          </span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Temporary elevation, compliance restriction..."
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 bg-white focus:outline-none w-full sm:w-80"
          />
        </div>

        {isLoading ? (
          <LoadingSkeleton rows={6} />
        ) : (
          <div className="max-h-[500px] overflow-y-auto divide-y divide-zinc-100 border border-zinc-200 rounded-xl">
            {permissions.map((p) => {
              const hasOverride = !!p.override;
              return (
                <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-zinc-50/70 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900">{p.label}</span>
                      <code className="text-[10px] text-zinc-400 font-mono">{p.key}</code>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-zinc-500">
                        Inherited from role: {p.inherited_from_role ? 'YES' : 'NO'}
                      </span>
                      {hasOverride && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            p.override.is_granted ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          Override: {p.override.is_granted ? 'EXPLICIT GRANT' : 'EXPLICIT DENY'}
                        </span>
                      )}
                      {p.override?.reason && (
                        <span className="text-[10px] text-zinc-400 italic">
                          "{p.override.reason}"
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Effective State Badge */}
                    <div>
                      {p.effective ? (
                        <Badge variant="success" size="sm">
                          <Check className="w-3 h-3 mr-0.5" /> Effective: ALLOW
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          <X className="w-3 h-3 mr-0.5" /> Effective: DENY
                        </Badge>
                      )}
                    </div>

                    {/* Override Action Buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant={p.override?.is_granted === true ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleSetOverride(p.id, true)}
                      >
                        Grant
                      </Button>
                      <Button
                        variant={p.override?.is_granted === false ? 'danger' : 'outline'}
                        size="sm"
                        onClick={() => handleSetOverride(p.id, false)}
                      >
                        Deny
                      </Button>
                      {hasOverride && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOverride(p.id)}
                          title="Restore Role Inheritance"
                          className="p-1.5 text-zinc-400 hover:text-zinc-700"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
