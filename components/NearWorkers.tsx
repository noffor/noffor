// components/NearWorkers.tsx
"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef, startTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { Navigation, MapPin, Clock, DollarSign, UserPlus, Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import { Worker, UserLocation } from '@/types';

// ═══════════════════════════════════════════════════════════
// স্ট্যাটিক ট্রান্সলেশন (Module-level - zero re-create)
// ═══════════════════════════════════════════════════════════
const T: Record<string, Record<string, string>> = {
  en: { title: 'Nearby Workers', kmAway: 'km away', eta: 'ETA', mins: 'mins', hire: 'Hire', online: 'Online', noWorkers: 'No workers available nearby', retry: 'Retry', error: 'Failed to load', negotiable: 'Negotiable' },
  bn: { title: 'কাছাকাছি শ্রমিক', kmAway: 'কিমি দূরে', eta: 'পৌঁছাতে সময়', mins: 'মিনিট', hire: 'নিয়োগ', online: 'অনলাইন', noWorkers: 'কাছাকাছি কোনো শ্রমিক নেই', retry: 'আবার চেষ্টা', error: 'লোড করতে ব্যর্থ', negotiable: 'আলোচনা সাপেক্ষ' },
  ar: { title: 'عمال قريب', kmAway: 'كم', eta: 'الوقت المتوقع', mins: 'دقيقة', hire: 'استأجر', online: 'متصل', noWorkers: 'لا يوجد عمال قريب', retry: 'إعادة', error: 'فشل التحميل', negotiable: 'قابل للتفاوض' },
  hi: { title: 'पास के श्रमिक', kmAway: 'किमी दूर', eta: 'अनुमानित समय', mins: 'मिनट', hire: 'किराया', online: 'ऑनलाइन', noWorkers: 'पास में कोई श्रमिक नहीं', retry: 'पुनः प्रयास', error: 'लोड विफल', negotiable: 'बातचीत योग्य' }
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  MAX_DISTANCE_KM: 10,
  ONLINE_THRESHOLD_MIN: 5,
  AVG_SPEED_KMPH: 20,
  CACHE_TTL: 30000,
  MAX_RETRY: 2,
  BATCH_SIZE: 10,
};

// ═══════════════════════════════════════════════════════════
// ইউটিলিটি (Module-level - pure functions)
// ═══════════════════════════════════════════════════════════
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return Math.round((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 10) / 10;
}

function getETA(distanceKm: number): number {
  return Math.ceil((distanceKm / CONFIG.AVG_SPEED_KMPH) * 60);
}

// ═══════════════════════════════════════════════════════════
// গ্লোবাল ক্যাশে
// ═══════════════════════════════════════════════════════════
const locationCache = new Map<string, { data: any; timestamp: number }>();

// ═══════════════════════════════════════════════════════════
// ওয়ার্কার কার্ড (Memoized)
// ═══════════════════════════════════════════════════════════
const WorkerCard = React.memo(({ worker, tr, onBook }: { worker: any; tr: Record<string, string>; onBook: (w: Worker) => void }) => (
  <div className="bg-white rounded-xl border p-3 hover:shadow-md transition-all duration-200 group will-change-transform active:scale-[0.99]">
    <div className="flex gap-3 items-center">
      <img 
        src={worker.photo_url || '/avatar.png'} 
        alt={worker.name}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0 bg-gray-100"
        loading="lazy"
        decoding="async"
        onError={(e) => { (e.target as HTMLImageElement).src = '/avatar.png'; }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm sm:text-base truncate">{worker.name}</h3>
          <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {tr.online}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{worker.category}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] sm:text-xs text-gray-500">
          <span className="flex items-center gap-1"><MapPin size={10} /> {worker.distance} {tr.kmAway}</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {worker.eta} {tr.mins}</span>
          <span className="flex items-center gap-1"><DollarSign size={10} /> {worker.expected_salary || tr.negotiable}</span>
        </div>
      </div>
      <button 
        onClick={() => onBook(worker)} 
        className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1 hover:bg-green-700 active:bg-green-800 active:scale-95 transition-all flex-shrink-0"
      >
        <UserPlus size={14} /> {tr.hire}
      </button>
    </div>
  </div>
));
WorkerCard.displayName = 'WorkerCard';

