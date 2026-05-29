// components/home/HomeTabs.tsx
"use client";
import { useState, useEffect } from 'react';
import LiveWorkerMap from '@/components/map/LiveWorkerMap';
import { Crosshair, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  country: string;
  lang: string;
}

export default function HomeTabs({ country, lang }: Props) {
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const t = (key: string) => {
    const texts: any = {
      en: { quickHire: 'Quick Hire', quickDesc: 'Nearby workers', online: 'Go Online', offline: 'Go Offline', on: 'ON', off: 'OFF', findingLocation: 'Finding nearby workers...', loginRequired: 'Please login first' },
      bn: { quickHire: 'কুইক হায়ার', quickDesc: 'কাছের শ্রমিক', online: 'অনলাইন', offline: 'অফলাইন', on: 'চালু', off: 'বন্ধ', findingLocation: 'কাছের শ্রমিক খোঁজা হচ্ছে...', loginRequired: 'দয়া করে লগইন করুন' },
      ar: { quickHire: 'سريع', quickDesc: 'العمال القريبين', online: 'اتصال', offline: 'فصل', on: 'مفعل', off: 'معطل', findingLocation: 'جاري البحث عن العمال...', loginRequired: 'يرجى تسجيل الدخول' },
      hi: { quickHire: 'क्विक', quickDesc: 'पास के श्रमिक', online: 'ऑनलाइन', offline: 'ऑफलाइन', on: 'चालू', off: 'बंद', findingLocation: 'पास के श्रमिक खोज रहे...', loginRequired: 'कृपया लॉगिन करें' },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  };

  // অটো লোকেশন
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setShowMap(true);
        },
        () => {} // silently fail
      );
    }
    const stored = localStorage.getItem('noffor_worker_online');
    if (stored) setOnline(JSON.parse(stored));
  }, []);

  const handleQuickHire = () => {
    if (userLocation) {
      setShowMap(!showMap); // ম্যাপ টগল
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setShowMap(true);
        },
        () => alert(lang === 'bn' ? 'লোকেশন অনুমতি প্রয়োজন' : 'Location permission required')
      );
    }
  };

  const toggleOnline = async () => {
    setLoading(true);
    const next = !online;
    
    const stored = localStorage.getItem('noffor_worker');
    if (stored) {
      const worker = JSON.parse(stored);
      const { error } = await supabase
        .from('profiles')
        .update({ is_online: next, last_online: new Date().toISOString() })
        .eq('id', worker.id);
      
      if (!error) {
        setOnline(next);
        localStorage.setItem('noffor_worker_online', JSON.stringify(next));
      }
    } else {
      alert(t('loginRequired'));
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {/* ২ গ্রিড বাটন */}
      <div className="grid grid-cols-2 gap-2">
        {/* Quick Hire - এখন button! */}
        <button
          onClick={handleQuickHire}
          className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-3 text-white text-left hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-95 w-full"
        >
          <Crosshair size={20} className="mb-2" />
          <p className="text-sm font-bold">{t('quickHire')}</p>
          <p className="text-xs opacity-80 mt-0.5">{t('quickDesc')}</p>
        </button>

        {/* Online Toggle */}
        <button
          onClick={toggleOnline}
          disabled={loading}
          className={`rounded-xl p-3 text-left transition-all active:scale-95 w-full ${
            online
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/30'
              : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white hover:shadow-lg hover:shadow-gray-500/30'
          }`}
        >
          {online ? <WifiOff size={20} className="mb-2" /> : <Wifi size={20} className="mb-2" />}
          <p className="text-sm font-bold">{online ? t('offline') : t('online')}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs opacity-80">{online ? t('on') : t('off')}</span>
          </div>
        </button>
      </div>

      {/* Map - Quick Hire ক্লিক করলে দেখাবে */}
      {showMap && userLocation ? (
        <LiveWorkerMap 
          country={country} 
          lang={lang} 
          userLat={userLocation.lat}
          userLng={userLocation.lng}
        />
      ) : (
        <p className="text-center text-xs text-gray-400 py-2">
          {userLocation ? t('findingLocation') : ''}
        </p>
      )}
    </div>
  );
}