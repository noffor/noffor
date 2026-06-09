// app/[country]/[lang]/page.tsx
// 🚀 BALANCED LAZY LOADING • FAST FCP • LOW MEMORY • is_public FIXED
"use client";
import React, { useState, useEffect, useCallback, useRef, startTransition, lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Crosshair, Wifi, WifiOff, X } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import HeroBanner from '@/components/home/HeroBanner';

const Sidebar = lazy(() => import('@/components/layout/Sidebar'));
const CategoryGrid = lazy(() => import('@/components/home/CategoryGrid'));
const UnifiedList = lazy(() => import('@/components/home/UnifiedList'));
const HomeTabs = lazy(() => import('@/components/home/HomeTabs'));
const LiveWorkerMap = lazy(() => import('@/components/map/LiveWorkerMap'));

const CONFIG = {
  ONLINE_CACHE_KEY: 'noffor_worker_online',
  WORKER_CACHE_KEY: 'noffor_worker',
  LOCATION_CACHE_KEY: 'noffor_user_location',
  LOCATION_CACHE_TTL: 120000,
  GEOLOCATION_TIMEOUT: 5000,
  GPS_MAX_AGE: 60000,
  DEFAULT_LOCATIONS: {
    qa: { lat: 25.2867, lng: 51.5333 },
    ae: { lat: 25.2048, lng: 55.2708 },
    sa: { lat: 24.7136, lng: 46.6753 },
    kw: { lat: 29.3759, lng: 47.9774 },
    bh: { lat: 26.2285, lng: 50.586 },
    om: { lat: 23.588, lng: 58.3829 },
  } as Record<string, { lat: number; lng: number }>,
} as const;

const T: Record<string, Record<string, string>> = {
  en: {
    quick: 'Quick', hire: 'Hire', online: 'Online', offline: 'Offline',
    hideMap: 'Hide Map', loginRequired: 'Please login as a worker first', dismiss: 'Dismiss',
  },
  bn: {
    quick: 'কুইক', hire: 'হায়ার', online: 'অন', offline: 'অফ',
    hideMap: 'ম্যাপ লুকান', loginRequired: 'অনুগ্রহ করে প্রথমে ওয়ার্কার হিসেবে লগইন করুন', dismiss: 'বন্ধ করুন',
  },
  ar: {
    quick: 'سريع', hire: 'توظيف', online: 'متصل', offline: 'غير متصل',
    hideMap: 'إخفاء الخريطة', loginRequired: 'يرجى تسجيل الدخول كعامل أولاً', dismiss: 'إغلاق',
  },
  hi: {
    quick: 'क्विक', hire: 'हायर', online: 'ऑनलाइन', offline: 'ऑफलाइन',
    hideMap: 'मैप छुपाएं', loginRequired: 'कृपया पहले वर्कर के रूप में लॉगिन करें', dismiss: 'खारिज करें',
  },
};

function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return sessionStorage.getItem(key) || localStorage.getItem(key); } catch { return null; }
}

function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem(key, value); localStorage.setItem(key, value); } catch {}
}

const LoginToast = React.memo(({ message, dismiss, onClose }: {
  message: string; dismiss: string; onClose: () => void;
}) => (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slideDown max-w-sm w-[90%]">
    <WifiOff size={18} />
    <span className="text-sm font-medium flex-1">{message}</span>
    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition"><X size={16} /></button>
  </div>
));
LoginToast.displayName = 'LoginToast';

const OnlineToggle = React.memo(({ online, onClick, lang }: { online: boolean; onClick: () => void; lang: string }) => {
  const txt = T[lang] || T.en;
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${online ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'}`}>
      {online ? <WifiOff size={14} /> : <Wifi size={14} />}{online ? txt.offline : txt.online}
      <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
    </button>
  );
});
OnlineToggle.displayName = 'OnlineToggle';

const MapToggle = React.memo(({ showMap, onClick, lang }: { showMap: boolean; onClick: () => void; lang: string }) => {
  const txt = T[lang] || T.en;
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${showMap ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
      <Crosshair size={14} />{showMap ? txt.hideMap : `${txt.quick} ${txt.hire}`}
    </button>
  );
});
MapToggle.displayName = 'MapToggle';

const PCLayout = React.memo(({ country, lang, showMap, userLocation, online, toggleMap, toggleOnline }: {
  country: string; lang: string; showMap: boolean;
  userLocation: { lat: number; lng: number } | null;
  online: boolean; toggleMap: () => void; toggleOnline: () => void;
}) => (
  <div className="hidden lg:block">
    <div className="flex items-center gap-2 mb-3">
      <MapToggle showMap={showMap} onClick={toggleMap} lang={lang} />
      <OnlineToggle online={online} onClick={toggleOnline} lang={lang} />
    </div>
    {showMap && userLocation ? (
      <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-xl" />}>
        <LiveWorkerMap country={country} lang={lang} userLat={userLocation.lat} userLng={userLocation.lng} />
      </Suspense>
    ) : (
      <HeroBanner country={country} lang={lang} />
    )}
    <div className="flex gap-4 mt-4">
      <div className="w-56 shrink-0">
        <Suspense fallback={<div className="w-56 h-96 bg-gray-100 animate-pulse rounded-xl" />}>
          <Sidebar country={country} lang={lang} />
        </Suspense>
      </div>
      <div className="flex-1 min-w-0 space-y-4">
        <div className="bg-white rounded-xl p-4 border">
          <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-xl" />}>
            <UnifiedList type="labor" country={country} lang={lang} />
          </Suspense>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-xl" />}>
            <UnifiedList type="employer" country={country} lang={lang} />
          </Suspense>
        </div>
      </div>
    </div>
  </div>
));
PCLayout.displayName = 'PCLayout';

