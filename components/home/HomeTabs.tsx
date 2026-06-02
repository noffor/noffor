// components/home/HomeTabs.tsx
// ⚡ ফাইনাল • মোবাইল ১০০% ফিক্সড • ১ বিলিয়ন ইউজার
"use client";

import React, {
  useState, useEffect, useMemo, useRef,
  lazy, Suspense
} from 'react';
import {
  Crosshair, Wifi, WifiOff, X, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuickHire } from '@/hooks/useQuickHire';

const LiveWorkerMap = lazy(() => import('@/components/map/LiveWorkerMap'));

// ═══════════════════════════════════════════════════
// Props
// ═══════════════════════════════════════════════════
interface Props { country: string; lang: string; }

// ═══════════════════════════════════════════════════
// Default Locations (6 Gulf)
// ═══════════════════════════════════════════════════
const DEFAULT_LOC: Record<string, { lat: number; lng: number }> = {
  qa: { lat: 25.3548, lng: 51.1839 }, sa: { lat: 24.7136, lng: 46.6753 },
  ae: { lat: 25.2048, lng: 55.2708 }, kw: { lat: 29.3759, lng: 47.9774 },
  bh: { lat: 26.0667, lng: 50.5577 }, om: { lat: 23.5880, lng: 58.3829 },
};

// ═══════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════
const T: Record<string, Record<string, string>> = {
  en: {
    quickHire: 'Quick Hire', quickDesc: 'Find workers nearby',
    online: 'Go Online', offline: 'Go Offline', on: 'ON', off: 'OFF',
    findingLocation: 'Locating...', loginRequired: 'Please login first',
    bookingSent: 'Booking sent!', closeMap: 'Close Map',
    error: 'Something went wrong', locating: 'Getting location...',
    retry: 'Retry', locationDenied: 'Location denied',
    noWorker: 'No worker found', success: 'Success!',
  },
  bn: {
    quickHire: 'কুইক হায়ার', quickDesc: 'কাছের শ্রমিক খুঁজুন',
    online: 'অনলাইন হোন', offline: 'অফলাইন হোন', on: 'চালু', off: 'বন্ধ',
    findingLocation: 'খোঁজা হচ্ছে...', loginRequired: 'লগইন করুন',
    bookingSent: 'বুকিং সেন্ট!', closeMap: 'ম্যাপ বন্ধ',
    error: 'কিছু ভুল হয়েছে', locating: 'লোকেশন নিচ্ছে...',
    retry: 'আবার চেষ্টা', locationDenied: 'লোকেশন অনুমতি নাই',
    noWorker: 'কোনো শ্রমিক পাওয়া যায়নি', success: 'সফল!',
  },
  ar: {
    quickHire: 'توظيف سريع', quickDesc: 'ابحث عن عامل قريب',
    online: 'اتصل الآن', offline: 'غير متصل', on: 'مفعل', off: 'معطل',
    findingLocation: 'جاري البحث...', loginRequired: 'يرجى تسجيل الدخول',
    bookingSent: 'تم الإرسال!', closeMap: 'إغلاق',
    error: 'حدث خطأ', locating: 'جاري التحديد...',
    retry: 'إعادة', locationDenied: 'تم رفض الموقع',
    noWorker: 'لا يوجد عامل', success: 'نجاح!',
  },
  hi: {
    quickHire: 'क्विक हायर', quickDesc: 'पास के श्रमिक खोजें',
    online: 'ऑनलाइन हों', offline: 'ऑफलाइन हों', on: 'चालू', off: 'बंद',
    findingLocation: 'खोज रहे...', loginRequired: 'लॉगिन करें',
    bookingSent: 'बुकिंग भेजी!', closeMap: 'बंद करें',
    error: 'कुछ गलत हुआ', locating: 'स्थान ले रहे...',
    retry: 'पुनः प्रयास', locationDenied: 'स्थान अस्वीकृत',
    noWorker: 'कोई श्रमिक नहीं', success: 'सफल!',
  },
};

// ═══════════════════════════════════════════════════
// GPU Toast
// ═══════════════════════════════════════════════════
const toast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
  const el = document.createElement('div');
  const c = { success: '#22c55e', error: '#ef4444', warning: '#eab308' };
  el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 20px;border-radius:999px;font-size:14px;font-weight:600;color:#fff;background:${c[type]};box-shadow:0 4px 16px rgba(0,0,0,.2);opacity:0;transition:opacity .3s;pointer-events:none;`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
};

// ═══════════════════════════════════════════════════
// Memory Cache
// ═══════════════════════════════════════════════════
const cache = new Map<string, { data: { lat: number; lng: number }; ts: number }>();
const CACHE_TTL = 300000;

