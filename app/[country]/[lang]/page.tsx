"use client";
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import UnifiedList from '@/components/home/UnifiedList';
import NearWorkersSection from '@/components/home/NearWorkersSection';
import HomeTabs from '@/components/home/HomeTabs';
import LiveWorkerMap from '@/components/map/LiveWorkerMap';
import { Crosshair, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function HomePage() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
    const stored = localStorage.getItem('noffor_worker_online');
    if (stored) setOnline(JSON.parse(stored));
  }, []);

  const t = (key: string) => {
    const texts: any = {
      en: { quick: 'Quick', hire: 'Hire', online: 'Online', offline: 'Offline', hideMap: 'Hide Map' },
      bn: { quick: 'কুইক', hire: 'হায়ার', online: 'অন', offline: 'অফ', hideMap: 'ম্যাপ লুকান' },
      ar: { quick: 'سريع', hire: 'توظيف', online: 'اتصال', offline: 'فصل', hideMap: 'إخفاء' },
      hi: { quick: 'क्विक', hire: 'हायर', online: 'ऑन', offline: 'ऑफ', hideMap: 'मैप छुपाएं' },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  };

  const toggleOnline = async () => {
    const next = !online;
    const stored = localStorage.getItem('noffor_worker');
    if (stored) {
      const worker = JSON.parse(stored);
      await supabase.from('profiles').update({ is_online: next }).eq('id', worker.id);
      setOnline(next);
      localStorage.setItem('noffor_worker_online', JSON.stringify(next));
    } else {
      alert(lang === 'bn' ? 'দয়া করে লগইন করুন' : 'Please login first');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-7xl mx-auto px-3 lg:px-4 py-3">
        
        {/* PC Layout */}
        <div className="hidden lg:block">
          {/* Quick Hire + Online Toggle */}
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setShowMap(!showMap)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                showMap ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}>
              <Crosshair size={14} />
              {showMap ? t('hideMap') : `${t('quick')} ${t('hire')}`}
            </button>
            
            <button onClick={toggleOnline}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                online ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'
              }`}>
              {online ? <WifiOff size={14} /> : <Wifi size={14} />}
              {online ? t('offline') : t('online')}
              <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
            </button>
          </div>

          {/* Map বা Hero */}
          {showMap && userLocation ? (
            <LiveWorkerMap country={country} lang={lang} userLat={userLocation.lat} userLng={userLocation.lng} />
          ) : (
            <HeroBanner country={country} lang={lang} />
          )}
          
          <div className="mt-4">
            <NearWorkersSection country={country} lang={lang} />
          </div>
          
          <div className="flex gap-4 mt-4">
            {/* Sidebar - শুধু Sidebar (CategoryGrid sidebar-এই আছে) */}
            <div className="w-56 shrink-0">
              <Sidebar country={country} lang={lang} />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl p-4 border mb-4">
                <UnifiedList type="labor" country={country} lang={lang} />
              </div>
              <div className="bg-white rounded-xl p-4 border">
                <UnifiedList type="employer" country={country} lang={lang} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <HeroBanner country={country} lang={lang} />
          <div className="mt-3">
            <HomeTabs country={country} lang={lang} />
          </div>
          <div className="mt-3">
            <NearWorkersSection country={country} lang={lang} />
          </div>
          <div className="bg-white rounded-xl p-3 border mt-3">
            <CategoryGrid country={country} lang={lang} />
          </div>
          <div className="bg-white rounded-xl p-3 border mt-3">
            <UnifiedList type="labor" country={country} lang={lang} />
          </div>
          <div className="bg-white rounded-xl p-3 border mt-3">
            <UnifiedList type="employer" country={country} lang={lang} />
          </div>
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}