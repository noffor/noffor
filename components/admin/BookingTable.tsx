"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MoreVertical, Eye, Ban, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Clock, MapPin, DollarSign } from 'lucide-react';

interface Booking {
  id: string; worker_name: string; employer_name: string; category: string;
  amount: number; status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  location: string; created_at: string; country: string;
}

export default function BookingTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => { loadBookings(); }, [page, filter]);

  const loadBookings = async () => {
    setLoading(true);
    const mock: Booking[] = Array.from({ length: 25 }, (_, i) => ({
      id: `bkg_${i}`, worker_name: ['Jamal Uddin', 'Mohammed Rahim', 'Suman Biswas', 'Rubel Rana', 'House Driver'][i % 5],
      employer_name: ['Ahmed Khan', 'Fatima Ali', 'Omar Said', 'Noor Hassan'][i % 4],
      category: ['Plumber', 'Driver', 'Electrician', 'Mason', 'Helper'][i % 5],
      amount: Math.floor(Math.random() * 3000) + 500,
      status: (['pending','accepted','in_progress','completed','cancelled'] as const)[i % 5],
      location: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Dubai', 'Riyadh'][i % 5],
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      country: ['QA','QA','QA','AE','SA'][i % 5],
    }));

    let filtered = mock;
    if (filter === 'pending') filtered = mock.filter(b => b.status === 'pending');
    else if (filter === 'active') filtered = mock.filter(b => b.status === 'accepted' || b.status === 'in_progress');
    else if (filter === 'completed') filtered = mock.filter(b => b.status === 'completed');
    else if (filter === 'cancelled') filtered = mock.filter(b => b.status === 'cancelled');
    if (search) filtered = filtered.filter(b => b.worker_name.toLowerCase().includes(search.toLowerCase()) || b.employer_name.toLowerCase().includes(search.toLowerCase()));

    setBookings(filtered.slice((page-1)*10, page*10));
    setLoading(false);
  };

  const handleAction = async (id: string, action: string) => {
    const statusMap: Record<string, string> = { complete: 'completed', cancel: 'cancelled', refund: 'refunded' };
    await supabase.from('bookings').update({ status: statusMap[action] || action }).eq('id', id);
    loadBookings();
  };

  const getStatusBadge = (s: string) => {
    const styles: Record<string, string> = { pending: 'bg-yellow-500/20 text-yellow-400', accepted: 'bg-blue-500/20 text-blue-400', in_progress: 'bg-purple-500/20 text-purple-400', completed: 'bg-green-500/20 text-green-400', cancelled: 'bg-red-500/20 text-red-400' };
    return <span className={`text-[10px] px-2 py-0.5 rounded-full ${styles[s] || ''}`}>{s.replace('_',' ').toUpperCase()}</span>;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search bookings..." className="w-48 pl-9 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
          </div>
        </div>
        <div className="flex gap-1">
          {(['all','pending','active','completed','cancelled'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${filter===f?'bg-orange-600 text-white':'text-gray-400 hover:text-white'}`}>
              {f.toUpperCase()}
            </button>
          ))}
          <button onClick={loadBookings} className="p-1.5 text-gray-400 hover:text-white"><RefreshCw size={16} className={loading?'animate-spin':''} /></button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left p-3 text-xs text-gray-500">Booking</th>
              <th className="text-left p-3 text-xs text-gray-500 hidden md:table-cell">Worker</th>
              <th className="text-left p-3 text-xs text-gray-500 hidden lg:table-cell">Employer</th>
              <th className="text-center p-3 text-xs text-gray-500">Amount</th>
              <th className="text-center p-3 text-xs text-gray-500">Status</th>
              <th className="text-right p-3 text-xs text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center p-8 text-gray-400">Loading...</td></tr> : bookings.map(b => (
              <tr key={b.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="p-3"><p className="text-sm text-white">{b.category}</p><p className="text-[10px] text-gray-500 flex items-center gap-1"><MapPin size={10} />{b.location} · {b.country}</p></td>
                <td className="p-3 text-sm text-gray-300 hidden md:table-cell">{b.worker_name}</td>
                <td className="p-3 text-sm text-gray-300 hidden lg:table-cell">{b.employer_name}</td>
                <td className="p-3 text-center text-sm text-green-400 font-medium">{b.amount} QAR</td>
                <td className="p-3 text-center">{getStatusBadge(b.status)}</td>
                <td className="p-3 text-right">
                  {b.status === 'pending' && <button onClick={() => handleAction(b.id, 'cancel')} className="text-[10px] text-red-400 hover:bg-red-500/10 px-2 py-1 rounded">Cancel</button>}
                  {b.status === 'in_progress' && <button onClick={() => handleAction(b.id, 'complete')} className="text-[10px] text-green-400 hover:bg-green-500/10 px-2 py-1 rounded">Complete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500">Page {page}</span>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p-1))} className="p-1 text-gray-400 hover:text-white"><ChevronLeft size={16} /></button>
          <button onClick={() => setPage(p => p+1)} className="p-1 text-gray-400 hover:text-white"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}