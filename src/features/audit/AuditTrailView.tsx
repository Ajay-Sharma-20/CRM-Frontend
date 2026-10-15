import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { AuditEvent } from '../../types';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/EmptyState';
import { History, Shield, User, Clock } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuditEvents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/audit');
      if (res.success) {
        setEvents(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Audit Trail & Security Logs</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Immutable audit record of all sensitive actions, assignments, permission modifications, and user logins.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} />
          </div>
        ) : events.length === 0 ? (
          <EmptyState title="No audit events found" description="System actions will appear here." />
        ) : (
          <div className="divide-y divide-zinc-100">
            {events.map((evt) => (
              <div key={evt.id} className="p-4 hover:bg-zinc-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-900">{evt.description || evt.action}</span>
                      <Badge variant="purple" size="sm">{evt.action}</Badge>
                      <span className="text-[10px] text-zinc-400 font-mono">[{evt.entity_type}]</span>
                    </div>

                    <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-zinc-400" />
                        Actor: {evt.user?.name || 'System'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {new Date(evt.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
