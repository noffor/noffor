"use client";

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import RevenueChart from '@/components/admin/RevenueChart';
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight } from 'lucide-react';

export default function PaymentsPage() {
  const stats = { today: 12500, week: 87500, month: 342000, pending: 45000 };

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><DollarSign size={24} className="text-green-400" />Payments & Revenue</h1>
            <p className="text-gray-400 text-sm mt-1">Track all transactions and platform revenue</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Today', value: stats.today, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'This Week', value: stats.week, icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'This Month', value: stats.month, icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Pending Payouts', value: stats.pending, icon: ArrowUpRight, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <p className="text-2xl font-bold text-white">{s.value.toLocaleString()} <span className="text-sm text-gray-400">QAR</span></p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <RevenueChart />
        </main>
      </div>
    </div>
  );
}