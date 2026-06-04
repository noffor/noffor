"use client";

import { useEffect, useState, useCallback, startTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, MoreVertical, Eye, Ban, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Star, MapPin, Phone, Mail } from 'lucide-react';
import ExportButton from './ExportButton';
import BulkActionBar from './BulkActionBar';

interface Worker {
  id: string; name: string; phone: string; email: string; category: string;
  rating: number; is_online: boolean; is_verified: boolean; is_banned: boolean;
  country: string; area: string; total_bookings: number; created_at: string;
  expected_salary: string; experience: string;
}

export default function WorkerTable() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'online' | 'verified' | 'banned'>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'bookings' | 'newest'>('newest');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const pageSize = 20;

  useEffect(() => { loadWorkers(); }, [page, filter, selectedCountry, sortBy]);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      let query = supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'labor');
      
      if (filter === 'online') query = query.eq('is_online', true);
      else if (filter === 'verified') query = query.eq('is_verified', true);
      else if (filter === 'banned') query = query.eq('is_banned', true);
      
      if (selectedCountry !== 'all') query = query.eq('country', selectedCountry);
      if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
      
      if (sortBy === 'rating') query = query.order('rating', { ascending: false });
      else if (sortBy === 'bookings') query = query.order('total_bookings', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const { data, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      
      setWorkers(data || []);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleAction = useCallback(async (workerId: string, action: 'verify' | 'unverify' | 'ban' | 'unban' | 'force_offline') => {
    const updates: Record<string, any> = {};
    if (action === 'verify') updates.is_verified = true;
    else if (action === 'unverify') updates.is_verified = false;
    else if (action === 'ban') updates.is_banned = true;
    else if (action === 'unban') updates.is_banned = false;
    else if (action === 'force_offline') updates.is_online = false;

    await supabase.from('profiles').update(updates).eq('id', workerId);
    loadWorkers();
    setSelectedWorker(null);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === workers.length && workers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(workers.map(w => w.id)));
    }
  };

  const handleBulkAction = useCallback(async (action: string) => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      if (action === 'verify') await handleAction(id, 'verify');
      else if (action === 'ban') await handleAction(id, 'ban');
      else if (action === 'unban') await handleAction(id, 'unban');
      else if (action === 'force_offline') await handleAction(id, 'force_offline');
    }
    setSelectedIds(new Set());
    setSelectMode(false);
    loadWorkers();
  }, [selectedIds, handleAction]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectMode ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {selectMode ? 'Cancel' : 'Select'}
          </button>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search workers..." className="w-48 pl-9 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
          </div>
          <select value={filter} onChange={e => { setFilter(e.target.value as any); setPage(1); }} className="bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 px-3 py-1.5 focus:outline-none focus:border-orange-500">
            <option value="all">All Workers</option>
            <option value="online">Online</option>
            <option value="verified">Verified</option>
            <option value="banned">Banned</option>
          </select>
          <select value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); setPage(1); }} className="bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 px-3 py-1.5 focus:outline-none focus:border-orange-500">
            <option value="all">All Countries</option>
            <option value="QA">Qatar</option>
            <option value="SA">Saudi Arabia</option>
            <option value="AE">UAE</option>
            <option value="KW">Kuwait</option>
            <option value="OM">Oman</option>
            <option value="BH">Bahrain</option>
          </select>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value as any); setPage(1); }} className="bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 px-3 py-1.5 focus:outline-none focus:border-orange-500">
            <option value="newest">Newest</option>
            <option value="rating">Highest Rated</option>
            <option value="bookings">Most Bookings</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton 
            data={workers} 
            filename="workers-export" 
            columns={['name', 'phone', 'category', 'rating', 'country', 'area']} 
            labels={['Name', 'Phone', 'Category', 'Rating', 'Country', 'Area']} 
          />
          <button onClick={loadWorkers} className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {selectMode && (
                <th className="p-3 w-10">
                  <input type="checkbox" checked={selectedIds.size === workers.length && workers.length > 0} onChange={toggleAll} className="accent-orange-500 w-3.5 h-3.5" />
                </th>
              )}
              <th className="text-left p-3 text-xs text-gray-500 font-medium">Worker</th>
              <th className="text-left p-3 text-xs text-gray-500 font-medium hidden md:table-cell">Category</th>
              <th className="text-left p-3 text-xs text-gray-500 font-medium hidden lg:table-cell">Country</th>
              <th className="text-center p-3 text-xs text-gray-500 font-medium">Rating</th>
              <th className="text-center p-3 text-xs text-gray-500 font-medium hidden sm:table-cell">Bookings</th>
              <th className="text-center p-3 text-xs text-gray-500 font-medium">Status</th>
              <th className="text-right p-3 text-xs text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={selectMode ? 8 : 7} className="text-center p-8 text-gray-400">Loading...</td></tr>
            ) : workers.length === 0 ? (
              <tr><td colSpan={selectMode ? 8 : 7} className="text-center p-8 text-gray-400">No workers found</td></tr>
            ) : (
              workers.map(worker => (
                <tr key={worker.id} className={`border-b border-gray-800/50 transition-colors ${selectedIds.has(worker.id) ? 'bg-orange-500/10' : 'hover:bg-gray-800/30'}`}>
                  {selectMode && (
                    <td className="p-3">
                      <input type="checkbox" checked={selectedIds.has(worker.id)} onChange={() => toggleSelect(worker.id)} className="accent-orange-500 w-3.5 h-3.5" />
                    </td>
                  )}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white font-bold">{worker.name?.[0]}</div>
                      <div>
                        <p className="text-sm text-white font-medium">{worker.name}</p>
                        <p className="text-xs text-gray-500">{worker.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-300 hidden md:table-cell">{worker.category}</td>
                  <td className="p-3 text-sm text-gray-300 hidden lg:table-cell">{worker.country} · {worker.area}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star size={12} className="text-yellow-500" fill="#EAB308" />
                      <span className="text-sm text-gray-300">{worker.rating?.toFixed(1) || 'New'}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center text-sm text-gray-300 hidden sm:table-cell">{worker.total_bookings || 0}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {worker.is_banned ? (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Banned</span>
                      ) : worker.is_online ? (
                        <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Offline</span>
                      )}
                      {worker.is_verified && <CheckCircle size={12} className="text-blue-400" />}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="relative inline-block">
                      <button onClick={() => setSelectedWorker(selectedWorker?.id === worker.id ? null : worker)} className="p-1 text-gray-400 hover:text-white">
                        <MoreVertical size={14} />
                      </button>
                      {selectedWorker?.id === worker.id && (
                        <div className="absolute right-0 top-8 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px]">
                          <button onClick={() => { window.open(`/profile/${worker.id}`, '_blank'); setSelectedWorker(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"><Eye size={12} />View Profile</button>
                          {!worker.is_verified && <button onClick={() => handleAction(worker.id, 'verify')} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-green-400 hover:bg-gray-700"><CheckCircle size={12} />Verify</button>}
                          {worker.is_verified && <button onClick={() => handleAction(worker.id, 'unverify')} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-yellow-400 hover:bg-gray-700"><XCircle size={12} />Unverify</button>}
                          {!worker.is_banned ? <button onClick={() => handleAction(worker.id, 'ban')} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-gray-700"><Ban size={12} />Ban</button> : <button onClick={() => handleAction(worker.id, 'unban')} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-green-400 hover:bg-gray-700"><CheckCircle size={12} />Unban</button>}
                          {worker.is_online && <button onClick={() => handleAction(worker.id, 'force_offline')} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-orange-400 hover:bg-gray-700"><XCircle size={12} />Force Offline</button>}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
          {selectMode && selectedIds.size > 0 && (
            <span className="text-xs text-orange-400 font-medium">{selectedIds.size} selected</span>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      </div>

      <BulkActionBar 
        selectedCount={selectedIds.size} 
        onAction={handleBulkAction} 
        onClear={() => { setSelectedIds(new Set()); setSelectMode(false); }} 
      />
    </div>
  );
}