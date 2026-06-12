// components/map/LiveWorkerMap.tsx
// 🚀 UBER-STYLE • Production Ready • All DOM Errors Fixed
'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, MapPin, UserPlus, X, Star, Clock } from 'lucide-react';

// ═══════════════════ TYPES ═══════════════════
interface Worker {
  worker_id: string;
  latitude: number;
  longitude: number;
  is_online: boolean;
  last_seen: string;
  profile?: {
    name: string;
    photo_url: string;
    category: string;
    rating: number;
  };
  distance?: number;
  eta?: number;
  price_estimate?: number;
}

interface Props {
  country: string;
  lang: string;
  userLat?: number;
  userLng?: number;
  onSelectWorker?: (worker: Worker) => void;
  onQuickHire?: (worker: Worker) => void;
  onClose?: () => void;
}

const COUNTRY_CENTERS: Record<string, [number, number]> = {
  qa: [25.3548, 51.1839], sa: [24.7136, 46.6753], ae: [25.2048, 55.2708],
  kw: [29.3759, 47.9774], bh: [26.0667, 50.5577], om: [23.5880, 58.3829],
};

const T: Record<string, any> = {
  en: {
    loading: 'Finding workers near you...', noWorkers: 'No workers available nearby',
    km: 'km', min: 'min', hireNow: 'Hire Now', yourLocation: '📍 Your Location',
    tapWorker: 'Tap a worker to hire', findingLocation: 'Detecting your location...',
    gpsLocation: '📍 GPS Location', workersAvailable: 'workers available',
    error: 'Something went wrong!', refresh: 'Refresh Page', goHome: 'Go Home',
  },
  bn: {
    loading: 'আপনার আশেপাশে শ্রমিক খোঁজা হচ্ছে...', noWorkers: 'আশেপাশে কোনো শ্রমিক পাওয়া যায়নি',
    km: 'কিমি', min: 'মিনিট', hireNow: 'এখনই হায়ার করুন', yourLocation: '📍 আপনার অবস্থান',
    tapWorker: 'শ্রমিক সিলেক্ট করতে ট্যাপ করুন', findingLocation: 'আপনার লোকেশন খোঁজা হচ্ছে...',
    gpsLocation: '📍 জিপিএস লোকেশন', workersAvailable: 'জন শ্রমিক উপলব্ধ',
    error: 'কিছু ভুল হয়েছে!', refresh: 'রিফ্রেশ করুন', goHome: 'হোমে যান',
  },
  ar: {
    loading: 'جاري البحث عن عمال بالقرب منك...', noWorkers: 'لا يوجد عمال متاحون',
    km: 'كم', min: 'دقيقة', hireNow: 'وظف الآن', yourLocation: '📍 موقعك',
    tapWorker: 'اضغط على عامل للتوظيف', findingLocation: 'جاري تحديد موقعك...',
    gpsLocation: '📍 موقع GPS', workersAvailable: 'عمال متاحون',
    error: 'حدث خطأ ما!', refresh: 'تحديث الصفحة', goHome: 'الرئيسية',
  },
  hi: {
    loading: 'आपके आसपास श्रमिक खोज रहे हैं...', noWorkers: 'आसपास कोई श्रमिक उपलब्ध नहीं',
    km: 'किमी', min: 'मिनट', hireNow: 'अभी हायर करें', yourLocation: 'आपकी स्थिति',
    tapWorker: 'श्रमिक चुनने के लिए टैप करें', findingLocation: 'आपकी लोकेशन ढूंढ रहे हैं...',
    gpsLocation: '📍 जीपीएस लोकेशन', workersAvailable: 'श्रमिक उपलब्ध',
    error: 'कुछ गलत हो गया!', refresh: 'रीफ्रेश करें', goHome: 'होम',
  },
};

const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

const getEta = (distance: number): number => Math.max(1, Math.ceil((distance / 30) * 60));
const getPrice = (distance: number, rate: number = 25): number => Math.round(distance * 2 + (distance / 30) * rate);