const MobileLayout = React.memo(({ country, lang }: { country: string; lang: string }) => (
  <div className="lg:hidden">
    <HeroBanner country={country} lang={lang} />
    <div className="mt-3">
      <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-xl" />}>
        <HomeTabs country={country} lang={lang} />
      </Suspense>
    </div>
    <div className="bg-white rounded-xl p-3 border mt-3">
      <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-xl" />}>
        <CategoryGrid country={country} lang={lang} />
      </Suspense>
    </div>
    <div className="bg-white rounded-xl p-3 border mt-3">
      <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-xl" />}>
        <UnifiedList type="labor" country={country} lang={lang} />
      </Suspense>
    </div>
    <div className="bg-white rounded-xl p-3 border mt-3">
      <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-xl" />}>
        <UnifiedList type="employer" country={country} lang={lang} />
      </Suspense>
    </div>
  </div>
));
MobileLayout.displayName = 'MobileLayout';

// ═══════════════════════════════════════════════════════════
// Main HomePage
// ═══════════════════════════════════════════════════════════
function HomePage() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [online, setOnline] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLoginToast, setShowLoginToast] = useState(false);
  
  const alive = useRef(true);
  const loginToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastShownRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') setIsMobile(window.innerWidth < 1024);
  }, []);

  useEffect(() => {
    alive.current = true;
    const savedOnline = getStorageItem(CONFIG.ONLINE_CACHE_KEY);
    if (savedOnline && alive.current) startTransition(() => setOnline(JSON.parse(savedOnline)));
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    const cached = getStorageItem(CONFIG.LOCATION_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.t < CONFIG.LOCATION_CACHE_TTL) {
          startTransition(() => setUserLocation({ lat: parsed.lat, lng: parsed.lng }));
          return;
        }
      } catch {}
    }
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      const defaultLoc = CONFIG.DEFAULT_LOCATIONS[country] || CONFIG.DEFAULT_LOCATIONS.qa;
      startTransition(() => setUserLocation(defaultLoc));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!alive.current) return;
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        startTransition(() => setUserLocation(loc));
        setStorageItem(CONFIG.LOCATION_CACHE_KEY, JSON.stringify({ ...loc, t: Date.now() }));
      },
      () => {
        if (alive.current) {
          const defaultLoc = CONFIG.DEFAULT_LOCATIONS[country] || CONFIG.DEFAULT_LOCATIONS.qa;
          startTransition(() => setUserLocation(defaultLoc));
        }
      },
      { timeout: CONFIG.GEOLOCATION_TIMEOUT, maximumAge: CONFIG.GPS_MAX_AGE, enableHighAccuracy: false }
    );
  }, [country]);

  useEffect(() => {
    return () => { if (loginToastTimerRef.current) clearTimeout(loginToastTimerRef.current); };
  }, []);

  const toggleMap = useCallback(() => startTransition(() => setShowMap(prev => !prev)), []);
  
  // ✅ FIXED: toggleOnline with is_public: true when going online
  const toggleOnline = useCallback(async () => {
    const workerData = getStorageItem(CONFIG.WORKER_CACHE_KEY);
    if (!workerData) {
      if (!toastShownRef.current) {
        toastShownRef.current = true;
        setShowLoginToast(true);
        if (loginToastTimerRef.current) clearTimeout(loginToastTimerRef.current);
        loginToastTimerRef.current = setTimeout(() => { setShowLoginToast(false); toastShownRef.current = false; }, 3000);
      }
      return;
    }
    const nextState = !online;
    startTransition(() => setOnline(nextState));
    setStorageItem(CONFIG.ONLINE_CACHE_KEY, JSON.stringify(nextState));
    try {
      const profile = JSON.parse(workerData);
      // ✅ When going online, set is_public: true
      const updateData: any = { is_online: nextState };
      if (nextState) {
        updateData.is_public = true;
      }
      await supabase.from('profiles').update(updateData).eq('id', profile.id);
    } catch (err) {
      console.error('Toggle online error:', err);
      startTransition(() => setOnline(!nextState));
    }
  }, [online]);

  if (!mounted) return <div className="min-h-screen bg-gray-50" />;

  const isDesktop = !isMobile;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header country={country} lang={lang} />
      
      {showLoginToast && (
        <LoginToast message={T[lang]?.loginRequired || T.en.loginRequired} dismiss={T[lang]?.dismiss || T.en.dismiss} onClose={() => { setShowLoginToast(false); toastShownRef.current = false; }} />
      )}
      
      <main className="max-w-7xl mx-auto px-3 lg:px-4 py-3">
        {isDesktop && (
          <PCLayout country={country} lang={lang} showMap={showMap} userLocation={userLocation} online={online} toggleMap={toggleMap} toggleOnline={toggleOnline} />
        )}
        {!isDesktop && <MobileLayout country={country} lang={lang} />}
      </main>
      
      <MobileNav country={country} lang={lang} />
    </div>
  );
}

export default function HomePageWithErrorBoundary() {
  return (
    <ErrorBoundary lang="en">
      <HomePage />
    </ErrorBoundary>
  );
}