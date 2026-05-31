// components/home/OnlineToggle.tsx
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Wifi, WifiOff, MapPin, MapPinOff } from 'lucide-react';
import LiveLocationTracker from '@/components/worker/LiveLocationTracker';

interface Props {
  profileId: string;
  initial: boolean;
  lang: string;
  onStatusChange?: (isOnline: boolean) => void;
}

export default function OnlineToggle({ profileId, initial, lang, onStatusChange }: Props) {
  const [online, setOnline] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string) => {
    const texts: any = {
      en: { 
        online: 'You are Online', 
        offline: 'You are Offline', 
        goOnline: 'Go Online', 
        goOffline: 'Go Offline', 
        accepting: 'Accepting requests', 
        notAccepting: 'Not accepting requests', 
        loginRequired: 'Please login as a worker first',
        locationOn: '📍 Location sharing ON',
        locationOff: '📍 Location sharing OFF',
        trackingActive: 'Live tracking active'
      },
      bn: { 
        online: 'আপনি অনলাইন', 
        offline: 'আপনি অফলাইন', 
        goOnline: 'অনলাইন হোন', 
        goOffline: 'অফলাইন হোন', 
        accepting: 'রিকোয়েস্ট গ্রহণ করছেন', 
        notAccepting: 'রিকোয়েস্ট গ্রহণ বন্ধ', 
        loginRequired: 'দয়া করে শ্রমিক হিসাবে লগইন করুন',
        locationOn: '📍 লোকেশন শেয়ারিং চালু',
        locationOff: '📍 লোকেশন শেয়ারিং বন্ধ',
        trackingActive: 'লাইভ ট্র্যাকিং সক্রিয়'
      },
      ar: { 
        online: 'متصل', 
        offline: 'غير متصل', 
        goOnline: 'اتصل', 
        goOffline: 'افصل', 
        accepting: 'قبول الطلبات', 
        notAccepting: 'الطلبات متوقفة', 
        loginRequired: 'يرجى تسجيل الدخول كعامل',
        locationOn: '📍 مشاركة الموقع مفعلة',
        locationOff: '📍 مشاركة الموقع معطلة',
        trackingActive: 'التتبع المباشر نشط'
      },
      hi: { 
        online: 'आप ऑनलाइन हैं', 
        offline: 'आप ऑफलाइन हैं', 
        goOnline: 'ऑनलाइन हों', 
        goOffline: 'ऑफलाइन हों', 
        accepting: 'रिक्वेस्ट स्वीकार कर रहे हैं', 
        notAccepting: 'रिक्वेस्ट बंद', 
        loginRequired: 'कृपया श्रमिक के रूप में लॉगिन करें',
        locationOn: '📍 लोकेशन शेयरिंग चालू',
        locationOff: '📍 लोकेशन शेयरिंग बंद',
        trackingActive: 'लाइव ट्रैकिंग सक्रिय'
      },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  };

  // Check location permission when online
  useEffect(() => {
    if (online && navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationEnabled(result.state === 'granted');
        result.onchange = () => setLocationEnabled(result.state === 'granted');
      });
    }
  }, [online]);

  const toggle = async () => {
    if (!profileId) {
      alert(t('loginRequired'));
      return;
    }
    
    setLoading(true);
    setError(null);
    const next = !online;

    // If going online, check location permission first
    if (next && navigator.geolocation) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          setError('Please enable location permission to go online');
          setLoading(false);
          return;
        }
        if (permission.state === 'prompt') {
          // Request location to trigger permission prompt
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
        }
        setLocationEnabled(true);
      } catch (err) {
        setError('Location access required for online mode');
        setLoading(false);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_online: next, 
        last_online: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (!updateError) {
      setOnline(next);
      localStorage.setItem('noffor_worker_online', JSON.stringify(next));
      
      // Update localStorage user object
      const stored = localStorage.getItem('noffor_user');
      if (stored) {
        const user = JSON.parse(stored);
        user.is_online = next;
        localStorage.setItem('noffor_user', JSON.stringify(user));
      }
      
      // Notify parent component
      if (onStatusChange) onStatusChange(next);
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('worker-online-status', { detail: { online: next, workerId: profileId } }));
    } else {
      setError(updateError.message);
    }
    
    setLoading(false);
  };

  return (
    <>
      <LiveLocationTracker workerId={profileId} isOnline={online} lang={lang} />
      
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm w-full">
        {/* Error Message */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg text-center">
            ⚠️ {error}
          </div>
        )}
        
        {/* Status */}
        <div className={`text-center mb-3 py-3 rounded-xl transition-all ${online ? 'bg-green-50' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-center gap-2">
            {online ? (
              <div className="relative">
                <div className="absolute -top-1 -right-1">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <Wifi size={24} className="text-green-500" />
              </div>
            ) : (
              <WifiOff size={24} className="text-gray-400" />
            )}
            <p className={`text-lg font-bold ${online ? 'text-green-600' : 'text-gray-400'}`}>
              {online ? t('online') : t('offline')}
            </p>
          </div>
          <p className={`text-xs mt-1 ${online ? 'text-green-500' : 'text-gray-400'}`}>
            {online ? t('accepting') : t('notAccepting')}
          </p>
          {online && locationEnabled && (
            <p className="text-[10px] text-blue-500 mt-1 flex items-center justify-center gap-1">
              <MapPin size={10} /> {t('trackingActive')}
            </p>
          )}
        </div>

        {/* Location Status */}
        {online && (
          <div className="mb-3 flex items-center justify-center gap-1 text-[10px]">
            {locationEnabled ? (
              <span className="text-green-600 flex items-center gap-1"><MapPin size={10} /> {t('locationOn')}</span>
            ) : (
              <span className="text-orange-600 flex items-center gap-1"><MapPinOff size={10} /> {t('locationOff')}</span>
            )}
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={toggle}
          disabled={loading}
          className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            online
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-200'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : online ? (
            <><WifiOff size={18} /> {t('goOffline')}</>
          ) : (
            <><Wifi size={18} /> {t('goOnline')}</>
          )}
        </button>

        {/* Online Status Indicator */}
        {online && (
          <div className="flex justify-center mt-3">
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Available for work
            </div>
          </div>
        )}
      </div>
    </>
  );
}