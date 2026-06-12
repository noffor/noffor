// app/[country]/[lang]/page.tsx
// 🚀 SUPER SONIC • 42 CATEGORIES • MAIN 12 + OTHER 30 • FAST FCP
"use client";
import React, { useState, useEffect, useCallback, useRef, startTransition, lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Crosshair, Wifi, WifiOff, X, Grid3X3, ChevronRight, Search } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import Link from 'next/link';

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
// ৪২ ক্যাটাগরি — Main ১২ + Other ৩০
// ═══════════════════════════════════════════════════════════
const MAIN_CATEGORIES = [
  { slug: 'driver', name: 'Driver', icon: '🚗', nameBn: 'ড্রাইভার', nameAr: 'سائق', nameHi: 'ड्राइवर' },
  { slug: 'electrician', name: 'Electrician', icon: '⚡', nameBn: 'ইলেকট্রিশিয়ান', nameAr: 'كهربائي', nameHi: 'इलेक्ट्रीशियन' },
  { slug: 'plumber', name: 'Plumber', icon: '🔧', nameBn: 'প্লাম্বার', nameAr: 'سباك', nameHi: 'प्लंबर' },
  { slug: 'mason', name: 'Mason', icon: '🧱', nameBn: 'মিস্ত্রি', nameAr: 'بناء', nameHi: 'मिस्त्री' },
  { slug: 'ac-technician', name: 'AC Technician', icon: '❄️', nameBn: 'এসি টেকনিশিয়ান', nameAr: 'فني تكييف', nameHi: 'AC तकनीशियन' },
  { slug: 'painter', name: 'Painter', icon: '🎨', nameBn: 'পেইন্টার', nameAr: 'دهان', nameHi: 'पेंटर' },
  { slug: 'carpenter', name: 'Carpenter', icon: '🪚', nameBn: 'কার্পেন্টার', nameAr: 'نجار', nameHi: 'कारपेंटर' },
  { slug: 'welder', name: 'Welder', icon: '🔥', nameBn: 'ওয়েল্ডার', nameAr: 'لحام', nameHi: 'वेल्डर' },
  { slug: 'cleaner', name: 'Cleaner', icon: '🧹', nameBn: 'ক্লিনার', nameAr: 'عامل نظافة', nameHi: 'क्लीनर' },
  { slug: 'cook', name: 'Cook', icon: '🍳', nameBn: 'রাঁধুনি', nameAr: 'طباخ', nameHi: 'रसोइया' },
  { slug: 'helper', name: 'Helper', icon: '💪', nameBn: 'হেলপার', nameAr: 'مساعد', nameHi: 'हेल्पर' },
  { slug: 'gardener', name: 'Gardener', icon: '🌿', nameBn: 'মালী', nameAr: 'بستاني', nameHi: 'माली' },
];

