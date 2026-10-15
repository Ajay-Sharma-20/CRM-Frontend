import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { useAuth } from '../../lib/auth/AuthContext';
import { User, Role } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Alert } from '../../components/Alert';
import { Badge, StatusBadge } from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/EmptyState';
import { UserPermissionModal } from '../access-control/UserPermissionModal';
import { UserCheck, Plus, Shield, ShieldCheck, UserX } from 'lucide-react';

export const UserListView: React.FC = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'active' | 'deactivated'>('active');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User-level Permission Overrides Modal
  const [overrideUser, setOverrideUser] = useState<User | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/access-control/matrix'),
      ]);
      if (usersRes.success) setUsers(usersRes.data);
      if (rolesRes.success) setRoles(rolesRes.data.roles);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setRoleId(roles[0] ? String(roles[0].id) : '');
    setPassword('Password123!');
    setStatus('active');
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setRoleId(user.role ? String(user.role.id) : '');
    setPassword('');
    setStatus(user.status);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          name,
          phone: phone || undefined,
          role_id: parseInt(roleId, 10),
          status,
          password: password || undefined,
        });
      } else {
        await api.post('/users', {
          name,
          email,
          phone: phone || undefined,
          role_id: parseInt(roleId, 10),
          password: password || 'Password123!',
        });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save user.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Workspace Users</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage authorized staff, assigned roles, status, and dynamic access permissions.
          </p>
        </div>

        {hasPermission('users.create') && (
          <Button variant="gradient" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Add User
          </Button>
        )}
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="No user accounts under this workspace." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Name & Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Teams</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900 flex items-center gap-2">
                        {u.name}
                        {u.id === currentUser?.id && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="purple" size="sm">
                        {u.role?.name || 'No Role'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.status === 'active' ? 'success' : 'danger'} size="sm">
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {u.teams && u.teams.length > 0 ? (
                          u.teams.map((t) => (
                            <span key={t.id} className="bg-zinc-100 px-2 py-0.5 rounded text-[10px]">
                              {t.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-zinc-400">No Team</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600">
                      <span className="font-semibold">{u.leads_count ?? 0}</span> leads •{' '}
                      <span className="font-semibold">{u.calls_count ?? 0}</span> calls
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasPermission('permissions.manage') && (
                          <button
                            type="button"
                            onClick={() => setOverrideUser(u)}
                            title="Manage User Permissions & Overrides"
                            className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors text-xs font-semibold flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Permissions</span>
                          </button>
                        )}
                        {hasPermission('users.update') && (
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(u)}>
                            Edit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit ${editingUser.name}` : 'Add New User'}
        description="Configure login credentials and assigned operational role"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleSave} isLoading={isSaving}>
              Save User
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}

          <Input
            label="Full Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Patel"
          />

          {!editingUser && (
            <Input
              label="Email Address *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@company.com"
            />
          )}

          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />

          <Select
            label="Assigned Role *"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            options={roles.map((r) => ({ label: `${r.name} (${r.slug})`, value: r.id }))}
          />

          {editingUser && editingUser.id !== currentUser?.id && (
            <Select
              label="Account Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Deactivated', value: 'deactivated' },
              ]}
            />
          )}

          <Input
            label={editingUser ? 'Reset Password (Leave blank to keep current)' : 'Password *'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={editingUser ? '••••••••' : 'Min. 8 characters'}
          />
        </form>
      </Modal>

      {/* User Permission Overrides Modal */}
      {overrideUser && (
        <UserPermissionModal
          isOpen={!!overrideUser}
          onClose={() => setOverrideUser(null)}
          user={overrideUser}
          onUpdated={fetchData}
        />
      )}
    </div>
  );
};
