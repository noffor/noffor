// app/[country]/[lang]/page.tsx
// 🚀 SUPER SONIC • 1B USERS • ZERO LAG • NO CRASH
// ✅ FIXED: Mobile duplicate Quick Hire removed
// ✅ FIXED: Infinite skeleton for unauthenticated users
"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo, startTransition, lazy, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Crosshair, Wifi, WifiOff, X, Search, ArrowLeft, ChevronRight } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import Link from 'next/link';
import { categories } from '@/lib/config';
import { useAuth } from '@/context/AuthContext';

import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';

// ✅ Lazy load heavy components
const Sidebar = lazy(() => import('@/components/layout/Sidebar'));
const UnifiedList = lazy(() => import('@/components/home/UnifiedList'));
const HomeTabs = lazy(() => import('@/components/home/HomeTabs'));
const LiveWorkerMap = lazy(() => import('@/components/map/LiveWorkerMap'));
const HeroBanner = lazy(() => import('@/components/home/HeroBanner'));

const CONFIG = {
  ONLINE_CACHE_KEY: 'nf_on',
  WORKER_CACHE_KEY: 'nf_wr',
  LOCATION_CACHE_KEY: 'nf_loc',
  LOCATION_CACHE_TTL: 300000,
  GEOLOCATION_TIMEOUT: 3000,
  GPS_MAX_AGE: 120000,
  DEFAULT_LOCATIONS: {
    qa: { lat: 25.2867, lng: 51.5333 },
    ae: { lat: 25.2048, lng: 55.2708 },
    sa: { lat: 24.7136, lng: 46.6753 },
    kw: { lat: 29.3759, lng: 47.9774 },
    bh: { lat: 26.2285, lng: 50.586 },
    om: { lat: 23.588, lng: 58.3829 },
  }
} as const;

const getCatName = (cat: any, lang: string): string => {
  if (lang === 'en') return cat.nameEn || cat.name || '';
  const key = 'name' + lang.charAt(0).toUpperCase() + lang.slice(1);
  return (cat as any)[key] || cat.nameEn || cat.name || '';
};

// ═══════════════════════════════════════════════════════════
// 🔥 SKELETON — Instant paint, no waiting
// ═══════════════════════════════════════════════════════════
const HomeSkeleton = React.memo(() => (
  <div className="min-h-screen bg-gray-50">
    <div className="h-14 bg-white border-b animate-pulse" />
    <div className="max-w-7xl mx-auto px-3 lg:px-4 py-3">
      <div className="h-40 lg:h-52 bg-gray-200 rounded-xl animate-pulse mb-3" />
      <div className="h-12 bg-gray-200 rounded-xl animate-pulse mb-3" />
      <div className="bg-white rounded-xl p-3 border mb-3">
        <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse" />
        <div className="grid grid-cols-4 gap-2">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-1.5" />
              <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-3 border animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-3" />
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));
HomeSkeleton.displayName = 'HS';