const OTHER_CATEGORIES = [
  { slug: 'housemaid', name: 'Housemaid', icon: '🏠', nameBn: 'গৃহকর্মী', nameAr: 'خادمة', nameHi: 'हाउसमेड' },
  { slug: 'nanny', name: 'Nanny', icon: '👶', nameBn: 'আয়া', nameAr: 'مربية', nameHi: 'नैनी' },
  { slug: 'office-assistant', name: 'Office Assistant', icon: '💼', nameBn: 'অফিস সহকারী', nameAr: 'مساعد مكتبي', nameHi: 'ऑफिस असिस्टेंट' },
  { slug: 'receptionist', name: 'Receptionist', icon: '📞', nameBn: 'রিসেপশনিস্ট', nameAr: 'موظف استقبال', nameHi: 'रिसेप्शनिस्ट' },
  { slug: 'salesman', name: 'Salesman', icon: '💵', nameBn: 'সেলসম্যান', nameAr: 'بائع', nameHi: 'सेल्समैन' },
  { slug: 'cashier', name: 'Cashier', icon: '💳', nameBn: 'ক্যাশিয়ার', nameAr: 'كاشير', nameHi: 'कैशियर' },
  { slug: 'security-guard', name: 'Security Guard', icon: '🛡️', nameBn: 'সিকিউরিটি গার্ড', nameAr: 'حارس أمن', nameHi: 'सिक्योरिटी गार्ड' },
  { slug: 'nurse', name: 'Nurse', icon: '💉', nameBn: 'নার্স', nameAr: 'ممرض', nameHi: 'नर्स' },
  { slug: 'pharmacist', name: 'Pharmacist', icon: '💊', nameBn: 'ফার্মাসিস্ট', nameAr: 'صيدلي', nameHi: 'फार्मासिस्ट' },
  { slug: 'lab-technician', name: 'Lab Technician', icon: '🔬', nameBn: 'ল্যাব টেকনিশিয়ান', nameAr: 'فني مختبر', nameHi: 'लैब तकनीशियन' },
  { slug: 'physiotherapist', name: 'Physiotherapist', icon: '🦴', nameBn: 'ফিজিওথেরাপিস্ট', nameAr: 'معالج طبيعي', nameHi: 'फिजियोथेरेपिस्ट' },
  { slug: 'mechanic', name: 'Mechanic', icon: '🔩', nameBn: 'মেকানিক', nameAr: 'ميكانيكي', nameHi: 'मैकेनिक' },
  { slug: 'tailor', name: 'Tailor', icon: '🧵', nameBn: 'দর্জি', nameAr: 'خياط', nameHi: 'दर्जी' },
  { slug: 'barista', name: 'Barista', icon: '☕', nameBn: 'বারিস্তা', nameAr: 'باريستا', nameHi: 'बरिस्ता' },
  { slug: 'photographer', name: 'Photographer', icon: '📸', nameBn: 'ফটোগ্রাফার', nameAr: 'مصور', nameHi: 'फोटोग्राफर' },
  { slug: 'cctv-technician', name: 'CCTV Technician', icon: '📹', nameBn: 'সিসিটিভি টেকনিশিয়ান', nameAr: 'فني كاميرات', nameHi: 'CCTV तकनीशियन' },
  { slug: 'gypsum-carpenter', name: 'Gypsum Carpenter', icon: '🏗️', nameBn: 'জিপসাম কার্পেন্টার', nameAr: 'نجار جبس', nameHi: 'जिप्सम कारपेंटर' },
  { slug: 'tiles-mason', name: 'Tiles Mason', icon: '🔲', nameBn: 'টাইলস মিস্ত্রি', nameAr: 'عامل تبليط', nameHi: 'टाइल्स मिस्त्री' },
  { slug: 'blacksmith', name: 'Blacksmith', icon: '⚒️', nameBn: 'কামার', nameAr: 'حداد', nameHi: 'लोहार' },
  { slug: 'general-labour', name: 'General Labour', icon: '👷', nameBn: 'সাধারণ শ্রমিক', nameAr: 'عامل عام', nameHi: 'सामान्य श्रमिक' },
  { slug: 'steel-fixer', name: 'Steel Fixer', icon: '🏗️', nameBn: 'স্টিল ফিক্সার', nameAr: 'مثبت حديد', nameHi: 'स्टील फिक्सर' },
  { slug: 'scaffolder', name: 'Scaffolder', icon: '🏗️', nameBn: 'স্ক্যাফোল্ডার', nameAr: 'عامل سقالات', nameHi: 'स्कैफोल्डर' },
  { slug: 'heavy-driver', name: 'Heavy Driver', icon: '🚛', nameBn: 'ভারী ড্রাইভার', nameAr: 'سائق ثقيل', nameHi: 'भारी ड्राइवर' },
  { slug: 'forklift-operator', name: 'Forklift Operator', icon: '🏭', nameBn: 'ফর্কলিফট অপারেটর', nameAr: 'مشغل رافعة', nameHi: 'फोर्कलिफ्ट ऑपरेटर' },
  { slug: 'crane-operator', name: 'Crane Operator', icon: '🏗️', nameBn: 'ক্রেন অপারেটর', nameAr: 'مشغل رافعة', nameHi: 'क्रेन ऑपरेटर' },
  { slug: 'pipe-fitter', name: 'Pipe Fitter', icon: '🔩', nameBn: 'পাইপ ফিটার', nameAr: 'مركب أنابيب', nameHi: 'पाइप फिटर' },
  { slug: 'waiter', name: 'Waiter', icon: '🍽️', nameBn: 'ওয়েটার', nameAr: 'نادل', nameHi: 'वेटर' },
  { slug: 'hotel-housekeeping', name: 'Hotel Housekeeping', icon: '🏨', nameBn: 'হোটেল হাউসকিপিং', nameAr: 'تدبير فندقي', nameHi: 'होटल हाउसकीपिंग' },
  { slug: 'beautician', name: 'Beautician', icon: '💄', nameBn: 'বিউটিশিয়ান', nameAr: 'خبيرة تجميل', nameHi: 'ब्यूटीशियन' },
  { slug: 'barber', name: 'Barber', icon: '💈', nameBn: 'নাপিত', nameAr: 'حلاق', nameHi: 'नाई' },
];

// ═══════════════════════════════════════════════════════════
// Helper: Category Name by Language
// ═══════════════════════════════════════════════════════════
const getCatName = (cat: any, lang: string): string => {
  switch (lang) {
    case 'bn': return cat.nameBn || cat.name;
    case 'ar': return cat.nameAr || cat.name;
    case 'hi': return cat.nameHi || cat.name;
    default: return cat.name;
  }
};

