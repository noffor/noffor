// components/map/LiveWorkerMap.tsx
// 🚀 সুপারসনিক • ১ বিলিয়ন ইউজার • ৬ গালফ দেশ • নো ল্যাগ • নো ক্র্যাশ
"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Navigation, X } from 'lucide-react';

interface Worker {
  worker_id: string;
  latitude: number;
  longitude: number;
  is_online: boolean;
  last_seen: string;
  profiles?: { name: string; photo_url: string; category: string; rating: number; country: string };
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

let globalMapInstance: any = null;
let globalMarkers: any[] = [];

export default function LiveWorkerMap({ country, lang, userLat, userLng, onSelectWorker }: Props) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const LRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);
  const countryRef = useRef(country);

  const t = useCallback((key: string) => {
    const texts: Record<string, Record<string, string>> = {
      en: { nearWorkers: 'Nearby Workers', noWorkers: 'No online workers', loading: 'Loading...', km: 'km', eta: 'ETA', min: 'min', hire: 'Hire Now', viewProfile: 'View Profile' },
      bn: { nearWorkers: 'কাছের শ্রমিক', noWorkers: 'কোনো অনলাইন শ্রমিক নেই', loading: 'লোড হচ্ছে...', km: 'কিমি', eta: 'সময়', min: 'মিনিট', hire: 'হায়ার করুন', viewProfile: 'প্রোফাইল' },
      ar: { nearWorkers: 'العمال القريبون', noWorkers: 'لا يوجد عمال', loading: 'جاري...', km: 'كم', eta: 'الوقت', min: 'دقيقة', hire: 'توظيف', viewProfile: 'الملف' },
      hi: { nearWorkers: 'पास के श्रमिक', noWorkers: 'कोई नहीं', loading: 'लोड...', km: 'किमी', eta: 'समय', min: 'मिनट', hire: 'हायर', viewProfile: 'प्रोफाइल' },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  }, [lang]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (mapRef.current && (mapRef.current as any)._leaflet_map) {
      (mapRef.current as any)._leaflet_map.remove();
      (mapRef.current as any)._leaflet_map = null;
      globalMapInstance = null;
      globalMarkers = [];
      initializedRef.current = false;
    }
    
    if (initializedRef.current) return;
    initializedRef.current = true;
    countryRef.current = country;

    import('leaflet').then(L => {
      LRef.current = L.default;
      if (!mapRef.current || (mapRef.current as any)._leaflet_map) return;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const center = getCountryCenter(country);
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false })
        .setView([center.lat, center.lng], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM', maxZoom: 19
      }).addTo(map);

      if (userLat && userLng) {
        L.circleMarker([userLat, userLng], { 
          radius: 8, color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 1, weight: 3 
        }).addTo(map);
      }

      globalMapInstance = map;
      loadWorkers();
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    countryRef.current = country;
    if (globalMapInstance) {
      const center = getCountryCenter(country);
      globalMapInstance.setView([center.lat, center.lng], 12);
      loadWorkers();
    }
  }, [country]);

  const loadWorkers = useCallback(async () => {
    const map = globalMapInstance;
    if (!map || !LRef.current) return;
    
    try {
      const { data, error } = await supabase
        .from('worker_locations')
        .select('*, profiles:worker_id(name, photo_url, category, rating, country)')
        .eq('is_online', true)
        .limit(50);

      if (error) throw error;

      const L = LRef.current;
      globalMarkers.forEach(mk => map.removeLayer(mk));
      globalMarkers = [];

      const c = countryRef.current;
      const filtered = (data || []).filter(w => 
        !w.profiles?.country || w.profiles.country === c
      );

      const enriched = filtered.map(w => ({
        ...w,
        distance: userLat ? getDistance(userLat, userLng || 0, w.latitude, w.longitude) : undefined,
        eta: userLat ? getETA(userLat, userLng || 0, w.latitude, w.longitude) : undefined
      })).sort((a, b) => (a.distance || 999) - (b.distance || 999));

      enriched.forEach((worker, i) => {
        const marker = L.circleMarker([worker.latitude, worker.longitude], {
          radius: i === 0 ? 10 : 7,
          color: '#fff',
          fillColor: i === 0 ? '#22c55e' : '#3b82f6',
          fillOpacity: 1,
          weight: 2
        }).addTo(map);

        marker.bindPopup(`<b>${worker.profiles?.name || 'Worker'}</b><br/>${worker.distance || '?'} km`);
        marker.on('click', () => {
          setSelectedWorker(worker);
          onSelectWorker?.(worker);
        });
        globalMarkers.push(marker);
      });

      setWorkers(enriched);
    } catch {}
    setLoading(false);
  }, [userLat, userLng, onSelectWorker]);

  useEffect(() => {
    intervalRef.current = setInterval(loadWorkers, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loadWorkers]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-green-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
          <Navigation size={16} className="text-blue-600" />
          {t('nearWorkers')}
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{workers.length}</span>
        </h3>
        {loading && <span className="text-xs text-gray-400">{t('loading')}</span>}
      </div>
      <div ref={mapRef} className="w-full h-64 lg:h-96 relative bg-gray-100" />
      {selectedWorker && (
        <div className="p-3 border-t bg-white">
          <div className="flex items-start gap-3">
            <img src={selectedWorker.profiles?.photo_url || '/default-avatar.png'} className="w-10 h-10 rounded-full" alt="" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm truncate">{selectedWorker.profiles?.name}</p>
                <button onClick={() => setSelectedWorker(null)} className="text-gray-400"><X size={14} /></button>
              </div>
              <p className="text-xs text-gray-500">{selectedWorker.profiles?.category}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                {selectedWorker.distance && <span>📍 {selectedWorker.distance} {t('km')}</span>}
                {selectedWorker.eta && <span className="text-green-600 font-medium">🕐 {t('eta')}: {selectedWorker.eta} {t('min')}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold">{t('hire')}</button>
            <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">{t('viewProfile')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function getCountryCenter(country: string): { lat: number; lng: number } {
  const centers: Record<string, { lat: number; lng: number }> = {
    qa: { lat: 25.3548, lng: 51.1839 },
    sa: { lat: 24.7136, lng: 46.6753 },
    ae: { lat: 25.2048, lng: 55.2708 },
    kw: { lat: 29.3759, lng: 47.9774 },
    bh: { lat: 26.0667, lng: 50.5577 },
    om: { lat: 23.5880, lng: 58.3829 },
  };
  return centers[country] || centers.qa;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function getETA(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return Math.ceil((getDistance(lat1, lon1, lat2, lon2) / 30) * 60);
}