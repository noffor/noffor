// app/[country]/[lang]/page.tsx
// 🚀 SUPER SONIC • 42 CATEGORIES • PNG IMAGES • FULL PAGE MORE • COMPLETE
"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo, startTransition, lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Crosshair, Wifi, WifiOff, X, Search, ArrowLeft, ChevronRight } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import Link from 'next/link';
import { categories } from '@/lib/config';

import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import HeroBanner from '@/components/home/HeroBanner';

const Sidebar = lazy(() => import('@/components/layout/Sidebar'));
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

// ═══════════════════════════════════════════════════════════
// Helper: Get category name by language
// ═══════════════════════════════════════════════════════════
const getCatName = (cat: any, lang: string): string => {
  const key = `name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof typeof cat;
  return (cat as any)[key] || cat.nameEn || cat.name || '';
};

// ═══════════════════════════════════════════════════════════
// All Categories — FULL PAGE (Mobile: 3 cols, PC: 6 cols)
// ═══════════════════════════════════════════════════════════
const AllCategoriesPage = React.memo(({ isOpen, onClose, country, lang }: {
  isOpen: boolean; onClose: () => void; country: string; lang: string;
}) => {
  const [search, setSearch] = useState('');
  
  const allCats = useMemo(() => categories, []);
  
  const mainCats = useMemo(() => allCats.filter(c => (c as any).isMain === true), [allCats]);
  const otherCats = useMemo(() => allCats.filter(c => (c as any).isMain !== true), [allCats]);

  const filtered = search.trim()
    ? allCats.filter(c => {
        const name = getCatName(c, 'en').toLowerCase();
        const nameBn = getCatName(c, 'bn');
        const nameAr = getCatName(c, 'ar');
        const nameHi = getCatName(c, 'hi');
        const q = search.toLowerCase();
        return name.includes(q) || nameBn?.includes(search) || nameAr?.includes(search) || nameHi?.includes(search);
      })
    : allCats;

  const filteredMain = useMemo(() => filtered.filter(c => (c as any).isMain === true), [filtered]);
  const filteredOther = useMemo(() => filtered.filter(c => (c as any).isMain !== true), [filtered]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white sticky top-0 z-10">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="font-bold text-lg flex-1">
          {lang === 'bn' ? 'সব ক্যাটাগরি' : lang === 'ar' ? 'جميع الفئات' : lang === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}
        </h2>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b bg-white sticky top-[57px] z-10">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'ক্যাটাগরি খুঁজুন...' : lang === 'ar' ? 'ابحث عن فئة...' : lang === 'hi' ? 'श्रेणी खोजें...' : 'Search all 42 categories...'}
            className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
            autoFocus
          />
        </div>
      </div>

      {/* Scrollable Grid — ✅ Mobile: 3 cols, PC: 6 cols */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {lang === 'bn' ? 'কোনো ক্যাটাগরি পাওয়া যায়নি' : lang === 'ar' ? 'لا توجد فئات' : lang === 'hi' ? 'कोई श्रेणी नहीं मिली' : 'No categories found'}
            </p>
          </div>
        ) : (
          <>
            {/* Main Categories */}
            {filteredMain.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                  {lang === 'bn' ? 'প্রধান ক্যাটাগরি' : lang === 'ar' ? 'الفئات الرئيسية' : lang === 'hi' ? 'मुख्य श्रेणियां' : 'Main Categories'}
                </h3>
                {/* ✅ 3 cols on mobile, 6 cols on PC */}
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                  {filteredMain.map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/${country}/${lang}/category/${cat.slug}`}
                      onClick={onClose}
                      className="bg-white rounded-xl p-2 text-center border-2 border-orange-100 hover:border-orange-300 hover:shadow-md transition-all active:scale-95"
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                        <img
                          src={cat.icon || `/categories/${cat.slug}.png`}
                          alt={getCatName(cat, lang)}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/categories/default.png'; }}
                        />
                      </div>
                      <p className="text-[10px] lg:text-xs font-medium text-gray-700 truncate">{getCatName(cat, lang)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Other Categories */}
            {filteredOther.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                  {lang === 'bn' ? 'অন্যান্য ক্যাটাগরি' : lang === 'ar' ? 'فئات أخرى' : lang === 'hi' ? 'अन्य श्रेणियां' : 'Other Categories'}
                </h3>
                {/* ✅ 3 cols on mobile, 6 cols on PC */}
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                  {filteredOther.map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/${country}/${lang}/category/${cat.slug}`}
                      onClick={onClose}
                      className="bg-gray-50 rounded-xl p-2 text-center border hover:border-gray-300 hover:shadow-md transition-all active:scale-95"
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                        <img
                          src={cat.icon || `/categories/${cat.slug}.png`}
                          alt={getCatName(cat, lang)}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/categories/default.png'; }}
                        />
                      </div>
                      <p className="text-[10px] lg:text-xs font-medium text-gray-700 truncate">{getCatName(cat, lang)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});
AllCategoriesPage.displayName = 'AllCategoriesPage';

// ═══════════════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════════════
const T: Record<string, Record<string, string>> = {
  en: { quick: 'Quick', hire: 'Hire', online: 'Online', offline: 'Offline', hideMap: 'Hide Map', loginRequired: 'Please login as a worker first', dismiss: 'Dismiss' },
  bn: { quick: 'কুইক', hire: 'হায়ার', online: 'অন', offline: 'অফ', hideMap: 'ম্যাপ লুকান', loginRequired: 'অনুগ্রহ করে প্রথমে ওয়ার্কার হিসেবে লগইন করুন', dismiss: 'বন্ধ করুন' },
  ar: { quick: 'سريع', hire: 'توظيف', online: 'متصل', offline: 'غير متصل', hideMap: 'إخفاء الخريطة', loginRequired: 'يرجى تسجيل الدخول كعامل أولاً', dismiss: 'إغلاق' },
  hi: { quick: 'क्विक', hire: 'हायर', online: 'ऑनलाइन', offline: 'ऑफलाइन', hideMap: 'मैप छुपाएं', loginRequired: 'कृपया पहले वर्कर के रूप में लॉगिन करें', dismiss: 'खारिज करें' },
};

function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return sessionStorage.getItem(key) || localStorage.getItem(key); } catch { return null; }
}

function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem(key, value); localStorage.setItem(key, value); } catch {}
}

const LoginToast = React.memo(({ message, dismiss, onClose }: { message: string; dismiss: string; onClose: () => void }) => (
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

// ═══════════════════════════════════════════════════════════
// PC Layout — ✅ Sidebar with onMoreClick + NO Category Grid
// ═══════════════════════════════════════════════════════════
const PCLayout = React.memo(({ country, lang, showMap, userLocation, online, toggleMap, toggleOnline, onMoreClick }: {
  country: string; lang: string; showMap: boolean;
  userLocation: { lat: number; lng: number } | null;
  online: boolean; toggleMap: () => void; toggleOnline: () => void; onMoreClick: () => void;
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
      {/* ✅ Sidebar — ১২ মেইন + "More 30+" বাটন */}
      <div className="w-56 shrink-0">
        <Suspense fallback={<div className="w-56 h-96 bg-gray-100 animate-pulse rounded-xl" />}>
          <Sidebar country={country} lang={lang} onMoreClick={onMoreClick} />
        </Suspense>
      </div>
      {/* ✅ UnifiedList only — কোনো Category Grid নেই */}
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

// ═══════════════════════════════════════════════════════════
// Mobile Layout — ✅ Categories from config.ts
// ═══════════════════════════════════════════════════════════
const MobileLayout = React.memo(({ country, lang, onMoreClick }: { country: string; lang: string; onMoreClick: () => void }) => {
  const mainCategories = useMemo(() => categories.slice(0, 12), []);
  
  return (
    <div className="lg:hidden">
      <HeroBanner country={country} lang={lang} />
      <div className="mt-3">
        <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-xl" />}>
          <HomeTabs country={country} lang={lang} />
        </Suspense>
      </div>
      
      {/* ✅ Categories from config.ts */}
      <div className="bg-white rounded-xl p-3 border mt-3">
        <h3 className="text-sm font-bold text-gray-800 mb-2">
          {lang === 'bn' ? 'ক্যাটাগরি' : lang === 'ar' ? 'الفئات' : lang === 'hi' ? 'श्रेणियां' : 'Categories'}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {mainCategories.map(cat => (
            <Link key={cat.slug} href={`/${country}/${lang}/category/${cat.slug}`}
              className="bg-white rounded-xl p-2 text-center border hover:shadow-md transition-all active:scale-95">
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                <img src={cat.icon || `/categories/${cat.slug}.png`} alt={getCatName(cat, lang)}
                  className="w-full h-full object-cover" loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/categories/default.png'; }} />
              </div>
              <p className="text-[10px] font-medium text-gray-700 truncate">{getCatName(cat, lang)}</p>
            </Link>
          ))}
          <button onClick={onMoreClick}
            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-2 text-center border border-orange-200">
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-orange-100 mb-1.5 flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-[10px] font-medium text-orange-600">
              {lang === 'bn' ? 'আরও' : lang === 'ar' ? 'المزيد' : lang === 'hi' ? 'और' : 'More'}
            </p>
          </button>
        </div>
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
  );
});
MobileLayout.displayName = 'MobileLayout';

// ═══════════════════════════════════════════════════════════
// MAIN HOMEPAGE
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
  const [showAllCategories, setShowAllCategories] = useState(false);
  
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
      const updateData: any = { is_online: nextState };
      if (nextState) { updateData.is_public = true; }
      await supabase.from('profiles').update(updateData).eq('id', profile.id);
    } catch (err) {
      console.error('Toggle online error:', err);
      startTransition(() => setOnline(!nextState));
    }
  }, [online]);

  const handleMoreClick = useCallback(() => setShowAllCategories(true), []);
  const handleCloseAllCategories = useCallback(() => setShowAllCategories(false), []);

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
          <PCLayout country={country} lang={lang} showMap={showMap} userLocation={userLocation} online={online} toggleMap={toggleMap} toggleOnline={toggleOnline} onMoreClick={handleMoreClick} />
        )}
        {!isDesktop && <MobileLayout country={country} lang={lang} onMoreClick={handleMoreClick} />}
      </main>
      
      {/* ✅ All Categories — FULL PAGE: Mobile 3 cols, PC 6 cols */}
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