const WorkerCard = memo(({ worker, isSelected, tr, onClick, onHire }: {
  worker: Worker; isSelected: boolean; tr: any;
  onClick: () => void; onHire: (worker: Worker) => void;
}) => (
  <div onClick={onClick} data-id={worker.worker_id}
    className={`flex items-center gap-3 px-4 py-3 border-b cursor-pointer active:bg-blue-50 transition-all duration-200 ${isSelected ? 'bg-blue-50 border-l-[3px] border-l-blue-500' : 'border-l-[3px] border-l-transparent'}`}>
    <div className="relative shrink-0">
      {worker.profile?.photo_url ? (
        <img src={worker.profile.photo_url} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-gray-200 shadow-sm" loading="lazy" />
      ) : (
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg shadow-sm">👷</div>
      )}
      <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${worker.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-sm truncate">{worker.profile?.name || 'Worker'}</p>
        {worker.profile?.rating && worker.profile.rating >= 4.5 && (
          <span className="flex items-center gap-0.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
            <Star size={8} fill="#f59e0b" className="text-amber-500" /> {worker.profile.rating}
          </span>
        )}
      </div>
      <p className="text-[11px] text-gray-500">{worker.profile?.category || 'General Worker'}</p>
      <div className="flex items-center gap-3 mt-1 text-[11px]">
        <span className="text-blue-600 font-bold">📍 {worker.distance}{tr.km}</span>
        <span className="text-green-600 font-bold"><Clock size={10} /> {worker.eta}{tr.min}</span>
        <span className="text-purple-600 font-bold">💰 {worker.price_estimate} QAR</span>
      </div>
    </div>
    <button onClick={(e) => { e.stopPropagation(); onHire(worker); }}
      className="shrink-0 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-bold active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center gap-1.5">
      <UserPlus size={13} /> {tr.hireNow}
    </button>
  </div>
));
WorkerCard.displayName = 'WorkerCard';

export default function LiveWorkerMap({ country, lang, userLat, userLng, onSelectWorker, onQuickHire, onClose }: Props) {
  const tr = useMemo(() => T[lang] || T.en, [lang]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSource, setLocationSource] = useState<'gps' | 'country'>('country');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const workerMarkersRef = useRef<Map<string, any>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aliveRef = useRef(true);
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const mapInitializedRef = useRef(false);

  // ═══════ SAFE MAP REMOVAL ═══════
  const safeRemoveMap = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        // Remove all markers first
        workerMarkersRef.current.forEach((marker) => {
          try { mapInstanceRef.current?.removeLayer(marker); } catch (e) {}
        });
        workerMarkersRef.current.clear();
        
        if (userMarkerRef.current) {
          try { mapInstanceRef.current?.removeLayer(userMarkerRef.current); } catch (e) {}
          userMarkerRef.current = null;
        }
        
        // Remove map
        mapInstanceRef.current.remove();
      } catch (e) {
        // Ignore cleanup errors
      }
      mapInstanceRef.current = null;
    }
    mapInitializedRef.current = false;
  }, []);

  // ═══════ CLEANUP ON UNMOUNT ═══════
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      safeRemoveMap();
    };
  }, [safeRemoveMap]);

  // ═══════ LOCATION DETECTION ═══════
  useEffect(() => {
    const detectLocation = async () => {
      if (userLat && userLng) {
        const loc = { lat: userLat, lng: userLng };
        setUserLocation(loc);
        userLocationRef.current = loc;
        setLocationSource('gps');
        return;
      }

      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { 
              enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 
            });
          });
          if (aliveRef.current) {
            const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserLocation(loc);
            userLocationRef.current = loc;
            setLocationSource('gps');
            return;
          }
        } catch {}
      }

      const [lat, lng] = COUNTRY_CENTERS[country] || COUNTRY_CENTERS.qa;
      const loc = { lat, lng };
      setUserLocation(loc);
      userLocationRef.current = loc;
      setLocationSource('country');
    };

    detectLocation();
  }, [userLat, userLng, country]);

  // ═══════ FETCH WORKERS ═══════
  const fetchWorkers = useCallback(async () => {
    const map = mapInstanceRef.current;
    const loc = userLocationRef.current;
    if (!map || !(window as any).L || !loc) return;

    try {
      const { data: locations, error } = await supabase
        .from('worker_locations')
        .select(`
          worker_id, latitude, longitude, is_online, last_seen,
          profiles:worker_id (name, photo_url, category, rating)
        `)
        .eq('is_online', true)
        .limit(100);

      if (error || !locations?.length) {
        setWorkers([]);
        setIsLoading(false);
        return;
      }

      const workerList: Worker[] = locations
        .map((loc: any) => ({
          worker_id: loc.worker_id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          is_online: loc.is_online,
          last_seen: loc.last_seen,
          profile: Array.isArray(loc.profiles) ? loc.profiles[0] : loc.profiles || undefined,
          distance: getDistance(loc.latitude, loc.longitude, loc.latitude, loc.longitude), // temp
        }))
        .map(w => ({
          ...w,
          distance: getDistance(userLocationRef.current!.lat, userLocationRef.current!.lng, w.latitude, w.longitude),
          eta: 0,
        }))
        .filter(w => w.distance <= 50)
        .map(w => ({ ...w, eta: getEta(w.distance), price_estimate: getPrice(w.distance) }))
        .sort((a, b) => (a.distance || 999) - (b.distance || 999));

      setWorkers(workerList);
      setIsLoading(false);

      // ✅ Safe marker update
      workerMarkersRef.current.forEach((marker) => {
        try { map.removeLayer(marker); } catch (e) {}
      });
      workerMarkersRef.current.clear();
      
      const L = (window as any).L;
      const colors = ['#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899', '#10B981', '#F97316'];

      workerList.slice(0, 50).forEach((worker, i) => {
        try {
          const marker = L.circleMarker([worker.latitude, worker.longitude], {
            radius: i < 3 ? 12 : 8,
            color: '#fff',
            fillColor: colors[i % colors.length],
            fillOpacity: 0.9,
            weight: 2.5,
          }).addTo(map);
          
          marker.bindPopup(`<div style="padding:10px;font-size:12px;min-width:160px;">
            <b style="font-size:14px;">${worker.profile?.name || 'Worker'}</b>
            <div style="color:#666;font-size:10px;">${worker.profile?.category || 'General'}</div>
            <hr style="margin:6px 0;">
            <div>📍 <b>${worker.distance}${tr.km}</b> | ⏱ <b>${worker.eta}${tr.min}</b></div>
            <div>💰 <b>${worker.price_estimate} QAR</b></div>
          </div>`);
          
          marker.on('click', () => {
            setSelectedWorker(worker);
            onSelectWorker?.(worker);
          });
          
          workerMarkersRef.current.set(worker.worker_id, marker);
        } catch (e) {}
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setIsLoading(false);
    }
  }, [tr, onSelectWorker]);

  // ═══════ INIT MAP ═══════
  useEffect(() => {
    if (mapInitializedRef.current) return;
    if (!mapContainerRef.current) return;

    const initMap = async () => {
      try {
        // Load CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Load JS
        if (!(window as any).L) {
          await new Promise<void>((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve();
            document.head.appendChild(script);
          });
        }

        // ✅ Wait for container to have height
        let attempts = 0;
        while (attempts < 30) {
          const el = mapContainerRef.current;
          if (el && el.offsetHeight > 0) break;
          await new Promise(r => setTimeout(r, 200));
          attempts++;
        }

        if (!mapContainerRef.current || !aliveRef.current) return;

        // ✅ Clean previous map instance
        safeRemoveMap();

        const [clat, clng] = userLocationRef.current
          ? [userLocationRef.current.lat, userLocationRef.current.lng]
          : COUNTRY_CENTERS[country] || COUNTRY_CENTERS.qa;

        const L = (window as any).L;
        const map = L.map(mapContainerRef.current, {
          center: [clat, clng],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
          // ✅ Prevent touch conflicts
          tap: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        mapInitializedRef.current = true;

        setTimeout(() => {
          try { map.invalidateSize(); } catch (e) {}
        }, 500);

        setMapReady(true);

        if (userLocationRef.current) {
          setTimeout(() => fetchWorkers(), 600);
        }
      } catch (err) {
        console.error('Map init error:', err);
        setHasError(true);
        setIsLoading(false);
      }
    };

    setTimeout(initMap, 300);
  }, [country, fetchWorkers, safeRemoveMap]);

  // ═══════ USER MARKER ═══════
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation || !(window as any).L) return;

    try {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }

      const L = (window as any).L;
      const color = locationSource === 'gps' ? '#3B82F6' : '#F59E0B';
      const label = locationSource === 'gps' ? tr.gpsLocation : tr.yourLocation;

      userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 9, color: '#fff', fillColor: color, fillOpacity: 1, weight: 3,
      }).addTo(map).bindPopup(`<b>${label}</b>`);

      map.setView([userLocation.lat, userLocation.lng], 14);
      fetchWorkers();
    } catch (e) {}
  }, [userLocation, tr, locationSource, fetchWorkers]);

  // ═══════ AUTO REFRESH ═══════
  useEffect(() => {
    if (!mapReady) return;
    refreshTimerRef.current = setInterval(() => {
      if (aliveRef.current) fetchWorkers();
    }, 30000);
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [mapReady, fetchWorkers]);

  // ═══════ SCROLL TO SELECTED ═══════
  useEffect(() => {
    if (!selectedWorker || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-id="${selectedWorker.worker_id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedWorker]);

  const handleHire = useCallback((worker: Worker) => {
    setSelectedWorker(worker);
    onSelectWorker?.(worker);
    if (onQuickHire) {
      onQuickHire(worker);
    }
  }, [onSelectWorker, onQuickHire]);

  // ═══════ ERROR STATE ═══════
  if (hasError) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-10 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin size={28} className="text-red-400" />
          </div>
          <p className="text-sm text-gray-600 font-bold">{tr.error}</p>
          <div className="flex gap-2 justify-center mt-4">
            <button onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold">
              {tr.refresh}
            </button>
            {onClose && (
              <button onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-bold">
                {tr.goHome}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-green-400" />
            <div>
              <p className="text-white font-bold text-sm">
                {isLoading ? tr.findingLocation : 
                  workers.length > 0 ? `${workers.length} ${tr.workersAvailable}` : tr.noWorkers}
              </p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* MAP CONTAINER - ✅ React ref, no ID */}
      <div 
        ref={mapContainerRef}
        style={{ width: '100%', height: '280px', backgroundColor: '#e5e7eb', position: 'relative' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-50 gap-3">
            <Loader2 size={40} className="animate-spin text-blue-500" />
            <p className="text-sm text-gray-500 font-medium">{tr.findingLocation}</p>
          </div>
        )}
      </div>

      {/* WORKER LIST */}
      <div ref={listRef} className="overflow-y-auto bg-white" style={{ maxHeight: '35vh', WebkitOverflowScrolling: 'touch' }}>
        {!isLoading && workers.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 font-bold">{tr.noWorkers}</p>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm px-4 py-2 text-[11px] font-bold text-gray-500 border-b z-10 flex items-center justify-between">
              <span>{workers.length} {tr.workersAvailable}</span>
              <span className="text-gray-400 font-normal">{tr.tapWorker}</span>
            </div>
            {workers.slice(0, 50).map((worker) => (
              <WorkerCard key={worker.worker_id} worker={worker}
                isSelected={selectedWorker?.worker_id === worker.worker_id}
                tr={tr}
                onClick={() => { 
                  setSelectedWorker(worker); 
                  onSelectWorker?.(worker); 
                  try { mapInstanceRef.current?.setView([worker.latitude, worker.longitude], 16); } catch (e) {}
                }}
                onHire={handleHire} />
            ))}
          </>
        )}
      </div>

      {/* HIRE BAR */}
      {selectedWorker && (
        <div className="bg-white border-t-2 border-green-500 px-4 py-3 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shrink-0">
            {selectedWorker.profile?.photo_url ? (
              <img src={selectedWorker.profile.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <UserPlus size={18} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{selectedWorker.profile?.name || 'Worker'}</p>
            <p className="text-[10px] text-gray-500 flex items-center gap-2">
              <span>📍 {selectedWorker.distance}{tr.km}</span>
              <span>⏱ {selectedWorker.eta}{tr.min}</span>
              <span className="text-purple-600 font-bold">💰 {selectedWorker.price_estimate} QAR</span>
            </p>
          </div>
          <button onClick={() => handleHire(selectedWorker)}
            className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold active:scale-95 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
            <UserPlus size={15} /> {tr.hireNow}
          </button>
        </div>
      )}
    </div>
  );
}