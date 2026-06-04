"use client";

import { useState } from 'react';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

export default function RevenueChart() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  
  // Mock data — Supabase থেকে real data নিবে
  const stats = {
    total: Math.floor(Math.random() * 500000),
    thisMonth: Math.floor(Math.random() * 80000),
    commission: Math.floor(Math.random() * 12000),
    pendingPayouts: Math.floor(Math.random() * 25000),
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-purple-400" />
          <h3 className="text-white font-semibold text-sm">Revenue Overview</h3>
        </div>
        <div className="flex gap-1">
          {(['7d','30d','90d'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${period===p?'bg-purple-500/20 text-purple-400':'text-gray-500 hover:text-gray-300'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Total Revenue</p>
          <p className="text-xl font-bold text-white">{stats.total.toLocaleString()} <span className="text-sm text-gray-400">QAR</span></p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Commission Earned</p>
          <p className="text-xl font-bold text-green-400">{stats.commission.toLocaleString()} <span className="text-sm text-gray-400">QAR</span></p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">This Month</p>
          <p className="text-lg font-bold text-white">{stats.thisMonth.toLocaleString()} <span className="text-sm text-gray-400">QAR</span></p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Pending Payouts</p>
          <p className="text-lg font-bold text-yellow-400">{stats.pendingPayouts.toLocaleString()} <span className="text-sm text-gray-400">QAR</span></p>
        </div>
      </div>

      {/* Mini Bar Chart */}
      <div className="flex items-end gap-1 h-24">
        {Array.from({ length: 24 }).map((_, i) => {
          const height = Math.random() * 100;
          return (
            <div key={i} className="flex-1 bg-gradient-to-t from-purple-500/60 to-purple-400 rounded-t-sm transition-all hover:from-purple-400 hover:to-purple-300" style={{ height: `${height}%` }} />
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-gray-500">
        <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
      </div>
    </div>
  );
}