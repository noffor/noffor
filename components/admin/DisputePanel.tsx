"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, MessageCircle, ThumbsUp, ThumbsDown, Eye, CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface Dispute {
  id: string;
  booking_id: string;
  reported_by: string;
  reported_user: string;
  type: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  created_at: string;
  evidence?: string;
}

export default function DisputePanel() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [decision, setDecision] = useState<'refund' | 'dismiss' | 'warn' | 'ban' | null>(null);

  useEffect(() => { loadDisputes(); }, []);

  const loadDisputes = async () => {
    setLoading(true);
    const mock: Dispute[] = [
      { id: '1', booking_id: 'bkg_001', reported_by: 'Ahmed Khan', reported_user: 'Mohammed Ali', type: 'no_show', description: 'Worker did not show up at scheduled time. I waited for 2 hours.', status: 'open', created_at: new Date(Date.now()-3600000).toISOString() },
      { id: '2', booking_id: 'bkg_002', reported_by: 'Jamal Uddin', reported_user: 'Fatima Ali', type: 'payment_issue', description: 'Employer refused to pay full amount after work completion.', status: 'open', created_at: new Date(Date.now()-7200000).toISOString() },
      { id: '3', booking_id: 'bkg_003', reported_by: 'Omar Said', reported_user: 'Suman Biswas', type: 'quality', description: 'Poor quality work. Plumbing still leaking after repair.', status: 'investigating', created_at: new Date(Date.now()-86400000).toISOString() },
    ];
    setDisputes(mock);
    setLoading(false);
  };

  const resolveDispute = async () => {
    if (!decision) return;
    await supabase.from('disputes').update({ status: 'resolved', resolution, decision, resolved_at: new Date().toISOString() }).eq('id', selectedDispute?.id);
    if (decision === 'refund') {
      // Trigger refund
    } else if (decision === 'ban') {
      await supabase.from('profiles').update({ is_banned: true }).eq('full_name', selectedDispute?.reported_user);
    }
    loadDisputes();
    setSelectedDispute(null);
    setResolution('');
    setDecision(null);
  };

  const getStatusColor = (s: string) => s==='open'?'text-red-400 bg-red-500/10':s==='investigating'?'text-yellow-400 bg-yellow-500/10':'text-green-400 bg-green-500/10';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <AlertTriangle size={18} className="text-orange-400" />
        <h3 className="text-white font-semibold text-sm">Dispute Resolution</h3>
        <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">{disputes.filter(d=>d.status==='open').length} open</span>
      </div>

      <div className="divide-y divide-gray-800 max-h-[400px] overflow-y-auto">
        {disputes.map(d => (
          <div key={d.id} className="p-4 hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => setSelectedDispute(d)}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getStatusColor(d.status)}`}>{d.status.toUpperCase()}</span>
                  <span className="text-xs text-gray-500">{d.type.replace('_',' ').toUpperCase()}</span>
                </div>
                <p className="text-sm text-white mt-1">{d.description.slice(0, 80)}...</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><User size={10} />{d.reported_by} → {d.reported_user}</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{new Date(d.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Eye size={14} className="text-gray-500 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedDispute(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-4">Dispute #{selectedDispute.id}</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Type:</span><span className="text-white">{selectedDispute.type.replace('_',' ')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Reported by:</span><span className="text-white">{selectedDispute.reported_by}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Against:</span><span className="text-white">{selectedDispute.reported_user}</span></div>
              <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300">{selectedDispute.description}</div>
            </div>

            <label className="text-xs text-gray-400 mb-1.5 block">Resolution Note</label>
            <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-2 mb-4 focus:outline-none focus:border-orange-500 resize-none" placeholder="Write resolution..." />

            <label className="text-xs text-gray-400 mb-2 block">Decision</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[{v:'refund',l:'Full Refund',c:'text-green-400',bg:'bg-green-500/10'},{v:'dismiss',l:'Dismiss',c:'text-gray-400',bg:'bg-gray-500/10'},{v:'warn',l:'Warning',c:'text-yellow-400',bg:'bg-yellow-500/10'},{v:'ban',l:'Ban User',c:'text-red-400',bg:'bg-red-500/10'}].map(o=>(
                <button key={o.v} onClick={() => setDecision(o.v as any)} className={`p-3 rounded-xl text-sm font-medium transition-all ${decision===o.v?`${o.bg} ${o.c} border border-current`:'bg-gray-800 text-gray-400'}`}>{o.l}</button>
              ))}
            </div>

            <button onClick={resolveDispute} disabled={!decision} className="w-full py-2.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 disabled:opacity-50 transition-all">
              Resolve Dispute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}