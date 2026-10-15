import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { useAuth } from '../../lib/auth/AuthContext';
import { Role, Permission } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Alert } from '../../components/Alert';
import { LoadingSkeleton } from '../../components/EmptyState';
import { Shield, ShieldAlert, Check, Lock, Save, RefreshCw } from 'lucide-react';

export const RolePermissionsMatrix: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionsByModule, setPermissionsByModule] = useState<Record<string, Permission[]>>({});
  const [rolePermissions, setRolePermissions] = useState<Record<number, number[]>>({}); // roleId -> permissionIds[]
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMatrix = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/access-control/matrix');
      if (res.success) {
        const fetchedRoles: Role[] = res.data.roles;
        setRoles(fetchedRoles);
        setPermissionsByModule(res.data.permissions_by_module);

        const mapping: Record<number, number[]> = {};
        fetchedRoles.forEach((r) => {
          mapping[r.id] = (r.permissions || []).map((p) => p.id);
        });
        setRolePermissions(mapping);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load access control matrix.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleToggle = (roleId: number, permissionId: number, isLocked: boolean) => {
    if (isLocked) return;

    setRolePermissions((prev) => {
      const current = prev[roleId] || [];
      const updated = current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId];
      return { ...prev, [roleId]: updated };
    });
  };

  const handleSaveRole = async (roleId: number) => {
    setIsSaving(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const permIds = rolePermissions[roleId] || [];
      const res = await api.put(`/access-control/roles/${roleId}/permissions`, {
        permission_ids: permIds,
      });

      if (res.success) {
        setSuccessMessage(`Permissions for role '${res.data.name}' updated and enforced on next request.`);
        fetchMatrix();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Access Control & Role Matrix</h1>
            <Badge variant="purple">Dynamic RBAC</Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Database-backed permission controls. Changes take effect on the next API request without code modification.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={fetchMatrix}
        >
          Refresh
        </Button>
      </div>

      {successMessage && <Alert type="success">{successMessage}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      {isLoading ? (
        <LoadingSkeleton rows={8} />
      ) : (
        <div className="space-y-6">
          {roles.map((role) => {
            const isOwner = role.slug === 'owner';
            const assignedIds = rolePermissions[role.id] || [];

            return (
              <Card
                key={role.id}
                title={`${role.name} Permissions`}
                subtitle={role.description || ''}
                action={
                  isOwner ? (
                    <Badge variant="purple">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked System Role
                    </Badge>
                  ) : (
                    <Button
                      variant="gradient"
                      size="sm"
                      leftIcon={<Save className="w-3.5 h-3.5" />}
                      onClick={() => handleSaveRole(role.id)}
                      isLoading={isSaving}
                    >
                      Save Role Changes
                    </Button>
                  )
                }
              >
                <div className="space-y-5">
                  {Object.entries(permissionsByModule).map(([module, perms]) => (
                    <div key={module} className="pt-2">
                      <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        {module} Module
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {perms.map((p) => {
                          const isChecked = isOwner || assignedIds.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                                isChecked
                                  ? 'border-purple-200 bg-purple-50/40 text-zinc-900 font-medium'
                                  : 'border-zinc-200 bg-zinc-50/50 text-zinc-500'
                              } ${isOwner ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:border-purple-300'}`}
                            >
                              <input
                                type="checkbox"
                                disabled={isOwner}
                                checked={isChecked}
                                onChange={() => handleToggle(role.id, p.id, isOwner)}
                                className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="truncate">{p.label}</span>
                                  {p.risk_level === 'critical' && (
                                    <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-bold uppercase">
                                      High
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                                  {p.key}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
