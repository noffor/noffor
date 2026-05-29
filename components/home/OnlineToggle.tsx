// components/home/OnlineToggle.tsx
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Wifi, WifiOff } from 'lucide-react';
import LiveLocationTracker from '@/components/worker/LiveLocationTracker';

interface Props {
  profileId: string;
  initial: boolean;
  lang: string;
}

export default function OnlineToggle({ profileId, initial, lang }: Props) {
  const [online, setOnline] = useState(initial);
  const [loading, setLoading] = useState(false);

  const t = (key: string) => {
    const texts: any = {
      en: { online: '🟢 You are Online', offline: '🔴 You are Offline', goOnline: 'Go Online', goOffline: 'Go Offline', accepting: 'Accepting requests', notAccepting: 'Not accepting requests', loginRequired: 'Please login as a worker first' },
      bn: { online: '🟢 আপনি অনলাইন', offline: '🔴 আপনি অফলাইন', goOnline: 'অনলাইন হোন', goOffline: 'অফলাইন হোন', accepting: 'রিকোয়েস্ট গ্রহণ করছেন', notAccepting: 'রিকোয়েস্ট গ্রহণ বন্ধ', loginRequired: 'দয়া করে শ্রমিক হিসাবে লগইন করুন' },
      ar: { online: '🟢 متصل', offline: '🔴 غير متصل', goOnline: 'اتصل', goOffline: 'افصل', accepting: 'قبول الطلبات', notAccepting: 'الطلبات متوقفة', loginRequired: 'يرجى تسجيل الدخول كعامل' },
      hi: { online: '🟢 आप ऑनलाइन हैं', offline: '🔴 आप ऑफलाइन हैं', goOnline: 'ऑनलाइन हों', goOffline: 'ऑफलाइन हों', accepting: 'रिक्वेस्ट स्वीकार कर रहे हैं', notAccepting: 'रिक्वेस्ट बंद', loginRequired: 'कृपया श्रमिक के रूप में लॉगिन करें' },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  };

  const toggle = async () => {
    if (!profileId) {
      alert(t('loginRequired'));
      return;
    }
    
    setLoading(true);
    const next = !online;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_online: next, 
        last_online: new Date().toISOString() 
      })
      .eq('id', profileId);

    if (!error) {
      setOnline(next);
      localStorage.setItem('noffor_worker_online', JSON.stringify(next));
    }
    
    setLoading(false);
  };

  return (
    <>
      <LiveLocationTracker workerId={profileId} isOnline={online} lang={lang} />
      
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        {/* Status */}
        <div className={`text-center mb-3 py-3 rounded-xl transition-all ${online ? 'bg-green-50' : 'bg-gray-100'}`}>
          <p className={`text-lg font-bold ${online ? 'text-green-600' : 'text-gray-400'}`}>
            {online ? t('online') : t('offline')}
          </p>
          <p className={`text-xs mt-1 ${online ? 'text-green-500' : 'text-gray-400'}`}>
            {online ? t('accepting') : t('notAccepting')}
          </p>
        </div>

        {/* Toggle */}
        <button
          onClick={toggle}
          disabled={loading}
          className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
            online
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200'
              : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200'
          }`}
        >
          {online ? (
            <><WifiOff size={18} /> {t('goOffline')}</>
          ) : (
            <><Wifi size={18} /> {t('goOnline')}</>
          )}
        </button>

        {online && (
          <div className="flex justify-center mt-2">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
        )}
      </div>
    </>
  );
}