// ═══════════════════════════════════════════════════════════
// Category Grid Component (১২ Main + More Button)
// ═══════════════════════════════════════════════════════════
const CategoryGrid = React.memo(({ country, lang, onMoreClick }: {
  country: string; lang: string; onMoreClick: () => void;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-bold text-gray-800">
        {lang === 'bn' ? 'ক্যাটাগরি' : lang === 'ar' ? 'الفئات' : lang === 'hi' ? 'श्रेणियां' : 'Categories'}
      </h3>
    </div>
    <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
      {MAIN_CATEGORIES.map(cat => (
        <Link
          key={cat.slug}
          href={`/${country}/${lang}/category/${cat.slug}`}
          className="bg-white rounded-xl p-3 text-center border hover:shadow-md hover:border-orange-200 transition-all active:scale-95 group"
        >
          <span className="text-2xl lg:text-3xl block mb-1">{cat.icon}</span>
          <p className="text-[10px] lg:text-xs font-medium text-gray-700 group-hover:text-orange-600 truncate">
            {getCatName(cat, lang)}
          </p>
        </Link>
      ))}
      
      {/* ✅ More Categories Button */}
      <button
        onClick={onMoreClick}
        className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 text-center border border-orange-200 hover:shadow-md hover:border-orange-300 transition-all active:scale-95 group"
      >
        <Grid3X3 size={28} className="mx-auto mb-1 text-orange-500 lg:w-8 lg:h-8" />
        <p className="text-[10px] lg:text-xs font-medium text-orange-600">
          {lang === 'bn' ? 'আরও' : lang === 'ar' ? 'المزيد' : lang === 'hi' ? 'और' : 'More'}
        </p>
      </button>
    </div>
  </div>
));
CategoryGrid.displayName = 'CategoryGrid';

// ═══════════════════════════════════════════════════════════
// All Categories Modal
// ═══════════════════════════════════════════════════════════
const AllCategoriesModal = React.memo(({ isOpen, onClose, country, lang }: {
  isOpen: boolean; onClose: () => void; country: string; lang: string;
}) => {
  const [search, setSearch] = useState('');
  
  const allCategories = [...MAIN_CATEGORIES, ...OTHER_CATEGORIES];
  
  const filtered = search.trim()
    ? allCategories.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nameBn?.includes(search) ||
        c.nameAr?.includes(search) ||
        c.nameHi?.includes(search)
      )
    : allCategories;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-10 lg:pt-20 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h3 className="font-bold text-lg">
            {lang === 'bn' ? 'সব ক্যাটাগরি' : lang === 'ar' ? 'جميع الفئات' : lang === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'bn' ? 'ক্যাটাগরি খুঁজুন...' : lang === 'ar' ? 'ابحث عن فئة...' : lang === 'hi' ? 'श्रेणी खोजें...' : 'Search categories...'}
              className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
              autoFocus
            />
          </div>
        </div>
        
        {/* Grid */}
        <div className="p-4 overflow-y-auto max-h-[55vh]">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No categories found</p>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
              {filtered.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/${country}/${lang}/category/${cat.slug}`}
                  onClick={onClose}
                  className={`rounded-xl p-3 text-center border hover:shadow-md transition-all active:scale-95 ${
                    MAIN_CATEGORIES.some(m => m.slug === cat.slug)
                      ? 'bg-white hover:border-orange-300'
                      : 'bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl lg:text-2xl block mb-1">{cat.icon}</span>
                  <p className="text-[11px] lg:text-xs font-medium text-gray-700 truncate">
                    {getCatName(cat, lang)}
                  </p>
                  {MAIN_CATEGORIES.some(m => m.slug === cat.slug) && (
                    <span className="text-[8px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                      {lang === 'bn' ? 'প্রধান' : lang === 'ar' ? 'رئيسي' : 'Main'}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
AllCategoriesModal.displayName = 'AllCategoriesModal';

// ═══════════════════════════════════════════════════════════
// অন্যান্য Components (অপরিবর্তিত)
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
    {/* ✅ Category Grid — PC */}
    <div className="bg-white rounded-xl p-4 border mt-4">
      <CategoryGrid country={country} lang={lang} onMoreClick={onMoreClick} />
    </div>
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

const MobileLayout = React.memo(({ country, lang, onMoreClick }: { country: string; lang: string; onMoreClick: () => void }) => (
  <div className="lg:hidden">
    <HeroBanner country={country} lang={lang} />
    <div className="mt-3">
      <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-xl" />}>
        <HomeTabs country={country} lang={lang} />
      </Suspense>
    </div>
    {/* ✅ Category Grid — Mobile */}
    <div className="bg-white rounded-xl p-3 border mt-3">
      <CategoryGrid country={country} lang={lang} onMoreClick={onMoreClick} />
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
  const handleCloseModal = useCallback(() => setShowAllCategories(false), []);

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
      
      {/* ✅ All Categories Modal */}
      <AllCategoriesModal isOpen={showAllCategories} onClose={handleCloseModal} country={country} lang={lang} />
      
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