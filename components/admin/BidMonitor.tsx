"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Gavel, Clock, DollarSign, User, MapPin, XCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface Bid {
  id: string; job_title: string; bidder_name: string; amount: number;
  status: string; created_at: string; job_location: string; is_lowest: boolean;
}

export default function BidMonitor() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'accepted' | 'rejected'>('active');
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    loadBids();

    const channel = supabase
      .channel('admin-bids')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, () => {
        if (aliveRef.current) loadBids();
      })
      .subscribe();

    return () => { aliveRef.current = false; supabase.removeChannel(channel); };
  }, [filter]);

  const loadBids = async () => {
    setLoading(true);
    try {
      let query = supabase.from('bids').select('*');
      if (filter !== 'active') query = query.eq('status', filter);
      else query = query.eq('status', 'active');
      const { data } = await query.order('created_at', { ascending: false }).limit(50);
      setBids(data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleBidAction = async (bidId: string, action: 'accept' | 'reject') => {
    await supabase.from('bids').update({ status: action === 'accept' ? 'accepted' : 'rejected' }).eq('id', bidId);
    loadBids();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gavel size={16} className="text-yellow-400" />
          <h3 className="text-white font-semibold text-sm">Live Bids Monitor</h3>
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
        </div>
        <div className="flex gap-1">
          {(['active', 'accepted', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${filter===f?'bg-yellow-500/20 text-yellow-400':'text-gray-500 hover:text-gray-300'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button onClick={loadBids} className="p-1 text-gray-400 hover:text-white"><RefreshCw size={14} className={loading?'animate-spin':''} /></button>
        </div>
      </div>
      <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="text-center p-6 text-gray-400 text-sm">Loading bids...</div>
        ) : bids.length === 0 ? (
          <div className="text-center p-6 text-gray-400 text-sm">No bids found</div>
        ) : (
          bids.map(bid => (
            <div key={bid.id} className="p-4 hover:bg-gray-800/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm text-white font-medium">{bid.job_title || 'Untitled Job'}</h4>
                    {bid.is_lowest && <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">Lowest</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><User size={10} />{bid.bidder_name || 'Unknown'}</span>
                    <span className="flex items-center gap-1"><MapPin size={10} />{bid.job_location || 'N/A'}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{new Date(bid.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-orange-400">{bid.amount?.toLocaleString()} QAR</p>
                  {bid.status === 'active' && (
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => handleBidAction(bid.id, 'accept')} className="p-1 text-green-400 hover:bg-green-500/10 rounded"><CheckCircle size={14} /></button>
                      <button onClick={() => handleBidAction(bid.id, 'reject')} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><XCircle size={14} /></button>
                    </div>
                  )}
                  {bid.status === 'accepted' && <span className="text-xs text-green-400">Accepted</span>}
                  {bid.status === 'rejected' && <span className="text-xs text-red-400">Rejected</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}