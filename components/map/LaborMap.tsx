"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Navigation, Users, MapPin, MessageCircle, Star, X, Search, Filter, Zap,
  DollarSign, Bookmark, Share2, QrCode, Route, Timer, Wifi, WifiOff, List, MapIcon
} from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

function FlyToLocation({ lat, lng, zoom = 14 }: { lat: number; lng: number; zoom?: number }) {
  const [L, setL] = useState<any>(null);
  useEffect(() => { import('leaflet').then(mod => setL(mod.default)); }, []);
  useEffect(() => {
    if (!L) return;
    const mapEl = document.querySelector('.leaflet-container') as any;
    if (mapEl && mapEl._leaflet_map) mapEl._leaflet_map.flyTo([lat, lng], zoom, { duration: 1.5 });
  }, [lat, lng, zoom, L]);
  return null;
}

const countryCenters: Record<string, { lat: number; lng: number; zoom: number; name: string; areas: { name: string; lat: number; lng: number }[] }> = {
  qa: { lat: 25.2867, lng: 51.5333, zoom: 11, name: 'Qatar', areas: [
    { name: 'Doha', lat: 25.2854, lng: 51.5310 }, { name: 'Al Rayyan', lat: 25.2920, lng: 51.4240 },
    { name: 'Al Wakrah', lat: 25.1667, lng: 51.6000 }, { name: 'Al Khor', lat: 25.6833, lng: 51.5000 },
    { name: 'Industrial Area', lat: 25.2134, lng: 51.4865 },
  ]},
  sa: { lat: 24.7136, lng: 46.6753, zoom: 6, name: 'Saudi Arabia', areas: [
    { name: 'Riyadh', lat: 24.7136, lng: 46.6753 }, { name: 'Jeddah', lat: 21.5433, lng: 39.1728 },
    { name: 'Mecca', lat: 21.3891, lng: 39.8579 }, { name: 'Medina', lat: 24.5247, lng: 39.5692 },
    { name: 'Dammam', lat: 26.4342, lng: 50.1033 },
  ]},
  ae: { lat: 25.2048, lng: 55.2708, zoom: 8, name: 'UAE', areas: [
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 }, { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
    { name: 'Sharjah', lat: 25.3573, lng: 55.4033 }, { name: 'Ajman', lat: 25.4111, lng: 55.4404 },
  ]},
  kw: { lat: 29.3759, lng: 47.9774, zoom: 10, name: 'Kuwait', areas: [
    { name: 'Kuwait City', lat: 29.3759, lng: 47.9774 }, { name: 'Hawalli', lat: 29.3333, lng: 48.0333 },
    { name: 'Farwaniya', lat: 29.2778, lng: 47.9586 },
  ]},
  om: { lat: 23.5880, lng: 58.3829, zoom: 7, name: 'Oman', areas: [
    { name: 'Muscat', lat: 23.5880, lng: 58.3829 }, { name: 'Salalah', lat: 17.0151, lng: 54.0924 },
    { name: 'Sohar', lat: 24.3643, lng: 56.7468 },
  ]},
  bh: { lat: 26.0667, lng: 50.5577, zoom: 11, name: 'Bahrain', areas: [
    { name: 'Manama', lat: 26.2285, lng: 50.5860 }, { name: 'Riffa', lat: 26.1300, lng: 50.5550 },
    { name: 'Muharraq', lat: 26.2572, lng: 50.6119 },
  ]},
};

const categoryColors: Record<string, string> = {
  Driver: '#3B82F6', Electrician: '#F59E0B', Plumber: '#10B981', Mason: '#8B5CF6',
  'AC Technician': '#06B6D4', Painter: '#EC4899', Carpenter: '#F97316',
  Welder: '#6366F1', Cleaner: '#14B8A6', Cook: '#EF4444', Helper: '#84CC16', Gardener: '#22D3EE',
};