// ═══════════════════════════════════════════════════
// 🚀 MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function HomeTabs({ country, lang }: Props) {
  const tr = useMemo(() => T[lang] || T.en, [lang]);

  // State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [phone, setPhone] = useState('');
  const [isHiring, setIsHiring] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const onlineState = useRef(false);
  const hiringState = useRef(false);
  const loadingState = useRef(false);
  const showMapState = useRef(false);
  const userLocationState = useRef<{ lat: number; lng: number } | null>(null);
  const phoneState = useRef('');
  const { matchWorker } = useQuickHire();

  // Keep refs in sync
  useEffect(() => { onlineState.current = online; }, [online]);
  useEffect(() => { hiringState.current = isHiring; }, [isHiring]);
  useEffect(() => { loadingState.current = loading; }, [loading]);
  useEffect(() => { showMapState.current = showMap; }, [showMap]);
  useEffect(() => { userLocationState.current = userLocation; }, [userLocation]);
  useEffect(() => { phoneState.current = phone; }, [phone]);

  // ═══════════════════════════════════════════════════
  // Helpers (use refs to avoid stale closures)
  // ═══════════════════════════════════════════════════
  const getLoggedInUser = () => {
    try {
      const user = localStorage.getItem('noffor_user');
      const worker = localStorage.getItem('noffor_worker');
      if (user) return JSON.parse(user);
      if (worker) return JSON.parse(worker);
      return null;
    } catch {
      return null;
    }
  };

  const getLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    const key = `loc:${country}`;

    const mem = cache.get(key);
    if (mem && Date.now() - mem.ts < CACHE_TTL) {
      setUserLocation(mem.data);
      setLocating(false);
      return mem.data;
    }

    try {
      const sc = sessionStorage.getItem(key);
      if (sc) {
        const p = JSON.parse(sc);
        if (Date.now() - p.t < CACHE_TTL) {
          const loc = { lat: p.lat, lng: p.lng };
          cache.set(key, { data: loc, ts: p.t });
          setUserLocation(loc);
          setLocating(false);
          return loc;
        }
      }
    } catch {}

    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000, maximumAge: 300000 })
        );
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        cache.set(key, { data: loc, ts: Date.now() });
        try { sessionStorage.setItem(key, JSON.stringify({ ...loc, t: Date.now() })); } catch {}
        setUserLocation(loc);
        setLocating(false);
        return loc;
      } catch {}
    }

    const fb = DEFAULT_LOC[country] || DEFAULT_LOC.qa;
    setUserLocation(fb);
    setLocating(false);
    return fb;
  };

  // ═══════════════════════════════════════════════════
  // Init
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    try {
      const u = localStorage.getItem('noffor_user');
      if (u) { const p = JSON.parse(u); setPhone(p.phone || p.id || ''); }
    } catch {}
    try {
      const o = localStorage.getItem('noffor_worker_online');
      if (o) setOnline(JSON.parse(o));
    } catch {}
    getLocation();
  }, []);

  // ═══════════════════════════════════════════════════
  // Map outside click/touch → close
  // ═══════════════════════════════════════════════════
  useEffect(() => {
    if (!showMap) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (mapRef.current && !mapRef.current.contains(e.target as Node))
        setShowMap(false);
    };
    document.addEventListener('mousedown', handler, { passive: true });
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [showMap]);

  // ═══════════════════════════════════════════════════
  // 🔘 TOGGLE ONLINE — সরাসরি, ref দিয়ে স্টেল-ফ্রি
  // ═══════════════════════════════════════════════════
  const toggleOnline = async () => {
    if (loadingState.current || lock.current) return;
    lock.current = true;

    const next = !onlineState.current;
    setOnline(next);
    setLoading(true);
    setError(null);

    const loggedInUser = getLoggedInUser();
    if (!loggedInUser) {
      setOnline(false);
      setLoading(false);
      toast(tr.loginRequired, 'warning');
      setTimeout(() => { lock.current = false; }, 500);
      return;
    }

    try {
      localStorage.setItem('noffor_worker_online', JSON.stringify(next));
      const user = localStorage.getItem('noffor_user');
      if (user) {
        const p = JSON.parse(user);
        p.is_online = next;
        localStorage.setItem('noffor_user', JSON.stringify(p));
      }
      const worker = localStorage.getItem('noffor_worker');
      if (worker) {
        const p = JSON.parse(worker);
        p.is_online = next;
        localStorage.setItem('noffor_worker', JSON.stringify(p));
      }
    } catch {}

    toast(next ? tr.on : tr.off, 'success');

    try {
      const id = loggedInUser.id || loggedInUser.phone || phoneState.current;
      if (id) {
        void supabase.from('profiles').upsert(
          { id, is_online: next, last_online: new Date().toISOString() },
          { onConflict: 'id' }
        );
      }
    } catch {}

    setLoading(false);
    setTimeout(() => { lock.current = false; }, 500);
  };

  // ═══════════════════════════════════════════════════
  // 🔍 QUICK HIRE — সরাসরি, ref দিয়ে স্টেল-ফ্রি
  // ═══════════════════════════════════════════════════
  const handleQuickHire = async () => {
    if (hiringState.current || lock.current) return;
    lock.current = true;
    setIsHiring(true);
    setError(null);

    try {
      if (showMapState.current) {
        setShowMap(false);
        setIsHiring(false);
        setTimeout(() => { lock.current = false; }, 500);
        return;
      }

      const loggedInUser = getLoggedInUser();
      const userId = loggedInUser?.id || loggedInUser?.phone || phoneState.current;

      if (!userId) {
        toast(tr.loginRequired, 'warning');
        setIsHiring(false);
        setTimeout(() => { lock.current = false; }, 500);
        return;
      }

      let loc = userLocationState.current;
      if (!loc) {
        setLocating(true);
        loc = await getLocation();
      }

      if (!loc) {
        toast(tr.locationDenied, 'error');
        setIsHiring(false);
        setTimeout(() => { lock.current = false; }, 500);
        return;
      }

      await matchWorker(loc.lat, loc.lng, country, userId);
      setShowMap(true);
      toast(tr.bookingSent, 'success');

    } catch (err: any) {
      console.error('Hire error:', err);
      setError(tr.error);
      toast(tr.error, 'error');
    } finally {
      setIsHiring(false);
      setTimeout(() => { lock.current = false; }, 500);
    }
  };

  // ═══════════════════════════════════════════════════
  // Memoized Styles
  // ═══════════════════════════════════════════════════
  const hireBtn = useMemo(() =>
    `bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl px-3 py-2.5 text-white text-left transition-all active:scale-95 w-full ${isHiring ? 'opacity-50 pointer-events-none' : ''}`,
    [isHiring]
  );

  const onlineBtn = useMemo(() =>
    `rounded-xl px-3 py-2.5 text-left transition-all active:scale-95 w-full ${
      online
        ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white'
        : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
    } ${loading ? 'opacity-50 pointer-events-none' : ''}`,
    [online, loading]
  );

  // ═══════════════════════════════════════════════════
  // Error State
  // ═══════════════════════════════════════════════════
  if (error && !showMap) return (
    <div className="bg-white rounded-xl p-4 text-center border">
      <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
      <p className="text-sm text-red-500 mb-2">{error}</p>
      <button onClick={() => { setError(null); setLocating(true); getLocation(); }}
        className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all inline-flex items-center gap-1.5"
        style={{ minHeight: '44px', touchAction: 'manipulation' }}>
        <RefreshCw size={14} />{tr.retry}
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════
  // 🎨 RENDER — Clean & Mobile Optimized
  // ═══════════════════════════════════════════════════
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {/* Quick Hire */}
        <button 
          type="button"
          onClick={handleQuickHire}
          disabled={isHiring} 
          className={hireBtn}
          style={{ 
            minHeight: '48px',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            cursor: 'pointer',
          }}>
          {isHiring ? <Loader2 size={18} className="mb-1 animate-spin"/> : <Crosshair size={18} className="mb-1"/>}
          <p className="text-sm font-bold" style={{ pointerEvents: 'none' }}>{showMap ? tr.closeMap : tr.quickHire}</p>
          <p className="text-[10px] opacity-80" style={{ pointerEvents: 'none' }}>{showMap ? tr.closeMap : tr.quickDesc}</p>
        </button>

        {/* Online Toggle */}
        <button 
          type="button"
          onClick={toggleOnline}
          disabled={loading} 
          className={onlineBtn}
          style={{ 
            minHeight: '48px',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            cursor: 'pointer',
          }}>
          {loading ? <Loader2 size={18} className="mb-1 animate-spin"/> : online ? <WifiOff size={18} className="mb-1"/> : <Wifi size={18} className="mb-1"/>}
          <p className="text-sm font-bold" style={{ pointerEvents: 'none' }}>{online ? tr.offline : tr.online}</p>
          <div className="flex items-center gap-1 mt-0.5" style={{ pointerEvents: 'none' }}>
            <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`}/>
            <span className="text-[10px] opacity-80">{online ? tr.on : tr.off}</span>
          </div>
        </button>
      </div>

      {/* Map */}
      {showMap && userLocation && (
        <div ref={mapRef}
          className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-fade-in">
          <button 
            type="button"
            onClick={() => setShowMap(false)}
            className="absolute top-2 right-2 z-10 bg-white/95 hover:bg-white rounded-full p-1.5 shadow-md transition active:scale-90 backdrop-blur-sm"
            style={{ touchAction: 'manipulation', minHeight: '36px', minWidth: '36px' }}>
            <X size={16} className="text-gray-600"/>
          </button>
          <Suspense fallback={
            <div className="h-64 bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-gray-400"/>
            </div>
          }>
            <LiveWorkerMap country={country} lang={lang} userLat={userLocation.lat} userLng={userLocation.lng}/>
          </Suspense>
        </div>
      )}

      {/* Locating */}
      {(locating || (showMap && !userLocation)) && (
        <div className="bg-gray-100 rounded-xl p-4 text-center animate-fade-in">
          <Loader2 size={20} className="animate-spin text-green-500 mx-auto mb-2"/>
          <p className="text-xs text-gray-500">{locating ? tr.locating : tr.findingLocation}</p>
        </div>
      )}
    </div>
  );
}