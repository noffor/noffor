"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, AlertTriangle, UserX, MapPin, Eye, Ban, CheckCircle, RefreshCw, Search } from 'lucide-react';

interface Alert {
  id: string;
  type: 'multiple_accounts' | 'fake_gps' | 'spam_bids' | 'report';
  severity: 'high' | 'medium' | 'low';
  user_name: string;
  user_id: string;
  detail: string;
  created_at: string;
  resolved: boolean;
}

export default function FraudAlert() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => { loadAlerts(); }, [filter]);

  const loadAlerts = async () => {
    setLoading(true);
    // Mock data + Supabase hybrid
    const mockAlerts: Alert[] = [
      { id: '1', type: 'multiple_accounts', severity: 'high', user_name: 'Ahmed Khan', user_id: 'usr_001', detail: '5 accounts from same IP: 192.168.1.100', created_at: new Date().toISOString(), resolved: false },
      { id: '2', type: 'fake_gps', severity: 'high', user_name: 'Mohammed Ali', user_id: 'usr_002', detail: 'GPS location jumped 50km in 2 minutes', created_at: new Date().toISOString(), resolved: false },
      { id: '3', type: 'spam_bids', severity: 'medium', user_name: 'John Worker', user_id: 'usr_003', detail: 'Placed 47 bids in 10 minutes', created_at: new Date().toISOString(), resolved: false },
      { id: '4', type: 'report', severity: 'medium', user_name: 'Reported Profile', user_id: 'usr_004', detail: 'Received 8 reports for fake photos', created_at: new Date().toISOString(), resolved: false },
      { id: '5', type: 'multiple_accounts', severity: 'low', user_name: 'Suspicious User', user_id: 'usr_005', detail: '2 accounts with same phone number', created_at: new Date().toISOString(), resolved: true },
    ];

    let filtered = mockAlerts;
    if (filter !== 'all') filtered = mockAlerts.filter(a => a.severity === filter);
    if (search) filtered = filtered.filter(a => a.user_name.toLowerCase().includes(search.toLowerCase()) || a.detail.toLowerCase().includes(search.toLowerCase()));
    
    setAlerts(filtered);
    setLoading(false);
  };

  const handleResolve = useCallback(async (alertId: string, ban: boolean) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
    if (ban) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) await supabase.from('profiles').update({ is_banned: true }).eq('id', alert.user_id);
    }
  }, [alerts]);

  const getSeverityColor = (s: string) => {
    switch (s) { case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'; case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'; }
  };

  const getTypeIcon = (t: string) => {
    switch (t) { case 'multiple_accounts': return <UserX size={14} className="text-red-400" />; case 'fake_gps': return <MapPin size={14} className="text-orange-400" />; case 'spam_bids': return <AlertTriangle size={14} className="text-yellow-400" />; default: return <Shield size={14} className="text-blue-400" />; }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-red-400" />
          <h3 className="text-white font-semibold text-sm">Fraud Detection</h3>
          {alerts.filter(a => !a.resolved).length > 0 && (
            <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">{alerts.filter(a => !a.resolved).length} pending</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-36 pl-7 pr-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
          </div>
          {(['all','high','medium','low'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${filter===f?'bg-orange-600 text-white':'text-gray-400 hover:text-white'}`}>
              {f.toUpperCase()}
            </button>
          ))}
          <button onClick={loadAlerts} className="p-1 text-gray-400 hover:text-white"><RefreshCw size={14} className={loading?'animate-spin':''} /></button>
        </div>
      </div>

      <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
        {alerts.map(alert => (
          <div key={alert.id} className={`p-4 hover:bg-gray-800/30 transition-colors ${alert.resolved ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">{getTypeIcon(alert.type)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm text-white font-medium">{alert.user_name}</h4>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${getSeverityColor(alert.severity)}`}>{alert.severity.toUpperCase()}</span>
                    {alert.resolved && <CheckCircle size={12} className="text-green-400" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{alert.detail}</p>
                  <span className="text-[10px] text-gray-500 mt-1 block">{new Date(alert.created_at).toLocaleString()}</span>
                </div>
              </div>
              {!alert.resolved && (
                <div className="flex gap-1 ml-3">
                  <button onClick={() => window.open(`/profile/${alert.user_id}`, '_blank')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded" title="View Profile"><Eye size={14} /></button>
                  <button onClick={() => handleResolve(alert.id, true)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded" title="Ban User"><Ban size={14} /></button>
                  <button onClick={() => handleResolve(alert.id, false)} className="p-1.5 text-green-400 hover:bg-green-500/10 rounded" title="Mark Safe"><CheckCircle size={14} /></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}