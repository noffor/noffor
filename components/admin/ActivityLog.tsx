"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { History, Search, Filter, RefreshCw, Shield, User, Settings, CreditCard, Gavel } from 'lucide-react';

interface LogEntry {
  id: string;
  admin_email: string;
  action: string;
  target: string;
  detail: string;
  ip_address: string;
  created_at: string;
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadLogs(); }, [filter]);

  const loadLogs = async () => {
    setLoading(true);
    // Mock data
    const mockLogs: LogEntry[] = [
      { id: '1', admin_email: 'admin@noffor.com', action: 'ban_user', target: 'worker_123', detail: 'Banned worker: Mohammed Ali - Fake GPS detected', ip_address: '192.168.1.1', created_at: new Date(Date.now() - 60000).toISOString() },
      { id: '2', admin_email: 'admin@noffor.com', action: 'verify_user', target: 'worker_456', detail: 'Verified worker: Jamal Uddin - Documents approved', ip_address: '192.168.1.1', created_at: new Date(Date.now() - 300000).toISOString() },
      { id: '3', admin_email: 'superadmin@noffor.com', action: 'update_settings', target: 'platform', detail: 'Changed commission rate from 12% to 15%', ip_address: '10.0.0.2', created_at: new Date(Date.now() - 900000).toISOString() },
      { id: '4', admin_email: 'admin@noffor.com', action: 'refund', target: 'booking_789', detail: 'Full refund processed: 2,500 QAR - Booking #789', ip_address: '192.168.1.1', created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: '5', admin_email: 'admin@noffor.com', action: 'send_notification', target: 'all_workers_qa', detail: 'Sent: "System maintenance tonight at 2AM"', ip_address: '192.168.1.1', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: '6', admin_email: 'superadmin@noffor.com', action: 'cancel_bid', target: 'bid_456', detail: 'Cancelled spam bid from user_999', ip_address: '10.0.0.2', created_at: new Date(Date.now() - 7200000).toISOString() },
    ];

    setLogs(mockLogs.filter(l => filter === 'all' || l.action.includes(filter)));
    setLoading(false);
  };

  const getActionIcon = (action: string) => {
    if (action.includes('ban')) return <BanIcon size={14} className="text-red-400" />;
    if (action.includes('verify')) return <Shield size={14} className="text-green-400" />;
    if (action.includes('setting')) return <Settings size={14} className="text-gray-400" />;
    if (action.includes('refund') || action.includes('payment')) return <CreditCard size={14} className="text-yellow-400" />;
    if (action.includes('bid')) return <Gavel size={14} className="text-purple-400" />;
    return <User size={14} className="text-blue-400" />;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={16} className="text-blue-400" />
          <h3 className="text-white font-semibold text-sm">Activity Log</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="w-36 pl-7 pr-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
          </div>
          {['all','ban','verify','refund','bid','setting'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${filter===f?'bg-orange-600 text-white':'text-gray-400 hover:text-white'}`}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
          <button onClick={loadLogs} className="p-1 text-gray-400 hover:text-white"><RefreshCw size={14} className={loading?'animate-spin':''} /></button>
        </div>
      </div>
      <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
        {logs.map(log => (
          <div key={log.id} className="p-3 hover:bg-gray-800/30 transition-colors flex items-start gap-3">
            <div className="mt-0.5">{getActionIcon(log.action)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300">{log.detail}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                <span>{log.admin_email}</span>
                <span>{new Date(log.created_at).toLocaleString()}</span>
                <span className="text-gray-600">IP: {log.ip_address}</span>
              </div>
            </div>
            <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">{log.action.replace('_',' ').toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Ban as BanIcon } from 'lucide-react';