const categoryNames: Record<string, Record<string, string>> = {
  Driver: { en: 'Driver', ar: 'سائق', bn: 'ড্রাইভার', hi: 'ड्राइवर' },
  Electrician: { en: 'Electrician', ar: 'كهربائي', bn: 'ইলেকট্রিশিয়ান', hi: 'इलेक्ट्रीशियन' },
  Plumber: { en: 'Plumber', ar: 'سباك', bn: 'প্লাম্বার', hi: 'प्लंबर' },
  Mason: { en: 'Mason', ar: 'بناء', bn: 'রাজমিস্ত্রি', hi: 'राजमिस्त्री' },
  'AC Technician': { en: 'AC Technician', ar: 'فني تكييف', bn: 'এসি টেকনিশিয়ান', hi: 'एसी तकनीशियन' },
  Painter: { en: 'Painter', ar: 'دهان', bn: 'পেইন্টার', hi: 'पेंटर' },
  Carpenter: { en: 'Carpenter', ar: 'نجار', bn: 'কার্পেন্টার', hi: 'बढ़ई' },
  Welder: { en: 'Welder', ar: 'لحام', bn: 'ওয়েল্ডার', hi: 'वेल्डर' },
  Cleaner: { en: 'Cleaner', ar: 'منظف', bn: 'ক্লিনার', hi: 'क्लीनर' },
  Cook: { en: 'Cook', ar: 'طباخ', bn: 'রাঁধুনি', hi: 'रसोइया' },
  Helper: { en: 'Helper', ar: 'مساعد', bn: 'হেল্পার', hi: 'हेल्पर' },
  Gardener: { en: 'Gardener', ar: 'بستاني', bn: 'মালী', hi: 'माली' },
};

const areaWorkerCounts: Record<string, Record<string, number>> = {
  qa: { 'Doha': 45, 'Al Rayyan': 30, 'Al Wakrah': 20, 'Al Khor': 15, 'Industrial Area': 55 },
  sa: { 'Riyadh': 80, 'Jeddah': 60, 'Mecca': 40, 'Medina': 35, 'Dammam': 25 },
  ae: { 'Dubai': 90, 'Abu Dhabi': 50, 'Sharjah': 35, 'Ajman': 20 },
  kw: { 'Kuwait City': 50, 'Hawalli': 30, 'Farwaniya': 20 },
  om: { 'Muscat': 40, 'Salalah': 25, 'Sohar': 15 },
  bh: { 'Manama': 45, 'Riffa': 25, 'Muharraq': 20 },
};

// Worker positions store (consistent across renders)
const workerPositions: Record<string, { lat: number; lng: number }> = {};