// ═══════════════════════════════════════════════════════════
// স্কেলেটন
// ═══════════════════════════════════════════════════════════
const SkeletonList = React.memo(() => (
  <div className="space-y-2">
    {[1,2,3].map(i => (
      <div key={i} className="bg-white rounded-xl border p-3 animate-pulse">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="flex gap-3">
              <div className="h-3 bg-gray-100 rounded w-16" />
              <div className="h-3 bg-gray-100 rounded w-12" />
            </div>
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
));
SkeletonList.displayName = 'SkeletonList';

// ═══════════════════════════════════════════════════════════
// এরর + এম্পটি
// ═══════════════════════════════════════════════════════════
const EmptyState = React.memo(({ msg, retry, onRetry }: { msg: string; retry?: string; onRetry?: () => void }) => (
  <div className="text-center py-8 bg-white rounded-xl border">
    <Navigation size={32} className="text-gray-200 mx-auto mb-2" />
    <p className="text-gray-400 text-sm">{msg}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 active:scale-95 transition-all inline-flex items-center gap-1">
        <RefreshCw size={12} /> {retry}
      </button>
    )}
  </div>
));
EmptyState.displayName = 'EmptyState';

// ═══════════════════════════════════════════════════════════
// মেইন NearWorkers (Supersonic)
// ═══════════════════════════════════════════════════════════
interface NearWorkersProps {
  country: string;
  lang: string;
  userLocation: UserLocation;
  onBook: (worker: Worker) => void;
  category?: string;
}

export default function NearWorkers({ country, lang, userLocation, onBook, category = 'all' }: NearWorkersProps) {
  const tr = useMemo(() => T[lang] || T.en, [lang]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const alive = useRef(true);
  const retryRef = useRef(0);

  // ═══════════════════════════════════════════════════════
  // Load Workers (Cache-first + Distance calc)
  // ═══════════════════════════════════════════════════════
  const loadWorkers = useCallback(async (force = false) => {
    if (!alive.current || !userLocation) return;
    
    const cKey = `nw:${country}:${category}`;
    
    // Cache check
    if (!force) {
      const cached = locationCache.get(cKey);
      if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
        startTransition(() => { setWorkers(cached.data); setLoading(false); });
        return;
      }
    }

    setLoading(true);
    setError(false);

    try {
      const { data: locations, error: e } = await supabase
        .from('worker_locations')
        .select('*, profiles!inner(*)')
        .eq('is_online', true)
        .gte('last_seen', new Date(Date.now() - CONFIG.ONLINE_THRESHOLD_MIN * 60000).toISOString());

      if (e) throw e;

      if (!alive.current) return;

      // Process + Filter + Sort (single pass)
      const processed = (locations || [])
        .reduce((acc: any[], w: any) => {
          if (category !== 'all' && w.profiles?.category !== category) return acc;
          
          const dist = getDistance(userLocation.lat, userLocation.lng, w.latitude, w.longitude);
          if (dist > CONFIG.MAX_DISTANCE_KM) return acc;
          
          acc.push({
            ...w,
            ...w.profiles,
            worker_id: w.worker_id,
            distance: dist,
            eta: getETA(dist)
          });
          return acc;
        }, [])
        .sort((a, b) => a.distance - b.distance)
        .slice(0, CONFIG.BATCH_SIZE);

      // Cache
      locationCache.set(cKey, { data: processed, timestamp: Date.now() });

      startTransition(() => {
        setWorkers(processed);
        setLoading(false);
      });
      
      retryRef.current = 0;
    } catch (err) {
      if (!alive.current) return;
      
      if (retryRef.current < CONFIG.MAX_RETRY) {
        retryRef.current++;
        setTimeout(() => loadWorkers(true), 1000 * retryRef.current);
      } else {
        startTransition(() => { setError(true); setLoading(false); });
      }
    }
  }, [userLocation, country, category]);

  // ═══════════════════════════════════════════════════════
  // Initial Load
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    alive.current = true;
    if (userLocation) loadWorkers();
    return () => { alive.current = false; };
  }, [loadWorkers]);

  // ═══════════════════════════════════════════════════════
  // Retry handler
  // ═══════════════════════════════════════════════════════
  const handleRetry = useCallback(() => {
    retryRef.current = 0;
    loadWorkers(true);
  }, [loadWorkers]);

  // ═══════════════════════════════════════════════════════
  // Book handler (memoized)
  // ═══════════════════════════════════════════════════════
  const handleBook = useCallback((worker: Worker) => {
    startTransition(() => onBook(worker));
  }, [onBook]);

  // ═══════════════════════════════════════════════════════
  // Memoized list
  // ═══════════════════════════════════════════════════════
  const workerList = useMemo(() => 
    workers.map(w => (
      <WorkerCard key={w.worker_id} worker={w} tr={tr} onBook={handleBook} />
    )), 
    [workers, tr, handleBook]
  );

  // ═══════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════
  if (loading) return <SkeletonList />;
  if (error) return <EmptyState msg={tr.error} retry={tr.retry} onRetry={handleRetry} />;
  if (workers.length === 0) return <EmptyState msg={tr.noWorkers} />;

  return (
    <div className="space-y-2 sm:space-y-3" style={{ contain: 'layout style paint' }}>
      <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 select-none">
        <Navigation size={18} className="text-green-600" /> 
        {tr.title} <span className="text-sm text-gray-400 font-normal">({workers.length})</span>
      </h2>
      {workerList}
    </div>
  );
}