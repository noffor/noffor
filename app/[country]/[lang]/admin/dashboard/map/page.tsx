"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { MapPin, Globe, Users } from 'lucide-react';

export default function AdminMapPage() {
  const [selectedCountry, setSelectedCountry] = useState('QA');

  const countryStats = {
    QA: { online: 1247, total: 5230, areas: 5 },
    SA: { online: 892, total: 4100, areas: 4 },
    AE: { online: 654, total: 3200, areas: 3 },
    KW: { online: 234, total: 1100, areas: 2 },
    OM: { online: 156, total: 800, areas: 2 },
    BH: { online: 98, total: 450, areas: 2 },
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Globe size={24} className="text-green-400" />Live Map</h1>
            <p className="text-gray-400 text-sm mt-1">Real-time worker locations across all countries</p>
          </div>

          {/* Country Tabs */}
          <div className="flex gap-1 bg-gray-900 rounded-lg p-1 w-fit overflow-x-auto">
            {Object.entries({ QA: '🇶🇦 Qatar', SA: '🇸🇦 Saudi', AE: '🇦🇪 UAE', KW: '🇰🇼 Kuwait', OM: '🇴🇲 Oman', BH: '🇧🇭 Bahrain' }).map(([code, name]) => (
              <button key={code} onClick={() => setSelectedCountry(code)} className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${selectedCountry===code?'bg-orange-600 text-white':'text-gray-400 hover:text-white'}`}>
                {name}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <Users size={20} className="text-green-400 mb-2" />
              <p className="text-2xl font-bold text-white">{countryStats[selectedCountry as keyof typeof countryStats].online.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Online Workers</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <MapPin size={20} className="text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white">{countryStats[selectedCountry as keyof typeof countryStats].total.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Total Workers</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <Globe size={20} className="text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">{countryStats[selectedCountry as keyof typeof countryStats].areas}</p>
              <p className="text-xs text-gray-400">Active Areas</p>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Globe size={48} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Live Map View</p>
              <p className="text-gray-500 text-xs mt-1">Integrate with Leaflet component for live worker tracking</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}