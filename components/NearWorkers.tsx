// components/NearWorkers.tsx
"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Navigation, MapPin, Clock, DollarSign, UserPlus, Wifi } from 'lucide-react';
import { Worker, UserLocation } from '@/types';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: { title: 'Nearby Workers', kmAway: 'km away', eta: 'ETA', mins: 'mins', hire: 'Hire', online: 'Online', noWorkers: 'No workers available nearby' },
  bn: { title: 'কাছাকাছি শ্রমিক', kmAway: 'কিমি দূরে', eta: 'পৌঁছাতে সময়', mins: 'মিনিট', hire: 'নিয়োগ', online: 'অনলাইন', noWorkers: 'কাছাকাছি কোনো শ্রমিক নেই' },
  ar: { title: 'عمال قريب', kmAway: 'كم', eta: 'الوقت المتوقع', mins: 'دقيقة', hire: 'استأجر', online: 'متصل', noWorkers: 'لا يوجد عمال قريب' },
  hi: { title: 'पास के श्रमिक', kmAway: 'किमी दूर', eta: 'अनुमानित समय', mins: 'मिनट', hire: 'किराया', online: 'ऑनलाइन', noWorkers: 'पास में कोई श्रमिक नहीं' }
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1));
}

function getETA(distanceKm: number): number {
  return Math.ceil((distanceKm / 20) * 60);
}

interface NearWorkersProps {
  country: string;
  lang: string;
  userLocation: UserLocation;
  onBook: (worker: Worker) => void;
  category?: string;
}

export default function NearWorkers({ country, lang, userLocation, onBook, category = 'all' }: NearWorkersProps) {
  const tr = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLocation) loadNearWorkers();
  }, [userLocation, category]);

  const loadNearWorkers = async () => {
    setLoading(true);
    const { data: locations } = await supabase
      .from('worker_locations')
      .select('*, profiles!inner(*)')
      .eq('is_online', true)
      .gte('last_seen', new Date(Date.now() - 5*60000).toISOString());

    const workersWithDistance = (locations || [])
      .filter(w => category === 'all' || w.profiles?.category === category)
      .map(w => ({
        ...w,
        ...w.profiles,
        worker_id: w.worker_id,
        distance: getDistance(userLocation.lat, userLocation.lng, w.latitude, w.longitude),
        eta: getETA(getDistance(userLocation.lat, userLocation.lng, w.latitude, w.longitude))
      }))
      .filter(w => w.distance <= 10)
      .sort((a,b) => a.distance - b.distance);

    setWorkers(workersWithDistance);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border">
        <p className="text-gray-400">{tr.noWorkers}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Navigation size={20} className="text-green-600" /> 
        {tr.title} ({workers.length})
      </h2>
      {workers.map(worker => (
        <div key={worker.worker_id} className="bg-white rounded-xl border p-3 hover:shadow-md transition">
          <div className="flex gap-3">
            <img src={worker.photo_url || '/avatar.png'} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{worker.name}</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Wifi size={8} /> {tr.online}
                </span>
              </div>
              <p className="text-xs text-gray-500">{worker.category}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={10} /> {worker.distance} {tr.kmAway}</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {worker.eta} {tr.mins}</span>
                <span className="flex items-center gap-1"><DollarSign size={10} /> {worker.expected_salary || 'Negotiable'}</span>
              </div>
            </div>
            <button 
              onClick={() => onBook(worker)} 
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1"
            >
              <UserPlus size={14} /> {tr.hire}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}