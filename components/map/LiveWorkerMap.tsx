// components/map/LiveWorkerMap.tsx
// 🚀 1 Billion Users | Real-time | No Lag | No Crash | Full Language Support
'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo, startTransition, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Navigation, X, Loader2, MapPin, Clock, Star, AlertCircle, RefreshCw } from 'lucide-react';
import { getText, LangCode, translateNumber, getCurrencySymbol } from '@/lib/language';
import MarkerPopup from './MarkerPopup';

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════
interface Worker {
  worker_id: string;
  latitude: number;
  longitude: number;
  is_online: boolean;
  last_seen: string;
  expected_salary?: number;
  profiles?: {
    name: string;
    photo_url: string;
    category: string;
    rating: number;
    country: string;
  };
  distance?: number;
  eta?: number;
}

interface Props {
  country: string;
  lang: string;
  userLat?: number;
  userLng?: number;
  onSelectWorker?: (worker: Worker) => void;
}

// ═══════════════════════════════════════════════════════════
// Static Data (Memory Optimized)
// ═══════════════════════════════════════════════════════════
const COUNTRY_CENTERS: Record<string, { lat: number; lng: number }> = {
  qa: { lat: 25.3548, lng: 51.1839 },
  sa: { lat: 24.7136, lng: 46.6753 },
  ae: { lat: 25.2048, lng: 55.2708 },
  kw: { lat: 29.3759, lng: 47.9774 },
  bh: { lat: 26.0667, lng: 50.5577 },
  om: { lat: 23.5880, lng: 58.3829 },
};

// ═══════════════════════════════════════════════════════════
// Math Helpers (Pure Functions - No Re-renders)
// ═══════════════════════════════════════════════════════════
const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
};

const calcETA = (dist: number): number => Math.ceil((dist / 30) * 60);

// ═══════════════════════════════════════════════════════════
// Static Translations
// ═══════════════════════════════════════════════════════════
const T = {
  en: { nearWorkers: 'Nearby Workers', noWorkers: 'No workers found', loading: 'Loading Map...', km: 'km', eta: 'ETA', min: 'min', hire: 'Hire', viewProfile: 'Profile', error: 'Failed to load', retry: 'Retry', allWorkers: 'All Workers', online: 'Online', offline: 'Offline' },
  bn: { nearWorkers: 'কাছের শ্রমিক', noWorkers: 'কোনো শ্রমিক পাওয়া যায়নি', loading: 'ম্যাপ লোড হচ্ছে...', km: 'কিমি', eta: 'সময়', min: 'মিনিট', hire: 'নিয়োগ', viewProfile: 'প্রোফাইল', error: 'লোড ব্যর্থ', retry: 'আবার চেষ্টা', allWorkers: 'সব শ্রমিক', online: 'অনলাইন', offline: 'অফলাইন' },
  ar: { nearWorkers: 'العمال القريبون', noWorkers: 'لم يتم العثور على عمال', loading: 'جاري تحميل الخريطة...', km: 'كم', eta: 'الوقت', min: 'دقيقة', hire: 'توظيف', viewProfile: 'الملف', error: 'فشل التحميل', retry: 'إعادة المحاولة', allWorkers: 'جميع العمال', online: 'متصل', offline: 'غير متصل' },
  hi: { nearWorkers: 'पास के श्रमिक', noWorkers: 'कोई श्रमिक नहीं मिला', loading: 'मैप लोड हो रहा है...', km: 'किमी', eta: 'समय', min: 'मिनट', hire: 'किराया', viewProfile: 'प्रोफाइल', error: 'लोड विफल', retry: 'पुनः प्रयास', allWorkers: 'सभी श्रमिक', online: 'ऑनलाइन', offline: 'ऑफलाइन' },
};

