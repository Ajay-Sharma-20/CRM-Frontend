import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api/client';
import { CallLog } from '../../types';
import { Card } from '../../components/Card';
import { StatusBadge, Badge } from '../../components/Badge';
import { LoadingSkeleton, EmptyState } from '../../components/EmptyState';
import { PhoneCall, Clock, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CallHistoryView: React.FC = () => {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [meta, setMeta] = useState<any>({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [outcomeFilter, setOutcomeFilter] = useState('');

  const fetchCalls = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get('/calls', {
        page,
        outcome: outcomeFilter || undefined,
        per_page: 20,
      });
      if (res.success) {
        setCalls(res.data);
        setMeta(res.meta);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls(1);
  }, [outcomeFilter]);

  const outcomes = [
    'Connected', 'Interested', 'Follow-up Required', 'Call Later', 'Busy',
    'No Answer', 'Not Reachable', 'Wrong Number', 'Not Interested',
    'Demo/Meeting Scheduled', 'Converted', 'Lost'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">Call Logs & Activity</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Complete interaction log of all telecalling attempts and manual outcome records.
          </p>
        </div>

        <div>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="text-xs rounded-lg border border-zinc-200 py-2 px-3 bg-white focus:outline-none"
          >
            <option value="">All Outcomes</option>
            {outcomes.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : calls.length === 0 ? (
          <EmptyState
            title="No call logs recorded"
            description="Calls initiated by agents will appear in this interaction audit log."
          />
        ) : (
          <div className="divide-y divide-zinc-100">
            {calls.map((call) => (
              <div key={call.id} className="p-4 hover:bg-zinc-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-zinc-900">{call.outcome}</span>
                      {call.lead && (
                        <button
                          onClick={() => navigate(`/leads/${call.lead?.id}`)}
                          className="text-xs text-purple-700 hover:underline font-semibold"
                        >
                          {call.lead.first_name} {call.lead.last_name}
                        </button>
                      )}
                      {call.duration_seconds && (
                        <span className="text-[10px] text-zinc-400">
                          ({Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s)
                        </span>
                      )}
                    </div>
                    {call.notes && <p className="text-xs text-zinc-600 mt-1">"{call.notes}"</p>}
                    <div className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {call.user?.name || 'Agent'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(call.called_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                {call.lead && (
                  <button
                    onClick={() => navigate(`/leads/${call.lead?.id}`)}
                    className="self-end sm:self-center text-xs font-semibold text-purple-600 hover:text-purple-800"
                  >
                    View Lead &rarr;
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
