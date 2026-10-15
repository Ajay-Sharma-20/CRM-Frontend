import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { useAuth } from '../../lib/auth/AuthContext';
import { Team, User } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Alert } from '../../components/Alert';
import { LoadingSkeleton, EmptyState } from '../../components/EmptyState';
import { Building2, Plus, Users, UserCheck } from 'lucide-react';

export const TeamListView: React.FC = () => {
  const { hasPermission } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [teamsRes, usersRes] = await Promise.all([
        api.get('/teams'),
        api.get('/users'),
      ]);
      if (teamsRes.success) setTeams(teamsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
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
    setEditingTeam(null);
    setName('');
    setDescription('');
    setLeaderId('');
    setSelectedMemberIds([]);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team);
    setName(team.name);
    setDescription(team.description || '');
    setLeaderId(team.leader_id ? String(team.leader_id) : '');
    setSelectedMemberIds(team.members ? team.members.map((m) => m.id) : []);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name,
        description: description || undefined,
        leader_id: leaderId ? parseInt(leaderId, 10) : null,
        member_ids: selectedMemberIds,
      };

      if (editingTeam) {
        await api.put(`/teams/${editingTeam.id}`, payload);
      } else {
        await api.post('/teams', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save team.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMember = (id: number) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Teams Management</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Organize sales reps and telecallers into functional teams and regional squads.
          </p>
        </div>

        {hasPermission('teams.create') && (
          <Button variant="gradient" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
            Create Team
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : teams.length === 0 ? (
        <EmptyState
          title="No teams configured"
          description="Create your first team to assign leads and group agents."
          actionLabel="Create Team"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <Card key={team.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">{team.name}</h3>
                      <span className="text-[11px] text-zinc-400">
                        Leader: {team.leader ? team.leader.name : 'None Assigned'}
                      </span>
                    </div>
                  </div>

                  {hasPermission('teams.update') && (
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(team)}>
                      Edit
                    </Button>
                  )}
                </div>

                <p className="text-xs text-zinc-600 mt-3">{team.description || 'No description provided.'}</p>

                <div className="mt-4 pt-3 border-t border-zinc-100">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Team Members ({team.members?.length ?? 0})
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {team.members && team.members.length > 0 ? (
                      team.members.map((m) => (
                        <span
                          key={m.id}
                          className="text-xs bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-full font-medium"
                        >
                          {m.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400 italic">No members in this team</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <span>Total Leads Managed</span>
                <span className="font-bold text-purple-700">{team.leads_count ?? 0}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeam ? 'Edit Team' : 'Create New Team'}
        description="Configure team structure and members"
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleSave} isLoading={isSaving}>
              Save Team
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}

          <Input
            label="Team Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Enterprise Inbound"
          />

          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Focus area, territory, or workflow"
          />

          <Select
            label="Team Leader"
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
            placeholder="Select Team Leader"
            options={users.map((u) => ({ label: `${u.name} (${u.role?.name})`, value: u.id }))}
          />

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-2">Select Team Members</label>
            <div className="max-h-40 overflow-y-auto border border-zinc-200 rounded-lg p-2 space-y-1 divide-y divide-zinc-50">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 p-1.5 hover:bg-zinc-50 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(u.id)}
                    onChange={() => toggleMember(u.id)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-medium text-zinc-800">{u.name}</span>
                  <span className="text-[10px] text-zinc-400">({u.role?.name})</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
