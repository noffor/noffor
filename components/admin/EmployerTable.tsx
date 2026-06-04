"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, MoreVertical, Eye, Ban, CheckCircle, RefreshCw, ChevronLeft, ChevronRight, Star, DollarSign } from 'lucide-react';

export default function EmployerTable() {
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);

  useEffect(() => { loadEmployers(); }, [page, search]);

  const loadEmployers = async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'employer');
    if (search) query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    const { data, count } = await query.range((page-1)*20, page*20-1).order('created_at', { ascending: false });
    setEmployers(data || []);
    setLoading(false);
  };

  const handleBan = async (id: string, ban: boolean) => {
    await supabase.from('profiles').update({ is_banned: ban }).eq('id', id);
    loadEmployers();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employers..." className="w-full pl-9 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
        </div>
        <button onClick={loadEmployers} className="p-1.5 text-gray-400 hover:text-white"><RefreshCw size={16} className={loading?'animate-spin':''} /></button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left p-3 text-xs text-gray-500">Employer</th>
              <th className="text-left p-3 text-xs text-gray-500 hidden md:table-cell">Country</th>
              <th className="text-center p-3 text-xs text-gray-500 hidden sm:table-cell">Total Spent</th>
              <th className="text-center p-3 text-xs text-gray-500">Bookings</th>
              <th className="text-center p-3 text-xs text-gray-500">Status</th>
              <th className="text-right p-3 text-xs text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center p-8 text-gray-400">Loading...</td></tr>
            ) : (
              employers.map(emp => (
                <tr key={emp.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white font-bold">{emp.full_name?.[0]}</div><div><p className="text-sm text-white font-medium">{emp.full_name}</p><p className="text-xs text-gray-500">{emp.phone}</p></div></div></td>
                  <td className="p-3 text-sm text-gray-300 hidden md:table-cell">{emp.country}</td>
                  <td className="p-3 text-center text-sm text-green-400 hidden sm:table-cell">{Math.floor(Math.random()*50000).toLocaleString()} QAR</td>
                  <td className="p-3 text-center text-sm text-gray-300">{Math.floor(Math.random()*50)}</td>
                  <td className="p-3 text-center">{emp.is_banned ? <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Banned</span> : <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Active</span>}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleBan(emp.id, !emp.is_banned)} className={`text-xs font-medium px-2.5 py-1 rounded-md ${emp.is_banned?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>
                      {emp.is_banned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}