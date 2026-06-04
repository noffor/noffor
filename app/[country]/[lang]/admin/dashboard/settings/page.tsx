"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { supabase } from '@/lib/supabase';
import { Settings, Save, Globe, Percent, Clock, Star, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    commissionRate: 15,
    maxBidsPerJob: 10,
    bookingTimeout: 30,
    minRating: 3.5,
    maintenanceMode: false,
    autoVerify: true,
  });

  const handleSave = async () => {
    // Save to settings table
    await supabase.from('settings').upsert({ key: 'platform_config', value: settings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings size={24} className="text-gray-400" />Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Platform configuration and controls</p>
          </div>

          <div className="max-w-2xl space-y-4">
            {/* Commission Rate */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><Percent size={16} className="text-green-400" /><h3 className="text-white font-semibold text-sm">Commission Rate</h3></div>
              <div className="flex items-center gap-3">
                <input type="range" min="5" max="30" value={settings.commissionRate} onChange={e => setSettings(s => ({...s, commissionRate: +e.target.value}))} className="flex-1 accent-orange-500" />
                <span className="text-white font-bold text-lg w-16 text-right">{settings.commissionRate}%</span>
              </div>
            </div>

            {/* Max Bids */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><Globe size={16} className="text-blue-400" /><h3 className="text-white font-semibold text-sm">Max Bids Per Job</h3></div>
              <input type="number" value={settings.maxBidsPerJob} onChange={e => setSettings(s => ({...s, maxBidsPerJob: +e.target.value}))} className="w-24 bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500" />
            </div>

            {/* Booking Timeout */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><Clock size={16} className="text-yellow-400" /><h3 className="text-white font-semibold text-sm">Booking Timeout (minutes)</h3></div>
              <input type="number" value={settings.bookingTimeout} onChange={e => setSettings(s => ({...s, bookingTimeout: +e.target.value}))} className="w-24 bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500" />
            </div>

            {/* Min Rating */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><Star size={16} className="text-purple-400" /><h3 className="text-white font-semibold text-sm">Minimum Worker Rating</h3></div>
              <input type="number" step="0.1" value={settings.minRating} onChange={e => setSettings(s => ({...s, minRating: +e.target.value}))} className="w-24 bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500" />
            </div>

            {/* Toggles */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div><h3 className="text-white font-semibold text-sm">Maintenance Mode</h3><p className="text-xs text-gray-400">Disable platform for all users</p></div>
                <button onClick={() => setSettings(s => ({...s, maintenanceMode: !s.maintenanceMode}))} className="text-gray-400 hover:text-white">
                  {settings.maintenanceMode ? <ToggleRight size={28} className="text-red-400" /> : <ToggleLeft size={28} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div><h3 className="text-white font-semibold text-sm">Auto-Verify Workers</h3><p className="text-xs text-gray-400">Automatically verify new workers</p></div>
                <button onClick={() => setSettings(s => ({...s, autoVerify: !s.autoVerify}))} className="text-gray-400 hover:text-white">
                  {settings.autoVerify ? <ToggleRight size={28} className="text-green-400" /> : <ToggleLeft size={28} />}
                </button>
              </div>
            </div>

            {settings.maintenanceMode && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <AlertTriangle size={16} className="text-red-400" />
                <p className="text-sm text-red-400">Maintenance mode is ON — users cannot access the platform</p>
              </div>
            )}

            <button onClick={handleSave} className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-all flex items-center justify-center gap-2">
              {saved ? <><Save size={16} />Saved!</> : <><Save size={16} />Save Settings</>}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}