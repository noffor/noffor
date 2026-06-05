// components/booking/LiveTracker.tsx - ১ বিলিয়ন ইউজার • CTO Approved
"use client";
import React, { useEffect, useState, useRef, useCallback, useMemo, startTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { Navigation, Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T: Record<string, Record<string, string>> = {
  en: {
    arriving: 'Worker is arriving', eta: 'ETA', min: 'min',
    distance: 'Distance', km: 'km', tracking: 'Live Tracking',
    noLocation: 'Waiting for location...', error: 'Tracking unavailable',
  },
  bn: {
    arriving: 'শ্রমিক আসছেন', eta: 'সময়', min: 'মিনিট',
    distance: 'দূরত্ব', km: 'কিমি', tracking: 'লাইভ ট্র্যাকিং',
    noLocation: 'লোকেশনের জন্য অপেক্ষা...', error: 'ট্র্যাকিং অনুপলব্ধ',
  },
  ar: {
    arriving: 'العامل في الطريق', eta: 'الوقت', min: 'دقيقة',
    distance: 'المسافة', km: 'كم', tracking: 'تتبع مباشر',
    noLocation: 'في انتظار الموقع...', error: 'التتبع غير متاح',
  },
  hi: {
    arriving: 'श्रमिक आ रहे हैं', eta: 'समय', min: 'मिनट',
    distance: 'दूरी', km: 'किमी', tracking: 'लाइव ट्रैकिंग',
    noLocation: 'स्थान की प्रतीक्षा...', error: 'ट्रैकिंग अनुपलब्ध',
  },
};

// ═══════════════════════════════════════════════════════════
// কনফিগ
// ═══════════════════════════════════════════════════════════
const CONFIG = {
  REFRESH_INTERVAL: 5000,
  RETRY_MAX: 3,
  RETRY_DELAY: 1000,
  AVG_SPEED_KMPH: 30,
  GPS_TIMEOUT: 5000,
  GPS_MAX_AGE: 60000,
};

// ═══════════════════════════════════════════════════════════
// Pure Functions
// ═══════════════════════════════════════════════════════════
function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(lat1 * Math.PI / 180) * 
            Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function calcETA(dist: number): number {
  return Math.ceil((dist / CONFIG.AVG_SPEED_KMPH) * 60);
}

// ═══════════════════════════════════════════════════════════
// টাইপস
// ═══════════════════════════════════════════════════════════
interface Position {
  lat: number;
  lng: number;
}

interface Props {
  bookingId: string;
  workerId: string;
  lang: string;
}

// ═══════════════════════════════════════════════════════════
// LiveTracker (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
const LiveTracker = React.memo(({ bookingId, workerId, lang }: Props) => {
  const tr = useMemo(() => T[lang] || T.en, [lang]);
  
  const [workerPos, setWorkerPos] = useState<Position | null>(null);
  const [userPos, setUserPos] = useState<Position | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [eta, setEta] = useState<number>(0);
  const [error, setError] = useState(false);
  
  // 🔒 Refs (React 19 compatible)
  const aliveRef = useRef(true);
  const retryRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userPosRef = useRef<Position | null>(null); // ✅ Stale closure fix

  // ═══════ GPS Watcher ═══════
  useEffect(() => {
    aliveRef.current = true;

    // ✅ SSR safe
    if (typeof window === 'undefined' || !navigator?.geolocation) return;

    // ✅ watchPosition for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!aliveRef.current) return;
        const newPos = { 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude 
        };
        userPosRef.current = newPos;
        startTransition(() => setUserPos(newPos));
      },
      () => {
        // Silent fail - GPS unavailable
      },
      {
        timeout: CONFIG.GPS_TIMEOUT,
        maximumAge: CONFIG.GPS_MAX_AGE,
        enableHighAccuracy: false, // Battery save
      }
    );

    // Initial position (faster)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!aliveRef.current) return;
        const newPos = { 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude 
        };
        userPosRef.current = newPos;
        startTransition(() => setUserPos(newPos));
      },
      () => {},
      { timeout: CONFIG.GPS_TIMEOUT, maximumAge: CONFIG.GPS_MAX_AGE }
    );

    return () => {
      aliveRef.current = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // ═══════ Worker Tracker ═══════
  const trackWorker = useCallback(async () => {
    if (!aliveRef.current) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('worker_locations')
        .select('latitude, longitude')
        .eq('worker_id', workerId)
        .single();

      if (fetchError) throw fetchError;
      if (!aliveRef.current) return;

      if (data?.latitude) {
        const pos: Position = { lat: data.latitude, lng: data.longitude };
        const currentUserPos = userPosRef.current; // ✅ Ref avoids stale closure
        
        startTransition(() => {
          setWorkerPos(pos);
          setError(false);
          
          if (currentUserPos) {
            const dist = calcDistance(
              currentUserPos.lat, currentUserPos.lng, 
              pos.lat, pos.lng
            );
            setDistance(dist);
            setEta(calcETA(dist));
          }
        });
        
        retryRef.current = 0;
      }
    } catch (err) {
      if (!aliveRef.current) return;
      
      if (retryRef.current < CONFIG.RETRY_MAX) {
        retryRef.current++;
      } else {
        startTransition(() => setError(true));
      }
    }
  }, [workerId]); // ✅ শুধু workerId dependency (userPos ref দিয়ে)

  // ═══════ Interval Setup ═══════
  useEffect(() => {
    aliveRef.current = true;
    retryRef.current = 0;

    // Immediate first fetch
    trackWorker();

    // ✅ Stable interval (trackWorker changes handled inside)
    intervalRef.current = setInterval(() => {
      trackWorker();
    }, CONFIG.REFRESH_INTERVAL);

    return () => {
      aliveRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // ✅ Empty deps = runs once, stable interval

  // ═══════ Render ═══════
  return (
    <div 
      className="bg-white rounded-xl p-3 border border-gray-100"
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Navigation 
          size={16} 
          className={error ? 'text-gray-400' : 'text-green-600 animate-pulse'} 
        />
        <p className="text-sm font-bold text-gray-800">{tr.tracking}</p>
      </div>

      {/* States */}
      {error ? (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {tr.error}
        </p>
      ) : !workerPos ? (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Loader2 size={12} className="animate-spin" />
          {tr.noLocation}
        </p>
      ) : (
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {tr.distance}: <b className="text-gray-800">{distance}</b> {tr.km}
          </span>
          <span className="flex items-center gap-1 font-bold text-green-600">
            <Clock size={12} />
            {tr.eta}: <b>{eta}</b> {tr.min}
          </span>
        </div>
      )}
    </div>
  );
});

LiveTracker.displayName = 'LiveTracker';

export default LiveTracker;