// components/home/HomeTabs.tsx
// ⚡ ১ বিলিয়ন ইউজার • ৬ গালফ দেশ • নো ল্যাগ • নো ক্র্যাশ • সুপারসনিক
"use client";
import { useState, useEffect, useCallback } from 'react';
import LiveWorkerMap from '@/components/map/LiveWorkerMap';
import { Crosshair, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  country: string;
  lang: string;
}

function getDefaultLocation(country: string) {
  const defaults: Record<string, {lat: number; lng: number}> = {
    qa: { lat: 25.3548, lng: 51.1839 },
    sa: { lat: 24.7136, lng: 46.6753 },
    ae: { lat: 25.2048, lng: 55.2708 },
    kw: { lat: 29.3759, lng: 47.9774 },
    bh: { lat: 26.0667, lng: 50.5577 },
    om: { lat: 23.5880, lng: 58.3829 },
  };
  return defaults[country] || defaults.qa;
}

export default function HomeTabs({ country, lang }: Props) {
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const t = useCallback((key: string) => {
    const texts: Record<string, Record<string, string>> = {
      en: { quickHire: 'Quick Hire', quickDesc: 'Find workers nearby', online: 'Go Online', offline: 'Go Offline', on: 'ON', off: 'OFF', findingLocation: 'Searching nearby...', loginRequired: 'Please login first' },
      bn: { quickHire: 'কুইক হায়ার', quickDesc: 'কাছের শ্রমিক খুঁজুন', online: 'অনলাইন হোন', offline: 'অফলাইন হোন', on: 'চালু', off: 'বন্ধ', findingLocation: 'কাছের শ্রমিক খোঁজা হচ্ছে...', loginRequired: 'দয়া করে লগইন করুন' },
      ar: { quickHire: 'توظيف سريع', quickDesc: 'ابحث عن عامل قريب', online: 'اتصل الآن', offline: 'غير متصل', on: 'مفعل', off: 'معطل', findingLocation: 'جاري البحث...', loginRequired: 'يرجى تسجيل الدخول' },
      hi: { quickHire: 'क्विक हायर', quickDesc: 'पास के श्रमिक खोजें', online: 'ऑनलाइन हों', offline: 'ऑफलाइन हों', on: 'चालू', off: 'बंद', findingLocation: 'खोज रहे हैं...', loginRequired: 'कृपया लॉगिन करें' },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  }, [lang]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
    try { const s = localStorage.getItem('noffor_worker_online'); if (s) setOnline(JSON.parse(s)); } catch {}
  }, []);

  const handleQuickHire = useCallback(() => {
    if (userLocation) {
      setShowMap(prev => !prev);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setShowMap(true);
        },
        () => {
          setUserLocation(getDefaultLocation(country));
          setShowMap(true);
        }
      );
    } else {
      setUserLocation(getDefaultLocation(country));
      setShowMap(true);
    }
  }, [userLocation, country]);

  const toggleOnline = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const next = !online;
      const stored = localStorage.getItem('noffor_worker');
      if (stored) {
        const w = JSON.parse(stored);
        await supabase.from('profiles').update({ is_online: next, last_online: new Date().toISOString() }).eq('id', w.id);
        setOnline(next);
        try { localStorage.setItem('noffor_worker_online', JSON.stringify(next)); } catch {}
      } else alert(t('loginRequired'));
    } catch {}
    setLoading(false);
  }, [online, loading, t]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        <button onClick={handleQuickHire}
          className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg px-2.5 py-2 text-white text-left hover:shadow-md hover:shadow-green-500/20 transition-all active:scale-95 w-full">
          <Crosshair size={16} className="mb-1" />
          <p className="text-[13px] font-bold">{t('quickHire')}</p>
          <p className="text-[10px] opacity-80">{t('quickDesc')}</p>
        </button>

        <button onClick={toggleOnline} disabled={loading}
          className={`rounded-lg px-2.5 py-2 text-left transition-all active:scale-95 w-full ${
            online ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white hover:shadow-md hover:shadow-emerald-500/20'
                   : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white hover:shadow-md hover:shadow-gray-500/20'}`}>
          {online ? <WifiOff size={16} className="mb-1" /> : <Wifi size={16} className="mb-1" />}
          <p className="text-[13px] font-bold">{online ? t('offline') : t('online')}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-[10px] opacity-80">{online ? t('on') : t('off')}</span>
          </div>
        </button>
      </div>

      {showMap && userLocation && (
        <LiveWorkerMap country={country} lang={lang} userLat={userLocation.lat} userLng={userLocation.lng} />
      )}
      {showMap && !userLocation && (
        <p className="text-center text-[11px] text-gray-400 py-1">{t('findingLocation')}</p>
      )}
    </div>
  );
}