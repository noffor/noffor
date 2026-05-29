"use client";
import { useState } from 'react';
import { LayoutDashboard, Users, CreditCard, Image, Grid, MapPin, Star, Settings, LogOut } from 'lucide-react';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'areas', label: 'Areas', icon: MapPin },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="hidden lg:flex flex-col w-64 bg-gray-900 text-white min-h-screen">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Noffor Admin</h1>
          <p className="text-xs text-gray-400">Management Panel</p>
        </div>
        <div className="flex-1 py-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${tab === t.id ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-800">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white text-sm">
            <LogOut size={16} /> Exit
          </button>
        </div>
      </div>
      <div className="flex-1 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 capitalize">{tab}</h2>
        <div className="bg-white rounded-xl p-8 border text-center text-gray-500">
          {tab} management coming soon
        </div>
      </div>
    </div>
  );
}