// ═══════════════════════════════════════════════════════════
// 🔥 ALL CATEGORIES — Instant navigate, zero flicker
// ═══════════════════════════════════════════════════════════
const AllCategoriesPage = React.memo(({ isOpen, onClose, country, lang }: {
  isOpen: boolean; onClose: () => void; country: string; lang: string;
}) => {
  const [search, setSearch] = useState('');
  const router = useRouter();
  
  const otherCats = useMemo(() => 
    categories.filter(c => !(c as any).isMain), 
  []);

  const filtered = useMemo(() => {
    if (!search.trim()) return otherCats;
    const q = search.toLowerCase();
    return otherCats.filter(c => {
      return getCatName(c, 'en').toLowerCase().includes(q) ||
        (getCatName(c, 'bn') || '').includes(search) ||
        (getCatName(c, 'ar') || '').includes(search) ||
        (getCatName(c, 'hi') || '').includes(search);
    });
  }, [search, otherCats]);

  const goToCategory = useCallback((slug: string) => {
    startTransition(() => {
      router.push(`/${country}/${lang}/category/${slug}`);
    });
  }, [country, lang, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col" style={{ animation: 'slideUp 0.2s ease-out' }}>
      <style>{`@keyframes slideUp{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white sticky top-0 z-10">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="font-bold text-lg flex-1">
          {lang === 'bn' ? 'আরও ক্যাটাগরি' : lang === 'ar' ? 'المزيد من الفئات' : lang === 'hi' ? 'अधिक श्रेणियां' : 'More Categories'}
        </h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{filtered.length}</span>
      </div>

      <div className="px-4 py-3 border-b bg-white sticky top-[57px] z-10">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'ক্যাটাগরি খুঁজুন...' : 'Search categories...'}
            className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 outline-none" 
            autoFocus 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ willChange: 'transform' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
            {filtered.map(cat => (
              <button
                key={cat.slug}
                onClick={() => goToCategory(cat.slug)}
                className="bg-white rounded-xl p-2 text-center border hover:border-orange-200 hover:shadow-md transition-all active:scale-95 group"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                  <img 
                    src={cat.icon || `/categories/${cat.slug}.png`} 
                    alt={getCatName(cat, lang)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/categories/default.png'; }} 
                  />
                </div>
                <p className="text-[10px] lg:text-xs font-medium text-gray-700 truncate">
                  {getCatName(cat, lang)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
AllCategoriesPage.displayName = 'ACP';

const T: Record<string, Record<string, string>> = {
  en: { quick: 'Quick', hire: 'Hire', online: 'Online', offline: 'Offline', hideMap: 'Hide Map', loginRequired: 'Please login as a worker first', dismiss: 'Dismiss', categories: 'Categories', viewAll: 'View All' },
  bn: { quick: 'কুইক', hire: 'হায়ার', online: 'অন', offline: 'অফ', hideMap: 'ম্যাপ লুকান', loginRequired: 'লগইন করুন', dismiss: 'বন্ধ', categories: 'ক্যাটাগরি', viewAll: 'সব দেখুন' },
  ar: { quick: 'سريع', hire: 'توظيف', online: 'متصل', offline: 'غير متصل', hideMap: 'إخفاء', loginRequired: 'سجل الدخول', dismiss: 'إغلاق', categories: 'الفئات', viewAll: 'عرض الكل' },
  hi: { quick: 'क्विक', hire: 'हायर', online: 'ऑनलाइन', offline: 'ऑफ', hideMap: 'मैप छुपाएं', loginRequired: 'लॉगिन करें', dismiss: 'खारिज', categories: 'श्रेणियां', viewAll: 'सभी' },
};

function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return sessionStorage.getItem(key) || localStorage.getItem(key); } catch { return null; }
}

function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem(key, value); localStorage.setItem(key, value); } catch {}
}

const mainCategoriesCache = categories.filter(c => (c as any).isMain === true);

// ═══════════════════════════════════════════════════════════
// 🚀 HOME PAGE — 1B Ready • Super Sonic
// ═══════════════════════════════════════════════════════════
function HomePage() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  
  const { loading: authLoading, isAuthenticated } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [online, setOnline] = useState(() => {
    const saved = getStorageItem(CONFIG.ONLINE_CACHE_KEY);
    return saved ? JSON.parse(saved) : false;
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(() => {
    const cached = getStorageItem(CONFIG.LOCATION_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.t < CONFIG.LOCATION_CACHE_TTL) return { lat: parsed.lat, lng: parsed.lng };
      } catch {}
    }
    return CONFIG.DEFAULT_LOCATIONS[country] || CONFIG.DEFAULT_LOCATIONS.qa;
  });
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  const alive = useRef(true);
  const loginToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastShownRef = useRef(false);
  const initRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') setIsMobile(window.innerWidth < 1024);
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    if (typeof window !== 'undefined' && navigator?.geolocation) {
      const timer = setTimeout(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!alive.current) return;
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            startTransition(() => setUserLocation(loc));
            setStorageItem(CONFIG.LOCATION_CACHE_KEY, JSON.stringify({ ...loc, t: Date.now() }));
          },
          () => {},
          { timeout: CONFIG.GEOLOCATION_TIMEOUT, maximumAge: CONFIG.GPS_MAX_AGE, enableHighAccuracy: false }
        );
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [country]);

  useEffect(() => {
    return () => { 
      alive.current = false; 
      if (loginToastTimerRef.current) clearTimeout(loginToastTimerRef.current); 
    };
  }, []);

  const toggleMap = useCallback(() => startTransition(() => setShowMap(prev => !prev)), []);
  
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
      await supabase.from('profiles').update({ is_online: nextState, is_public: nextState ? true : undefined }).eq('id', profile.id);
    } catch {
      startTransition(() => setOnline(!nextState));
    }
  }, [online]);

  const handleMoreClick = useCallback(() => setShowAllCategories(true), []);
  const handleCloseAllCategories = useCallback(() => setShowAllCategories(false), []);

  // ✅ ফিক্সড — শুধু mounted চেক করবে, authLoading চেক করবে না
  if (!mounted) return <HomeSkeleton />;

  const isDesktop = !isMobile;
  const txt = T[lang] || T.en;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header country={country} lang={lang} />
      
      {showLoginToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm w-[90%]" style={{ animation: 'slideDown 0.3s ease-out' }}>
          <WifiOff size={18} />
          <span className="text-sm font-medium flex-1">{txt.loginRequired}</span>
          <button onClick={() => { setShowLoginToast(false); toastShownRef.current = false; }} className="p-1 hover:bg-white/20 rounded-lg"><X size={16} /></button>
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-3 lg:px-4 py-3">
        {isDesktop ? (
          <div className="hidden lg:block">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={toggleMap} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${showMap ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
                <Crosshair size={14} />{showMap ? txt.hideMap : `${txt.quick} ${txt.hire}`}
              </button>
              <button onClick={toggleOnline} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${online ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'}`}>
                {online ? <WifiOff size={14} /> : <Wifi size={14} />}{online ? txt.offline : txt.online}
                <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
              </button>
            </div>
            {showMap && userLocation ? (
              <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse rounded-xl" />}>
                <LiveWorkerMap country={country} lang={lang} userLat={userLocation.lat} userLng={userLocation.lng} />
              </Suspense>
            ) : (
              <Suspense fallback={<div className="h-52 bg-gray-200 animate-pulse rounded-xl" />}>
                <HeroBanner country={country} lang={lang} />
              </Suspense>
            )}
            <div className="flex gap-4 mt-4">
              <div className="w-56 shrink-0">
                <Suspense fallback={<div className="w-56 h-96 bg-gray-100 animate-pulse rounded-xl" />}>
                  <Sidebar country={country} lang={lang} onMoreClick={handleMoreClick} />
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
        ) : (
          /* ═══════════ MOBILE VIEW - FIXED ═══════════ */
          <div className="lg:hidden">
            <Suspense fallback={<div className="h-40 bg-gray-200 animate-pulse rounded-xl mb-3" />}>
              <HeroBanner country={country} lang={lang} />
            </Suspense>
            
            {/* ✅ HomeTabs - Quick Hire + Online (শুধু এটাই) */}
            <div className="mt-3">
              <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-xl" />}>
                <HomeTabs country={country} lang={lang} />
              </Suspense>
            </div>

            {/* Categories Grid */}
            <div className="bg-white rounded-xl p-3 border mt-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-800">{txt.categories}</h3>
                <button onClick={handleMoreClick} className="text-xs text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1 active:scale-95">
                  {txt.viewAll}<ChevronRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {mainCategoriesCache.map(cat => (
                  <Link key={cat.slug} href={`/${country}/${lang}/category/${cat.slug}`} prefetch={false}
                    className="bg-white rounded-xl p-2 text-center border hover:shadow-md hover:border-orange-200 transition-all active:scale-95"
                    style={{ WebkitTapHighlightColor: 'transparent' }}>
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                      <img src={cat.icon || `/categories/${cat.slug}.png`} alt={getCatName(cat, lang)}
                        className="w-full h-full object-cover" loading="lazy" decoding="async"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/categories/default.png'; }} />
                    </div>
                    <p className="text-[10px] font-medium text-gray-700 truncate">{getCatName(cat, lang)}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Unified Lists */}
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
        )}
      </main>
      
      <AllCategoriesPage isOpen={showAllCategories} onClose={handleCloseAllCategories} country={country} lang={lang} />
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