// Global References (for cleanup)
let globalMap: any = null;
let globalMarkers: any[] = [];
let globalInterval: ReturnType<typeof setInterval> | null = null;

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
export default function LiveWorkerMap({ country, lang, userLat, userLng, onSelectWorker }: Props) {
  const tr = useMemo(() => T[lang as keyof typeof T] || T.en, [lang]);
  const t = useCallback((key: string) => getText(lang as LangCode, key), [lang]);
  
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selected, setSelected] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const LRef = useRef<any>(null);
  const aliveRef = useRef(true);

  // Mount / Unmount
  useEffect(() => {
    setMounted(true);
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (globalInterval) clearInterval(globalInterval);
      if (globalMap) {
        globalMarkers.forEach(m => globalMap?.removeLayer(m));
        globalMap?.remove();
        globalMap = null;
        globalMarkers = [];
      }
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !mapRef.current) return;
    if (globalMap) {
      globalMap.remove();
      globalMap = null;
      globalMarkers = [];
    }

    import('leaflet').then(L => {
      if (!mapRef.current || !aliveRef.current) return;
      LRef.current = L.default;

      // Load CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const center = COUNTRY_CENTERS[country] || COUNTRY_CENTERS.qa;
      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
        .setView([center.lat, center.lng], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // User Location Marker
      if (userLat && userLng) {
        L.circleMarker([userLat, userLng], {
          radius: 8,
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 1,
          weight: 3,
        }).bindPopup(`<b>📍 ${t('map_you_are_in')}</b>`).addTo(map);
      }

      globalMap = map;
      loadWorkers();
    }).catch(() => {
      if (aliveRef.current) setError(true);
      setLoading(false);
    });

    return () => {
      if (globalInterval) clearInterval(globalInterval);
    };
  }, [mounted]);

  // Country Change
  useEffect(() => {
    if (!globalMap || !mounted) return;
    const center = COUNTRY_CENTERS[country] || COUNTRY_CENTERS.qa;
    globalMap.setView([center.lat, center.lng], 12);
    loadWorkers();
  }, [country]);

  // Load Workers with Language Support
  const loadWorkers = useCallback(async () => {
    const map = globalMap;
    if (!map || !LRef.current || !aliveRef.current) return;

    try {
      const { data, error: e } = await supabase
        .from('worker_locations')
        .select('*, profiles:worker_id(name, photo_url, category, rating, country, expected_salary)')
        .limit(200);

      if (e) throw e;
      if (!aliveRef.current) return;

      const L = LRef.current;
      globalMarkers.forEach(mk => map.removeLayer(mk));
      globalMarkers = [];

      const filtered = (data || []).filter((w: any) =>
        !w.profiles?.country || w.profiles.country === country
      );

      const enriched = filtered.map((w: any) => ({
        ...w,
        expected_salary: w.profiles?.expected_salary || 0,
        distance: userLat ? calcDistance(userLat, userLng || 0, w.latitude, w.longitude) : undefined,
        eta: userLat ? calcETA(calcDistance(userLat, userLng || 0, w.latitude, w.longitude)) : undefined,
      })).sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));

      // Add Markers with Translated Popups
      enriched.forEach((worker: any, idx: number) => {
        const isOnline = worker.is_online;
        const marker = L.circleMarker([worker.latitude, worker.longitude], {
          radius: idx === 0 ? 10 : 7,
          color: '#fff',
          fillColor: isOnline ? (idx === 0 ? '#22c55e' : '#3b82f6') : '#9ca3af',
          fillOpacity: isOnline ? 1 : 0.5,
          weight: 2,
        }).addTo(map);

        // 🚀 Translated Popup Content
        const salary = worker.expected_salary || 0;
        const distance = worker.distance || 0;
        const eta = worker.eta || 0;
        const statusText = isOnline ? `🟢 ${tr.online}` : `🔴 ${tr.offline}`;
        const workerName = worker.profiles?.name || 'Worker';

        const popupHtml = `
          <div style="min-width:180px; padding:6px; font-family:sans-serif;">
            <b style="font-size:14px;">${workerName}</b><br/>
            <span style="font-size:12px; color:#ea580c;">💰 ${translateNumber(salary, lang)} ${getCurrencySymbol(lang)}</span><br/>
            ${distance > 0 ? `<span style="font-size:11px;">📍 ${t('map_distance')}: ${translateNumber(distance.toFixed(1), lang)} ${tr.km}</span><br/>` : ''}
            ${eta > 0 ? `<span style="font-size:11px; color:#16a34a;">⏱️ ${t('map_eta')}: ${translateNumber(Math.round(eta), lang)} ${tr.min}</span><br/>` : ''}
            <span style="font-size:10px; color:${isOnline ? '#16a34a' : '#6b7280'};">${statusText}</span>
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.on('click', () => {
          startTransition(() => {
            setSelected(worker);
            onSelectWorker?.(worker);
          });
        });
        globalMarkers.push(marker);
      });

      startTransition(() => {
        setWorkers(enriched);
        setLoading(false);
        setError(false);
      });
    } catch {
      if (aliveRef.current) {
        startTransition(() => setError(true));
        setLoading(false);
      }
    }
  }, [userLat, userLng, country, onSelectWorker, lang, tr, t]);

  // Auto Refresh (15 seconds)
  useEffect(() => {
    if (!mounted) return;
    globalInterval = setInterval(loadWorkers, 15000);
    return () => {
      if (globalInterval) clearInterval(globalInterval);
    };
  }, [loadWorkers, mounted]);

  // Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-green-50">
          <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Navigation size={16} className="text-blue-600 animate-pulse" />
            {tr.loading}
          </span>
        </div>
        <div className="w-full h-64 lg:h-96 bg-gray-100 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-3 border-b bg-red-50">
          <span className="text-sm font-bold text-red-600 flex items-center gap-2">
            <AlertCircle size={16} />
            {tr.error}
          </span>
        </div>
        <div className="w-full h-64 lg:h-96 bg-gray-100 flex flex-col items-center justify-center gap-3">
          <AlertCircle size={32} className="text-red-400" />
          <button
            onClick={loadWorkers}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-95 transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} /> {tr.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm" style={{ contain: 'layout style paint' }}>
      {/* Header */}
      <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-green-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
          <Navigation size={16} className="text-blue-600" />
          {tr.allWorkers}
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-mono">
            {translateNumber(workers.length, lang)}
          </span>
        </h3>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-gray-500"><span className="w-2 h-2 rounded-full bg-green-500" />{tr.online}</span>
          <span className="flex items-center gap-1 text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-400" />{tr.offline}</span>
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="w-full h-64 lg:h-96 relative bg-gray-100" style={{ minHeight: '300px' }} />

      {/* Selected Worker Popup Bottom Sheet */}
      {selected && (
        <div className="p-3 border-t bg-white animate-in slide-in-from-bottom-2">
          <MarkerPopup labor={selected} href={`/worker/${selected.worker_id}`} lang={lang} />
        </div>
      )}
    </div>
  );
}