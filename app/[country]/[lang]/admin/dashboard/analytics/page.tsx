"use client";

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { BarChart3, TrendingUp, Users, Activity, Globe } from 'lucide-react';

export default function AnalyticsPage() {
  const metrics = [
    { label: 'DAU', value: '12,847', change: '+18%', color: 'text-green-400' },
    { label: 'MAU', value: '156,234', change: '+12%', color: 'text-blue-400' },
    { label: 'Retention', value: '67%', change: '+5%', color: 'text-purple-400' },
    { label: 'Bounce Rate', value: '23%', change: '-8%', color: 'text-orange-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart3 size={24} className="text-cyan-400" />Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Platform performance and user insights</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-xs text-gray-400">{m.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{m.value}</p>
                <span className={`text-xs ${m.color}`}>{m.change}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">User Growth</h3>
              <div className="flex items-end gap-1 h-32">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-blue-500/60 to-blue-400 rounded-t-sm" style={{ height: `${20 + Math.random() * 80}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-gray-500"><span>Day 1</span><span>Day 30</span></div>
            </div>

            {/* Chart 2 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Popular Categories</h3>
              <div className="space-y-3">
                {['Driver', 'Electrician', 'Plumber', 'Mason', 'AC Technician'].map((cat, i) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${100 - i * 18}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{100 - i * 18}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}