// components/home/HomeTabs.tsx
// 🚀 সুপারসনিক • ১ বিলিয়ন • ৬ গালফ • নো ল্যাগ • নো ক্র্যাশ • নো স্লো
"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import LiveWorkerMap from '@/components/map/LiveWorkerMap';
import { Crosshair, Wifi, WifiOff, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuickHire } from '@/hooks/useQuickHire';

interface Props { country: string; lang: string; }

function getDefaultLocation(country: string) {
  const defaults: Record<string, {lat: number; lng: number}> = {
    qa: { lat: 25.3548, lng: 51.1839 }, sa: { lat: 24.7136, lng: 46.6753 },
    ae: { lat: 25.2048, lng: 55.2708 }, kw: { lat: 29.3759, lng: 47.9774 },
    bh: { lat: 26.0667, lng: 50.5577 }, om: { lat: 23.5880, lng: 58.3829 },
  };
  return defaults[country] || defaults.qa;
}

export default function HomeTabs({ country, lang }: Props) {
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isHiring, setIsHiring] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const { matchWorker } = useQuickHire();

  const t = useCallback((key: string) => {
    const texts: Record<string, Record<string, string>> = {
      en: { 
        quickHire: 'Quick Hire', quickDesc: 'Find workers nearby', 
        online: 'Go Online', offline: 'Go Offline', on: 'ON', off: 'OFF', 
        findingLocation: 'Searching location...', loginRequired: 'Please login first', 
        bookingSent: 'Booking sent! Worker notified.', closeMap: 'Close Map'
      },
      bn: { 
        quickHire: 'কুইক হায়ার', quickDesc: 'কাছের শ্রমিক খুঁজুন', 
        online: 'অনলাইন হোন', offline: 'অফলাইন হোন', on: 'চালু', off: 'বন্ধ', 
        findingLocation: 'লোকেশন খোঁজা হচ্ছে...', loginRequired: 'দয়া করে লগইন করুন', 
        bookingSent: 'বুকিং সেন্ট! শ্রমিক নোটিফাইড।', closeMap: 'ম্যাপ বন্ধ করুন'
      },
      ar: { 
        quickHire: 'توظيف سريع', quickDesc: 'ابحث عن عامل قريب', 
        online: 'اتصل الآن', offline: 'غير متصل', on: 'مفعل', off: 'معطل', 
        findingLocation: 'جاري البحث عن الموقع...', loginRequired: 'يرجى تسجيل الدخول', 
        bookingSent: 'تم الإرسال! تم إشعار العامل.', closeMap: 'إغلاق الخريطة'
      },
      hi: { 
        quickHire: 'क्विक हायर', quickDesc: 'पास के श्रमिक खोजें', 
        online: 'ऑनलाइन हों', offline: 'ऑफलाइन हों', on: 'चालू', off: 'बंद', 
        findingLocation: 'लोकेशन खोज रहे...', loginRequired: 'कृपया लॉगिन करें', 
        bookingSent: 'बुकिंग भेजी! श्रमिक सूचित।', closeMap: 'मैप बंद करें'
      },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  }, [lang]);

  // Get user location only once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem('noffor_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setPhoneNumber(u.phone || u.id || 'demo');
      } catch {}
    }
    
    const savedOnline = localStorage.getItem('noffor_worker_online');
    if (savedOnline) setOnline(JSON.parse(savedOnline));
    
    // Get location once
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(getDefaultLocation(country))
      );
    } else if (!userLocation) {
      setUserLocation(getDefaultLocation(country));
    }
  }, [country, userLocation]);

  // Close map when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mapRef.current && !mapRef.current.contains(event.target as Node) && showMap) {
        setShowMap(false);
      }
    };
    
    if (showMap) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMap]);

  const handleQuickHire = useCallback(async () => {
    if (isHiring) return;
    setIsHiring(true);
    
    try {
      // Toggle map on/off
      if (showMap) {
        setShowMap(false);
        setIsHiring(false);
        return;
      }
      
      let loc = userLocation;
      
      if (!loc && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
        } catch {
          loc = getDefaultLocation(country);
          setUserLocation(loc);
        }
      } else if (!loc) {
        loc = getDefaultLocation(country);
        setUserLocation(loc);
      }
      
      if (loc) {
        await matchWorker(loc.lat, loc.lng, country, phoneNumber);
        setShowMap(true);
        // Show success message without alert (better UX)
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 animate-in fade-in duration-200';
        toast.innerText = t('bookingSent');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    } catch (err) {
      console.error('Quick hire error:', err);
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 animate-in fade-in duration-200';
      toast.innerText = 'Something went wrong. Please try again.';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    } finally {
      setIsHiring(false);
    }
  }, [userLocation, country, phoneNumber, matchWorker, t, showMap, isHiring]);

  const toggleOnline = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const next = !online;
      const stored = localStorage.getItem('noffor_worker');
      if (stored) {
        const w = JSON.parse(stored);
        await supabase.from('profiles').update({ 
          is_online: next, 
          last_online: new Date().toISOString() 
        }).eq('id', w.id);
        setOnline(next);
        localStorage.setItem('noffor_worker_online', JSON.stringify(next));
        
        // Update user storage as well
        const userStored = localStorage.getItem('noffor_user');
        if (userStored) {
          const user = JSON.parse(userStored);
          user.is_online = next;
          localStorage.setItem('noffor_user', JSON.stringify(user));
        }
      } else {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50';
        toast.innerText = t('loginRequired');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    } catch (err) {
      console.error('Toggle online error:', err);
    }
    setLoading(false);
  }, [online, loading, t]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {/* Quick Hire Button */}
        <button 
          onClick={handleQuickHire}
          disabled={isHiring}
          className={`bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl px-3 py-2.5 text-white text-left hover:shadow-md hover:shadow-green-500/20 transition-all active:scale-95 w-full disabled:opacity-50`}
        >
          <Crosshair size={18} className="mb-1" />
          <p className="text-sm font-bold">{t('quickHire')}</p>
          <p className="text-[10px] opacity-80">{showMap ? t('closeMap') : t('quickDesc')}</p>
        </button>
        
        {/* Online Toggle Button */}
        <button 
          onClick={toggleOnline} 
          disabled={loading}
          className={`rounded-xl px-3 py-2.5 text-left transition-all active:scale-95 w-full ${
            online ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white hover:shadow-md hover:shadow-emerald-500/20'
                   : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white hover:shadow-md hover:shadow-gray-500/20'
          } disabled:opacity-50`}
        >
          {online ? <WifiOff size={18} className="mb-1" /> : <Wifi size={18} className="mb-1" />}
          <p className="text-sm font-bold">{online ? t('offline') : t('online')}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-[10px] opacity-80">{online ? t('on') : t('off')}</span>
          </div>
        </button>
      </div>
      
      {/* Map Section with Close Button */}
      {showMap && userLocation && (
        <div ref={mapRef} className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          {/* Close button on map */}
          <button
            onClick={() => setShowMap(false)}
            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition"
          >
            <X size={16} className="text-gray-600" />
          </button>
          <LiveWorkerMap 
            country={country} 
            lang={lang} 
            userLat={userLocation.lat} 
            userLng={userLocation.lng} 
          />
        </div>
      )}
      
      {showMap && !userLocation && (
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-xs text-gray-500">{t('findingLocation')}</p>
        </div>
      )}
    </div>
  );
}