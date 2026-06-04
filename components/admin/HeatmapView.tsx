"use client";

import { useState, useMemo } from 'react';
import { MapPin, Zap, TrendingUp, Users } from 'lucide-react';

interface HeatData {
  area: string;
  lat: number;
  lng: number;
  workers: number;
  bookings: number;
  revenue: number;
  intensity: number; // 0-100
}

export default function HeatmapView() {
  const [country, setCountry] = useState('QA');
  const [metric, setMetric] = useState<'workers' | 'bookings' | 'revenue'>('workers');

  const heatData: Record<string, HeatData[]> = {
    QA: [
      { area: 'Doha', lat: 25.2854, lng: 51.5310, workers: 1247, bookings: 456, revenue: 125000, intensity: 95 },
      { area: 'Industrial Area', lat: 25.2134, lng: 51.4865, workers: 892, bookings: 320, revenue: 89000, intensity: 80 },
      { area: 'Al Rayyan', lat: 25.2920, lng: 51.4240, workers: 534, bookings: 198, revenue: 52000, intensity: 55 },
      { area: 'Al Wakrah', lat: 25.1667, lng: 51.6000, workers: 312, bookings: 112, revenue: 31000, intensity: 35 },
      { area: 'Al Khor', lat: 25.6833, lng: 51.5000, workers: 156, bookings: 54, revenue: 15000, intensity: 20 },
    ],
    AE: [
      { area: 'Dubai', lat: 25.2048, lng: 55.2708, workers: 987, bookings: 389, revenue: 108000, intensity: 90 },
      { area: 'Abu Dhabi', lat: 24.4539, lng: 54.3773, workers: 543, bookings: 201, revenue: 56000, intensity: 60 },
      { area: 'Sharjah', lat: 25.3573, lng: 55.4033, workers: 234, bookings: 87, revenue: 24000, intensity: 30 },
    ],
  };

  const data = heatData[country] || [];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-orange-400" />
          <h3 className="text-white font-semibold text-sm">Heatmap Analysis</h3>
        </div>
        <div className="flex gap-1">
          {['QA','AE','SA','KW','OM','BH'].map(c => (
            <button key={c} onClick={() => setCountry(c)} className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${country===c?'bg-orange-600 text-white':'text-gray-400 hover:text-white'}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {(['workers','bookings','revenue'] as const).map(m => (
          <button key={m} onClick={() => setMetric(m)} className={`px-3 py-1 text-[10px] font-medium rounded-md transition-colors ${metric===m?'bg-blue-600 text-white':'bg-gray-800 text-gray-400'}`}>{m.toUpperCase()}</button>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-1 gap-3">
        {data.map(d => (
          <div key={d.area} className="bg-gray-800 rounded-lg p-4 relative overflow-hidden">
            {/* Heat bar */}
            <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-30 transition-all" style={{ width: `${d.intensity}%` }} />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-orange-400" />
                  <span className="text-white font-medium">{d.area}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users size={10} />{d.workers} workers</span>
                  <span>{d.bookings} bookings</span>
                  <span className="text-green-400">{d.revenue.toLocaleString()} QAR</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{d.intensity}%</span>
                <p className="text-[10px] text-gray-400">Activity</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Total Workers</p>
          <p className="text-lg font-bold text-white">{data.reduce((s,d)=>s+d.workers,0)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Total Bookings</p>
          <p className="text-lg font-bold text-white">{data.reduce((s,d)=>s+d.bookings,0)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-400">Total Revenue</p>
          <p className="text-lg font-bold text-green-400">{data.reduce((s,d)=>s+d.revenue,0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}