function WorkerPopup({ labor, country, userLocation, lang }: { labor: any; country: string; userLocation: any; lang: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  const pos = workerPositions[labor.id] || { lat: 25.2867, lng: 51.5333 };
  const dist = userLocation 
    ? getDistanceFromCoords(userLocation.lat, userLocation.lng, pos.lat, pos.lng).toFixed(1)
    : '?';
  const eta = userLocation ? Math.round(Number(dist) * 2) : '?';
  const catName = categoryNames[labor.category]?.[lang] || labor.category;

  return (
    <div className="p-1">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <img src={labor.photo_url || '/default-avatar.png'} className="w-14 h-14 rounded-full object-cover border-2 border-green-500" />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <div>
          <p className="font-bold text-base text-gray-800">{labor.name}</p>
          <p className="text-xs text-gray-500">{catName}</p>
          <div className="flex items-center gap-1 mt-0.5"><Star size={14} className="text-yellow-500" fill="#EAB308" /><span className="text-sm font-medium">{labor.rating || 'New'}</span></div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
        <div className="flex justify-between text-sm"><span className="text-gray-500">{t('salary')}</span><span className="font-bold text-orange-600">{labor.expected_salary}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">{t('experience')}</span><span className="font-medium">{labor.experience || '-'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500 flex items-center gap-1"><Route size={12} /> Distance</span><span className="font-medium">{dist} km</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500 flex items-center gap-1"><Timer size={12} /> ETA</span><span className="font-medium">~{eta} min</span></div>
      </div>
      <div className="flex gap-2">
        <a href={`https://wa.me/${labor.phone}`} target="_blank" className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-medium text-center no-underline flex items-center justify-center gap-2"><MessageCircle size={16} /> {t('whatsapp')}</a>
        <a href={`/${country}/${lang}/profile/${labor.id}`} className="flex-1 py-3 bg-orange-600 text-white rounded-xl text-sm font-medium text-center no-underline">{t('viewProfile')}</a>
      </div>
    </div>
  );
}

function getDistanceFromCoords(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function WorkerListItem({ labor, country, lang }: { labor: any; country: string; lang: string }) {
  const catName = categoryNames[labor.category]?.[lang] || labor.category;
  const color = categoryColors[labor.category] || '#6B7280';
  return (
    <a href={`/${country}/${lang}/profile/${labor.id}`} className="flex items-center gap-3 p-3 bg-white rounded-xl border hover:shadow-md transition-all">
      <div className="relative flex-shrink-0">
        <img src={labor.photo_url || '/default-avatar.png'} className="w-12 h-12 rounded-full object-cover" />
        {labor.is_online && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{labor.name}</p>
        <p className="text-xs text-gray-500">{catName}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-0.5"><Star size={12} className="text-yellow-500" fill="#EAB308" /><span className="text-xs font-medium">{labor.rating || 'New'}</span></div>
          <span className="text-xs text-gray-400">{labor.expected_salary}</span>
        </div>
      </div>
      <div style={{ backgroundColor: color }} className="w-2 h-2 rounded-full flex-shrink-0" />
    </a>
  );
}

export default function LaborMap({ country, labors, lang = 'en' }: { country: string; labors: any[]; lang?: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  const center = countryCenters[country] || countryCenters.qa;
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [stats, setStats] = useState({ online: 0, total: 0, todayNew: 0 });
  const [showStats, setShowStats] = useState(true);
  const [showAreas, setShowAreas] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'online' | 'rated' | 'budget'>('all');
  const [areaSearch, setAreaSearch] = useState('');
  const [salaryRange, setSalaryRange] = useState({ min: 0, max: 10000 });
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [routeTo, setRouteTo] = useState<any>(null);
  const [showQR, setShowQR] = useState<any>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);

  // Initialize worker positions once
  useEffect(() => {
    labors.forEach(l => {
      if (!workerPositions[l.id]) {
        workerPositions[l.id] = {
          lat: center.lat + (Math.random() * 0.04 - 0.02),
          lng: center.lng + (Math.random() * 0.04 - 0.02)
        };
      }
    });
  }, [labors, center]);

  useEffect(() => {
    setMapKey(prev => prev + 1);
    loadStats();
    const channel = supabase.channel('map-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadStats())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [country]);

  useEffect(() => {
    const savedGps = localStorage.getItem('gps-enabled');
    if (savedGps === 'true') { setGpsEnabled(true); startGPSTracking(); }
    const saved = localStorage.getItem('bookmarked-workers');
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  const startGPSTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }
  };

  const toggleGPS = () => {
    const next = !gpsEnabled;
    setGpsEnabled(next);
    localStorage.setItem('gps-enabled', String(next));
    if (next) startGPSTracking(); else { setUserLocation(null); setRouteTo(null); }
  };

  const loadStats = async () => {
    const { count: total } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('country', country);
    const { count: online } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('country', country).eq('is_online', true);
    setStats({ online: online || 0, total: total || 0, todayNew: Math.floor(Math.random() * 20) });
  };

  const toggleBookmark = (id: string) => {
    const updated = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(updated); localStorage.setItem('bookmarked-workers', JSON.stringify(updated));
  };

  const shareLocation = (labor: any) => {
    const text = `${labor.name} - ${labor.category}\n${labor.expected_salary}`;
    if (navigator.share) navigator.share({ title: labor.name, text });
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const searchArea = async () => {
    if (!areaSearch.trim()) return;
    setSearching(true);
    const areas = center.areas || [];
    const found = areas.find(a => a.name.toLowerCase().includes(areaSearch.toLowerCase()));
    if (found) {
      setFlyTo({ lat: found.lat, lng: found.lng, zoom: 14 });
      setSearchResults([{ name: found.name, lat: found.lat, lng: found.lng }]);
    } else {
      const { data } = await supabase.from('profiles').select('*').or(`area.ilike.%${areaSearch}%,city.ilike.%${areaSearch}%`).limit(5);
      if (data?.length) { setSearchResults(data); setFlyTo({ lat: center.lat + 0.01, lng: center.lng + 0.01, zoom: 13 }); }
      else { setSearchResults([]); }
    }
    setSearching(false);
  };

  let filteredLabors = labors;
  if (filter === 'online') filteredLabors = labors.filter(l => l.is_online);
  if (filter === 'rated') filteredLabors = labors.filter(l => (l.rating || 0) >= 4);
  if (filter === 'budget') filteredLabors = labors.filter(l => {
    const s = parseInt((l.expected_salary || '0').replace(/[^0-9]/g, ''));
    return s >= salaryRange.min && s <= salaryRange.max;
  });
  
  // Distance filter - FIXED
  if (distanceFilter && userLocation) {
    filteredLabors = filteredLabors.filter(l => {
      const pos = workerPositions[l.id];
      if (!pos) return true;
      const dist = getDistanceFromCoords(userLocation.lat, userLocation.lng, pos.lat, pos.lng);
      return dist <= distanceFilter;
    });
  }

  // Route line - FIXED
  const routeLine = routeTo && userLocation && gpsEnabled 
    ? [[userLocation.lat, userLocation.lng], [workerPositions[routeTo.id]?.lat || center.lat + 0.02, workerPositions[routeTo.id]?.lng || center.lng + 0.02]] as [number, number][]
    : null;

  return (
    <div className="relative">
      {/* Glass Stats Card */}
      {showStats && viewMode === 'map' && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden w-[140px] md:w-[180px]">
          <div className="px-2 md:px-3 py-1.5 md:py-2 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 md:gap-1.5">
                <div className="w-6 h-6 md:w-7 md:h-7 bg-green-100 rounded-full flex items-center justify-center"><Users size={12} className="text-green-600" /></div>
                <div><p className="text-sm md:text-base font-bold text-gray-800">{stats.online}</p><p className="text-[8px] md:text-[9px] text-gray-500">{t('online')}</p></div>
              </div>
              <button onClick={() => setShowStats(false)} className="p-0.5"><X size={10} className="text-gray-400" /></button>
            </div>
            <div className="flex gap-1 md:gap-2 text-[9px] md:text-[10px] mt-0.5 md:mt-1">
              <span className="text-gray-500">Total: <b>{stats.total}</b></span>
              <span className="text-green-500">+{stats.todayNew}</span>
            </div>
          </div>
          {showAreas && (
            <div className="px-2 md:px-3 py-1 md:py-1.5 max-h-24 md:max-h-28 overflow-y-auto">
              {Object.entries(areaWorkerCounts[country] || {}).slice(0, 5).map(([area, count]) => (
                <div key={area} className="flex justify-between text-[9px] md:text-[10px] py-0.5 border-b last:border-0"><span className="text-gray-600">{area}</span><span className="font-medium">{count}</span></div>
              ))}
            </div>
          )}
          <div className="px-2 md:px-3 py-1 md:py-1.5 text-[9px] md:text-[10px] text-gray-500 flex items-center justify-between">
            <span className="flex items-center gap-1"><MapPin size={8} className="text-orange-500" /> {center.name}</span>
            <button onClick={() => setShowAreas(!showAreas)} className="text-orange-600 font-medium">{showAreas ? 'Hide' : 'Areas'}</button>
          </div>
        </div>
      )}

      {/* Top Bar - Mobile Responsive */}
      <div className="absolute top-3 right-3 left-[100px] md:left-[200px] z-[1000]">
        <div className="flex flex-col gap-1 md:gap-1.5 items-end">
          
          {/* Row 1: Map/List + GPS + Clear Route */}
          <div className="flex items-center gap-1">
            <div className="flex bg-white shadow-md rounded-lg p-0.5">
              <button onClick={() => setViewMode('map')} className={`px-1.5 md:px-2.5 py-1 md:py-1.5 text-[10px] md:text-[11px] font-medium rounded-md flex items-center gap-0.5 md:gap-1 transition-colors ${viewMode==='map'?'bg-blue-600 text-white':''}`}>
                <MapIcon size={10} /> <span className="hidden sm:inline">Map</span>
              </button>
              <button onClick={() => setViewMode('list')} className={`px-1.5 md:px-2.5 py-1 md:py-1.5 text-[10px] md:text-[11px] font-medium rounded-md flex items-center gap-0.5 md:gap-1 transition-colors ${viewMode==='list'?'bg-blue-600 text-white':''}`}>
                <List size={10} /> <span className="hidden sm:inline">List</span>
              </button>
            </div>
            <button onClick={toggleGPS} className={`rounded-lg px-1.5 md:px-3 py-1 md:py-1.5 text-[10px] md:text-[11px] font-medium flex items-center gap-1 whitespace-nowrap shadow-md ${gpsEnabled ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>
              {gpsEnabled ? <Wifi size={10} /> : <WifiOff size={10} />} <span className="hidden sm:inline">GPS {gpsEnabled ? 'ON' : 'OFF'}</span>
            </button>
            {/* Clear Route Button */}
            {routeTo && (
              <button onClick={() => setRouteTo(null)} className="rounded-lg px-1.5 md:px-2 py-1 md:py-1.5 text-[10px] md:text-[11px] font-medium bg-red-50 text-red-500 border border-red-200 flex items-center gap-1 shadow-md whitespace-nowrap">
                <X size={10} /> <span className="hidden sm:inline">Clear Route</span>
              </button>
            )}
          </div>

          {/* Row 2: Filter Buttons */}
          <div className="flex bg-white shadow-md rounded-lg p-0.5 overflow-x-auto max-w-[250px] md:max-w-none">
            <button onClick={() => setFilter('all')} className={`px-1.5 md:px-2.5 py-1 md:py-1.5 text-[10px] md:text-[11px] font-medium rounded-md flex items-center gap-0.5 md:gap-1 whitespace-nowrap transition-colors ${filter==='all'?'bg-orange-600 text-white':''}`}><Filter size={10} /> All</button>
            <button onClick={() => setFilter('online')} className={`px-1.5 md:px-2.5 py-1 md:py-1.5 text-[10px] md:text-[11px] font-medium rounded-md flex items-center gap-0.5 md:gap-1 whitespace-nowrap transition-colors ${filter==='online'?'bg-orange-600 text-white':''}`}><Zap size={10} /> {t('online')}</button>
            <button onClick={() => setFilter('rated')} className={`px-1.5 md:px-2.5 py-1 md:py-1.5 text-[10px] md:text-[11px] font-medium rounded-md flex items-center gap-0.5 md:gap-1 whitespace-nowrap transition-colors ${filter==='rated'?'bg-orange-600 text-white':''}`}><Star size={10} /> 4+</button>
            <button onClick={() => setFilter('budget')} className={`px-1.5 md:px-2.5 py-1 md:py-1.5 text-[10px] md:text-[11px] font-medium rounded-md flex items-center gap-0.5 md:gap-1 whitespace-nowrap transition-colors ${filter==='budget'?'bg-orange-600 text-white':''}`}><DollarSign size={10} /> Budget</button>
          </div>

          {/* Row 3: Distance + Area Search */}
          <div className="flex items-center gap-1">
            <div className="flex bg-white shadow-md rounded-lg p-0.5">
              <button onClick={() => setDistanceFilter(null)} className={`px-1 md:px-2 py-0.5 md:py-1 text-[9px] md:text-[10px] font-medium rounded-md transition-colors whitespace-nowrap ${distanceFilter===null?'bg-green-600 text-white':''}`}>All</button>
              <button onClick={() => setDistanceFilter(5)} className={`px-1 md:px-2 py-0.5 md:py-1 text-[9px] md:text-[10px] font-medium rounded-md transition-colors whitespace-nowrap ${distanceFilter===5?'bg-green-600 text-white':''}`}>5km</button>
              <button onClick={() => setDistanceFilter(10)} className={`px-1 md:px-2 py-0.5 md:py-1 text-[9px] md:text-[10px] font-medium rounded-md transition-colors whitespace-nowrap ${distanceFilter===10?'bg-green-600 text-white':''}`}>10km</button>
              <button onClick={() => setDistanceFilter(20)} className={`px-1 md:px-2 py-0.5 md:py-1 text-[9px] md:text-[10px] font-medium rounded-md transition-colors whitespace-nowrap ${distanceFilter===20?'bg-green-600 text-white':''}`}>20km</button>
            </div>
            <div className="flex items-center bg-white shadow-md rounded-lg overflow-hidden">
              <input value={areaSearch} onChange={e => setAreaSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchArea()} placeholder="Area..." className="w-14 md:w-32 px-1.5 md:px-3 py-1 md:py-1.5 text-[10px] md:text-[11px] outline-none" />
              <button onClick={searchArea} className="px-1.5 md:px-3 py-1 md:py-1.5 bg-orange-600 text-white hover:bg-orange-700 transition-colors">
                {searching ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> : <Search size={11} />}
              </button>
            </div>
          </div>

          {/* Row 4: Budget Range */}
          {filter === 'budget' && (
            <div className="flex items-center gap-1 bg-white shadow-md rounded-lg px-1.5 md:px-2 py-0.5 md:py-1">
              <input type="number" placeholder="Min" value={salaryRange.min||''} onChange={e=>setSalaryRange({...salaryRange,min:+e.target.value})} className="w-10 md:w-14 px-1 md:px-1.5 py-0.5 md:py-1 text-[10px] md:text-[11px] border rounded outline-none" />
              <span className="text-gray-400 text-[10px]">-</span>
              <input type="number" placeholder="Max" value={salaryRange.max||''} onChange={e=>setSalaryRange({...salaryRange,max:+e.target.value})} className="w-10 md:w-14 px-1 md:px-1.5 py-0.5 md:py-1 text-[10px] md:text-[11px] border rounded outline-none" />
            </div>
          )}

          {/* Row 5: Search Results */}
          {searchResults.length > 0 && areaSearch && (
            <div className="bg-white shadow-md rounded-lg p-1 md:p-1.5 max-w-[160px] md:max-w-[200px] max-h-24 md:max-h-28 overflow-y-auto text-[9px] md:text-[11px]">
              {searchResults.map((r:any,i:number)=>(
                <div key={i} className="px-1.5 md:px-2 py-0.5 md:py-1 hover:bg-gray-50 rounded cursor-pointer transition-colors" onClick={()=>setFlyTo({lat:r.lat||center.lat,lng:r.lng||center.lng,zoom:14})}>
                  <span className="font-medium">{r.name||r.area}</span>
                  {r.category&&<span className="text-gray-400 ml-0.5 md:ml-1">- {r.category}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Collapsed Stats Button */}
      {!showStats && viewMode === 'map' && (
        <button onClick={() => setShowStats(true)} className="absolute top-3 left-3 z-[1000] bg-white rounded-xl px-2 md:px-3 py-1.5 md:py-2 shadow-md text-[10px] md:text-xs font-medium flex items-center gap-1">
          <Zap size={12} className="text-green-500" /> {stats.online} <span className="hidden sm:inline">{t('online')}</span>
        </button>
      )}

      {/* Bottom Sheet - Worker Details */}
      {selectedWorker && viewMode === 'map' && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white rounded-2xl shadow-2xl p-3 md:p-4 animate-slide-up max-w-md mx-auto">
          <div className="flex justify-between items-start mb-2 md:mb-3">
            <span className="text-[10px] md:text-xs text-gray-400 font-medium">Worker Details</span>
            <div className="flex gap-0.5 md:gap-1">
              <button onClick={() => toggleBookmark(selectedWorker.id)} className={`p-1 md:p-1.5 rounded-lg ${bookmarks.includes(selectedWorker.id) ? 'bg-yellow-50 text-yellow-500' : 'bg-gray-50 text-gray-400'}`}><Bookmark size={14} fill={bookmarks.includes(selectedWorker.id) ? '#EAB308' : 'none'} /></button>
              <button onClick={() => shareLocation(selectedWorker)} className="p-1 md:p-1.5 rounded-lg bg-gray-50 text-gray-400"><Share2 size={14} /></button>
              <button onClick={() => setShowQR(selectedWorker)} className="p-1 md:p-1.5 rounded-lg bg-gray-50 text-gray-400"><QrCode size={14} /></button>
              {/* Route Button - FIXED: does NOT close popup */}
              <button 
                onClick={() => { setRouteTo(selectedWorker); }} 
                className={`p-1 md:p-1.5 rounded-lg ${routeTo?.id === selectedWorker.id ? 'bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-500'}`}
              >
                <Route size={14} />
              </button>
              <button onClick={() => setSelectedWorker(null)} className="p-1 md:p-1.5 rounded-lg bg-gray-50 text-gray-400"><X size={14} /></button>
            </div>
          </div>
          <WorkerPopup labor={selectedWorker} country={country} userLocation={userLocation} lang={lang} />
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/50" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-2xl p-4 md:p-6 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-2">{showQR.name}</h3>
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-xl mx-auto mb-2 flex items-center justify-center"><QrCode size={60} className="text-gray-800" /></div>
            <p className="text-xs text-gray-500">Scan to view profile</p>
            <button onClick={() => setShowQR(null)} className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden border">
          <MapContainer key={mapKey} center={[center.lat, center.lng]} zoom={center.zoom} className="w-full h-full" zoomControl={false} ref={(mapRef) => { if (mapRef) (mapRef as any)._leaflet_map = mapRef; }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {flyTo && <FlyToLocation lat={flyTo.lat} lng={flyTo.lng} zoom={flyTo.zoom} />}
            {/* Route Line - FIXED */}
            {routeLine && <Polyline positions={routeLine} pathOptions={{ color: '#3B82F6', weight: 3, dashArray: '10 10' }} />}
            <CircleMarker center={[center.lat, center.lng]} radius={6} pathOptions={{ color: '#EA580C', fillColor: '#EA580C', fillOpacity: 0.6 }} />

            {showAreas && Object.entries(areaWorkerCounts[country] || {}).slice(0, 7).map(([area, count], i) => {
              const areaData = (center.areas || []).find(a => a.name === area);
              const aLat = areaData?.lat || center.lat + (Math.cos(i * 1.2) * 0.03);
              const aLng = areaData?.lng || center.lng + (Math.sin(i * 1.2) * 0.03);
              return <Circle key={area} center={[aLat, aLng]} radius={count * 15} pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.2 }} />;
            })}

            {gpsEnabled && userLocation && filteredLabors.filter(l => l.is_online).slice(0, 10).map((l: any) => {
              const pos = workerPositions[l.id] || { lat: userLocation.lat + (Math.random() * 0.02 - 0.01), lng: userLocation.lng + (Math.random() * 0.02 - 0.01) };
              const color = categoryColors[l.category] || '#6B7280';
              return <CircleMarker key={`live-${l.id}`} center={[pos.lat, pos.lng]} radius={5} pathOptions={{ color: color, fillColor: color, fillOpacity: 0.9 }} eventHandlers={{ click: () => setSelectedWorker(l) }} />;
            })}

            {filteredLabors.map((l: any) => {
              const pos = workerPositions[l.id] || { lat: center.lat + (Math.random() * 0.04 - 0.02), lng: center.lng + (Math.random() * 0.04 - 0.02) };
              const color = categoryColors[l.category] || '#6B7280';
              return <CircleMarker key={l.id} center={[pos.lat, pos.lng]} radius={l.is_online ? 7 : 5} pathOptions={{ color: color, fillColor: color, fillOpacity: l.is_online ? 0.7 : 0.3 }} eventHandlers={{ click: () => setSelectedWorker(l) }} />;
            })}

            {gpsEnabled && userLocation && (
              <>
                <Circle center={[userLocation.lat, userLocation.lng]} radius={500} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1 }} />
                <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={5} pathOptions={{ color: '#fff', fillColor: '#3B82F6', fillOpacity: 1 }} />
              </>
            )}
          </MapContainer>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden border bg-gray-50">
          <div className="h-full overflow-y-auto p-3 md:p-4 space-y-1.5 md:space-y-2">
            <div className="bg-white rounded-xl p-2 md:p-3 shadow-sm mb-2 md:mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-0.5 md:gap-1"><Users size={14} className="text-green-600" /><span className="font-bold text-sm">{stats.online}</span><span className="text-[10px] md:text-xs text-gray-500">{t('online')}</span></div>
                <div className="text-[10px] md:text-xs text-gray-400">Total: {stats.total}</div>
              </div>
              <span className="text-[10px] md:text-xs text-gray-400">{filteredLabors.length} workers</span>
            </div>
            {filteredLabors.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MapPin size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No workers found</p>
              </div>
            ) : (
              filteredLabors.map((labor: any) => (
                <WorkerListItem key={labor.id} labor={labor} country={country} lang={lang} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Mobile Legend Bar */}
      <div className="md:hidden fixed bottom-16 left-2 right-2 z-[1000] bg-white/90 backdrop-blur rounded-xl p-2 shadow-lg flex items-center justify-center gap-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Online</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> Offline</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> You</span>
      </div>
    </div>
  );
}