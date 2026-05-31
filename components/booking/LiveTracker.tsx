// components/booking/LiveTracker.tsx
"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Navigation, Clock, MapPin } from 'lucide-react';

interface Props {
  bookingId: string;
  workerId: string;
  lang: string;
}

export default function LiveTracker({ bookingId, workerId, lang }: Props) {
  const [workerPos, setWorkerPos] = useState<{lat: number; lng: number} | null>(null);
  const [eta, setEta] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [userPos, setUserPos] = useState<{lat: number; lng: number} | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = (key: string) => {
    const texts: any = {
      en: { arriving: 'Worker is arriving', eta: 'ETA', min: 'min', distance: 'Distance', km: 'km' },
      bn: { arriving: 'শ্রমিক আসছেন', eta: 'সময়', min: 'মিনিট', distance: 'দূরত্ব', km: 'কিমি' },
      ar: { arriving: 'العامل في الطريق', eta: 'الوقت', min: 'دقيقة', distance: 'المسافة', km: 'كم' },
      hi: { arriving: 'श्रमिक आ रहे हैं', eta: 'समय', min: 'मिनट', distance: 'दूरी', km: 'किमी' },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  };

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      );
    }

    // Track worker every 5s
    intervalRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('worker_locations')
        .select('latitude, longitude')
        .eq('worker_id', workerId)
        .single();

      if (data) {
        setWorkerPos({ lat: data.latitude, lng: data.longitude });
        
        if (userPos) {
          const dist = getDistance(userPos.lat, userPos.lng, data.latitude, data.longitude);
          setDistance(dist);
          setEta(Math.ceil((dist / 30) * 60));
        }
      }
    }, 5000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [workerId]);

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Navigation size={16} className="text-green-600 animate-pulse" />
        <p className="text-sm font-bold text-gray-800">{t('arriving')}</p>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {distance} {t('km')}
        </span>
        <span className="flex items-center gap-1 font-bold text-green-600">
          <Clock size={12} /> {t('eta')}: {eta} {t('min')}
        </span>
      </div>
    </div>
  );
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}