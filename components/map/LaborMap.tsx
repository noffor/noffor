// components/map/LaborMap.tsx
// 🚀 SUPERSONIC • BULLETPROOF • 10M USERS • ৪ ভাষা • কাতার ২৭ এরিয়া
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  X, Search, Zap, DollarSign, Users, MapPin, List, MapIcon, 
  Bookmark, Share2, QrCode, Route, Star, 
  Loader, SlidersHorizontal, RefreshCw, Building2,
  Crosshair, Navigation, Compass, ChevronDown
} from 'lucide-react';
import { getText, LangCode, translateCategory, translateNumber, getCurrencySymbol } from '@/lib/language';
import MarkerPopup from '@/components/map/MarkerPopup';
import 'leaflet/dist/leaflet.css';

// ==================== DYNAMIC IMPORTS ====================
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

// ==================== TYPES ====================
type Area = { name: string; lat: number; lng: number; radius: number };
type CountryCenter = { lat: number; lng: number; zoom: number; name: string; areas: Area[] };
type WorkerPosition = { lat: number; lng: number };

// ==================== LRU CACHE (10M Safe) ====================
class LRUCache<V> {
  private max: number;
  private map = new Map<string, V>();
  constructor(max: number) { this.max = max; }
  get(key: string): V | undefined { const v = this.map.get(key); if (v !== undefined) { this.map.delete(key); this.map.set(key, v); } return v; }
  set(key: string, val: V): void { if (this.map.size >= this.max) { const first = this.map.keys().next().value; if (first) this.map.delete(first); } this.map.set(key, val); }
  clear(): void { this.map.clear(); }
}
const posCache = new LRUCache<WorkerPosition>(200);
const distCache = new LRUCache<number>(500);

// ==================== FAST MATH ====================
function calcDist(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const key = `${lat1.toFixed(4)},${lng1.toFixed(4)},${lat2.toFixed(4)},${lng2.toFixed(4)}`;
  const cached = distCache.get(key);
  if (cached !== undefined) return cached;
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  const d = R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  distCache.set(key, d); return d;
}

// ==================== LOCATION DETECTION ====================
async function detectFromIP(): Promise<WorkerPosition & { city?: string } | null> {
  try { const c=new AbortController(); setTimeout(()=>c.abort(),3000); const r=await fetch('https://ipapi.co/json/',{signal:c.signal}); const d=await r.json(); return d?.latitude?{lat:d.latitude,lng:d.longitude,city:d.city}:null; } catch { return null; }
}

async function detectFromBrowser(): Promise<WorkerPosition | null> {
  return new Promise(r => { if (typeof window==='undefined'||!navigator.geolocation) return r(null); navigator.geolocation.getCurrentPosition(p=>r({lat:p.coords.latitude,lng:p.coords.longitude}),()=>r(null),{timeout:5000,maximumAge:300000,enableHighAccuracy:false}); });
}

async function autoDetectLocation(areas: Area[]): Promise<{ userLoc: WorkerPosition; distFilter: number; area: string; source: string } | null> {
  try { const s=localStorage.getItem('pref-area'); if (s) { const f=areas.find(a=>a.name===s); if (f) return { userLoc:{lat:f.lat,lng:f.lng}, distFilter:f.radius, area:f.name, source:'saved' }; } } catch {}
  const ip = await detectFromIP();
  if (ip) { let nearest: Area & {distance:number} | null = null; let min = Infinity; for (const a of areas) { const d = calcDist(ip.lat, ip.lng, a.lat, a.lng); if (d<min && d<100) { min=d; nearest = {...a, distance:d}; } } if (nearest) return { userLoc:{lat:ip.lat,lng:ip.lng}, distFilter:nearest.radius, area:nearest.name, source:'ip' }; }
  const gps = await detectFromBrowser();
  if (gps) { let nearest: Area & {distance:number} | null = null; let min = Infinity; for (const a of areas) { const d = calcDist(gps.lat, gps.lng, a.lat, a.lng); if (d<min && d<50) { min=d; nearest = {...a, distance:d}; } } if (nearest) return { userLoc:{lat:gps.lat,lng:gps.lng}, distFilter:nearest.radius, area:nearest.name, source:'gps' }; }
  return null;
}

// ==================== কাতার এরিয়া ট্রান্সলেশন (৪ ভাষা) ====================
const qatarAreaTranslations: Record<string, Record<string, string>> = {
  en: {
    'All Qatar':'All Qatar','Doha':'Doha','Al Rayyan':'Al Rayyan','Al Wakrah':'Al Wakrah',
    'Al Khor':'Al Khor','Industrial Area':'Industrial Area','Lusail':'Lusail','Al Sadd':'Al Sadd',
    'West Bay':'West Bay','The Pearl':'The Pearl','Msheireb':'Msheireb','Al Gharrafa':'Al Gharrafa',
    'Umm Salal':'Umm Salal','Al Shahaniya':'Al Shahaniya','Al Daayen':'Al Daayen','Madinat Khalifa':'Madinat Khalifa',
    'Al Mamoura':'Al Mamoura','Najma':'Najma','Old Airport':'Old Airport','Al Thumama':'Al Thumama',
    'Abu Hamour':'Abu Hamour','Al Wajba':'Al Wajba','Al Wukair':'Al Wukair','Mesaieed':'Mesaieed',
    'Dukhan':'Dukhan','Al Ruwais':'Al Ruwais','Al Zubarah':'Al Zubarah','Fuwayrit':'Fuwayrit',
  },
  bn: {
    'All Qatar':'সম্পূর্ণ কাতার','Doha':'দোহা','Al Rayyan':'আল রাইয়ান','Al Wakrah':'আল ওয়াকরাহ',
    'Al Khor':'আল খোর','Industrial Area':'শিল্প এলাকা','Lusail':'লুসাইল','Al Sadd':'আল সাদ্দ',
    'West Bay':'ওয়েস্ট বে','The Pearl':'দ্য পার্ল','Msheireb':'মুশাইরেব','Al Gharrafa':'আল গাররাফা',
    'Umm Salal':'উম্ম সালাল','Al Shahaniya':'আল শাহানিয়া','Al Daayen':'আল দায়েন','Madinat Khalifa':'মদিনাত খলিফা',
    'Al Mamoura':'আল মামুরা','Najma':'নাজমা','Old Airport':'ওল্ড এয়ারপোর্ট','Al Thumama':'আল থুমামা',
    'Abu Hamour':'আবু হামুর','Al Wajba':'আল ওয়াজবা','Al Wukair':'আল উকাইর','Mesaieed':'মেসাইদ',
    'Dukhan':'দুখান','Al Ruwais':'আল রুওয়াইস','Al Zubarah':'আল যুবারা','Fuwayrit':'ফুওয়াইরিত',
  },
  ar: {
    'All Qatar':'كل قطر','Doha':'الدوحة','Al Rayyan':'الريان','Al Wakrah':'الوكرة',
    'Al Khor':'الخور','Industrial Area':'المنطقة الصناعية','Lusail':'لوسيل','Al Sadd':'السد',
    'West Bay':'الخليج الغربي','The Pearl':'اللؤلؤة','Msheireb':'مشيرب','Al Gharrafa':'الغرافة',
    'Umm Salal':'أم صلال','Al Shahaniya':'الشحانية','Al Daayen':'الضعاين','Madinat Khalifa':'مدينة خليفة',
    'Al Mamoura':'المعمورة','Najma':'نجمة','Old Airport':'المطار القديم','Al Thumama':'الثمامة',
    'Abu Hamour':'أبو هامور','Al Wajba':'الوجبة','Al Wukair':'الوكير','Mesaieed':'مسيعيد',
    'Dukhan':'دخان','Al Ruwais':'الرويس','Al Zubarah':'الزبارة','Fuwayrit':'فويرط',
  },
  hi: {
    'All Qatar':'संपूर्ण कतर','Doha':'दोहा','Al Rayyan':'अल रय्यान','Al Wakrah':'अल वकराह',
    'Al Khor':'अल खोर','Industrial Area':'औद्योगिक क्षेत्र','Lusail':'लुसैल','Al Sadd':'अल सद्द',
    'West Bay':'वेस्ट बे','The Pearl':'द पर्ल','Msheireb':'मुशैरेब','Al Gharrafa':'अल गर्राफा',
    'Umm Salal':'उम्म सलाल','Al Shahaniya':'अल शहानिया','Al Daayen':'अल दायेन','Madinat Khalifa':'मदिनत खलीफा',
    'Al Mamoura':'अल ममौरा','Najma':'नजमा','Old Airport':'ओल्ड एयरपोर्ट','Al Thumama':'अल थुमामा',
    'Abu Hamour':'अबू हमूर','Al Wajba':'अल वजबा','Al Wukair':'अल वुकैर','Mesaieed':'मेसाईद',
    'Dukhan':'दुखान','Al Ruwais':'अल रुवैस','Al Zubarah':'अल जुबारा','Fuwayrit':'फुवैरित',
  },
};
const areaTranslations: Record<string, Record<string, string>> = { ...qatarAreaTranslations };
function getAreaName(name: string, lang: string): string { return areaTranslations[lang]?.[name] || areaTranslations['en']?.[name] || name; }

// ==================== কাতার এরিয়া ====================
const qatarAreas: Area[] = [
  { name: 'Doha', lat: 25.2854, lng: 51.5310, radius: 8 },
  { name: 'Al Rayyan', lat: 25.2920, lng: 51.4240, radius: 7 },
  { name: 'Al Wakrah', lat: 25.1667, lng: 51.6000, radius: 6 },
  { name: 'Al Khor', lat: 25.6833, lng: 51.5000, radius: 5 },
  { name: 'Industrial Area', lat: 25.2134, lng: 51.4865, radius: 4 },
  { name: 'Lusail', lat: 25.4220, lng: 51.5080, radius: 8 },
  { name: 'Al Sadd', lat: 25.2820, lng: 51.5020, radius: 3 },
  { name: 'West Bay', lat: 25.3250, lng: 51.5300, radius: 4 },
  { name: 'The Pearl', lat: 25.3680, lng: 51.5520, radius: 3 },
  { name: 'Msheireb', lat: 25.2830, lng: 51.5270, radius: 2 },
  { name: 'Al Gharrafa', lat: 25.3300, lng: 51.4400, radius: 5 },
  { name: 'Umm Salal', lat: 25.4700, lng: 51.3900, radius: 6 },
  { name: 'Al Shahaniya', lat: 25.3700, lng: 51.2200, radius: 8 },
  { name: 'Al Daayen', lat: 25.5800, lng: 51.4600, radius: 7 },
  { name: 'Madinat Khalifa', lat: 25.3100, lng: 51.4800, radius: 3 },
  { name: 'Al Mamoura', lat: 25.2600, lng: 51.5500, radius: 3 },
  { name: 'Najma', lat: 25.2650, lng: 51.5550, radius: 2 },
  { name: 'Old Airport', lat: 25.2500, lng: 51.5650, radius: 3 },
  { name: 'Al Thumama', lat: 25.2300, lng: 51.5600, radius: 4 },
  { name: 'Abu Hamour', lat: 25.2300, lng: 51.4900, radius: 4 },
  { name: 'Al Wajba', lat: 25.2600, lng: 51.3800, radius: 5 },
  { name: 'Al Wukair', lat: 25.1500, lng: 51.5700, radius: 4 },
  { name: 'Mesaieed', lat: 24.9800, lng: 51.5500, radius: 6 },
  { name: 'Dukhan', lat: 25.4300, lng: 50.7900, radius: 5 },
  { name: 'Al Ruwais', lat: 26.1400, lng: 51.2100, radius: 4 },
  { name: 'Al Zubarah', lat: 25.9800, lng: 51.0300, radius: 4 },
  { name: 'Fuwayrit', lat: 26.0200, lng: 51.3700, radius: 3 },
];

const otherCountries: Record<string, CountryCenter> = {
  sa: { lat:24.7136,lng:46.6753,zoom:6,name:'Saudi Arabia',areas:[{name:'Riyadh',lat:24.7136,lng:46.6753,radius:15},{name:'Jeddah',lat:21.5433,lng:39.1728,radius:12}] },
  ae: { lat:25.2048,lng:55.2708,zoom:8,name:'UAE',areas:[{name:'Dubai',lat:25.2048,lng:55.2708,radius:12}] },
  kw: { lat:29.3759,lng:47.9774,zoom:10,name:'Kuwait',areas:[{name:'Kuwait City',lat:29.3759,lng:47.9774,radius:8}] },
  om: { lat:23.5880,lng:58.3829,zoom:7,name:'Oman',areas:[{name:'Muscat',lat:23.5880,lng:58.3829,radius:10}] },
  bh: { lat:26.0667,lng:50.5577,zoom:11,name:'Bahrain',areas:[{name:'Manama',lat:26.2285,lng:50.5860,radius:6}] },
};

const countryCenters: Record<string, CountryCenter> = {
  qa: { lat:25.2867, lng:51.5333, zoom:11, name:'Qatar', areas: qatarAreas },
  ...otherCountries,
};

const categoryColors: Record<string,string> = { Driver:'#3B82F6',Electrician:'#F59E0B',Plumber:'#10B981',Mason:'#8B5CF6','AC Technician':'#06B6D4',Painter:'#EC4899',Carpenter:'#F97316',Welder:'#6366F1',Cleaner:'#14B8A6',Cook:'#EF4444',Helper:'#84CC16',Gardener:'#22D3EE' };

// ==================== MAIN COMPONENT ====================
export default function LaborMap({ country, labors, lang = 'en', category = 'all', distance = 'all' }: { 
  country: string; labors: any[]; lang?: string; category?: string; distance?: string;
}) {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const aliveRef = useRef(true);
  const autoDone = useRef(false);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);
  const gpsWatch = useRef<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const center = useMemo(() => countryCenters[country] || countryCenters.qa, [country]);
  const areas = useMemo(() => center.areas || [], [center]);

  // ==================== STATE ====================
  const [userLoc, setUserLoc] = useState<WorkerPosition | null>(null);
  const [gpsOn, setGpsOn] = useState(false);
  const [distFilter, setDistFilter] = useState<number>(distance !== 'all' ? parseInt(distance) : 5);
  const [mapKey, setMapKey] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState<'all'|'online'|'rated'|'budget'>('all');
  const [salaryRange] = useState({ min:0, max:10000 });
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [routeTo, setRouteTo] = useState<any>(null);
  const [showQR, setShowQR] = useState<any>(null);
  const [flyTo, setFlyTo] = useState<{lat:number;lng:number;zoom:number}|null>(null);
  const [viewMode, setViewMode] = useState<'map'|'list'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [showPills, setShowPills] = useState(false);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [detectedArea, setDetectedArea] = useState<string | null>(null);
  const [detectSource, setDetectSource] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [bounds, setBounds] = useState<any>(null);
  const [zoom, setZoom] = useState(center.zoom);
  const [areaCounts, setAreaCounts] = useState<Record<string,number>>({});
  const [isDetecting, setIsDetecting] = useState(true);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [realLocs, setRealLocs] = useState<Map<string,WorkerPosition>>(new Map());
  const [areaSearch, setAreaSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Area[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => { if (distance !== 'all') setDistFilter(parseInt(distance)); }, [distance]);

  // ==================== TRANSLATIONS (ALL HARDCODED - NO getText DEPENDENCY) ====================
  const T = useMemo(() => {
    const trans: Record<string, Record<string, string>> = {
      en: {
        workers:'Workers',noWorkers:'No workers',details:'Worker Details',new:'New',
        online:'Online',all:'All',rated:'Top Rated',budget:'Budget',gps:'GPS',
        mapMode:'Map',listMode:'List',areas:'Areas',allAreas:'All Areas',
        allQatar:'All Qatar',showing:'Showing',nowShowing:'Now Showing',
        within:'within',km:'km',scanQR:'Scan QR',close:'Close',
        loading:'Loading map...',refresh:'Refresh',route:'Route',share:'Share',
        bookmark:'Bookmark',distance:'Distance',yourLocation:'Your Location',
        detecting:'Detecting location...',gpsOn:'GPS On',gpsOff:'GPS Off',
        searchPlaceholder:'Search area...',noResults:'No results found',
        filters:'Filters',nearby:'nearby',
      },
      bn: {
        workers:'শ্রমিক',noWorkers:'কোনো শ্রমিক নেই',details:'শ্রমিকের বিবরণ',new:'নতুন',
        online:'অনলাইন',all:'সব',rated:'শীর্ষ রেটেড',budget:'বাজেট',gps:'জিপিএস',
        mapMode:'ম্যাপ',listMode:'তালিকা',areas:'এলাকা',allAreas:'সব এলাকা',
        allQatar:'সম্পূর্ণ কাতার',showing:'দেখানো হচ্ছে',nowShowing:'বর্তমানে দেখানো হচ্ছে',
        within:'এর মধ্যে',km:'কিমি',scanQR:'কিউআর স্ক্যান',close:'বন্ধ',
        loading:'ম্যাপ লোড হচ্ছে...',refresh:'রিফ্রেশ',route:'রুট',share:'শেয়ার',
        bookmark:'বুকমার্ক',distance:'দূরত্ব',yourLocation:'আপনার অবস্থান',
        detecting:'লোকেশন শনাক্ত হচ্ছে...',gpsOn:'জিপিএস চালু',gpsOff:'জিপিএস বন্ধ',
        searchPlaceholder:'এলাকা খুঁজুন...',noResults:'কোনো ফলাফল পাওয়া যায়নি',
        filters:'ফিল্টার',nearby:'আশেপাশে',
      },
      ar: {
        workers:'عمال',noWorkers:'لا يوجد عمال',details:'تفاصيل العامل',new:'جديد',
        online:'متصل',all:'الكل',rated:'الأعلى تقييماً',budget:'الميزانية',gps:'نظام تحديد المواقع',
        mapMode:'خريطة',listMode:'قائمة',areas:'مناطق',allAreas:'كل المناطق',
        allQatar:'كل قطر',showing:'عرض',nowShowing:'يعرض الآن',
        within:'ضمن',km:'كم',scanQR:'مسح QR',close:'إغلاق',
        loading:'جاري تحميل الخريطة...',refresh:'تحديث',route:'طريق',share:'مشاركة',
        bookmark:'حفظ',distance:'المسافة',yourLocation:'موقعك',
        detecting:'جاري تحديد الموقع...',gpsOn:'GPS تشغيل',gpsOff:'GPS إيقاف',
        searchPlaceholder:'ابحث عن منطقة...',noResults:'لا توجد نتائج',
        filters:'تصفية',nearby:'بالقرب',
      },
      hi: {
        workers:'श्रमिक',noWorkers:'कोई श्रमिक नहीं',details:'श्रमिक विवरण',new:'नया',
        online:'ऑनलाइन',all:'सभी',rated:'टॉप रेटेड',budget:'बजट',gps:'जीपीएस',
        mapMode:'नक्शा',listMode:'सूची',areas:'क्षेत्र',allAreas:'सभी क्षेत्र',
        allQatar:'संपूर्ण कतर',showing:'दिखा रहा है',nowShowing:'अभी दिखा रहा है',
        within:'के अंदर',km:'किमी',scanQR:'QR स्कैन',close:'बंद',
        loading:'नक्शा लोड हो रहा है...',refresh:'रिफ्रेश',route:'रास्ता',share:'शेयर',
        bookmark:'बुकमार्क',distance:'दूरी',yourLocation:'आपका स्थान',
        detecting:'स्थान पहचान रहा है...',gpsOn:'जीपीएस चालू',gpsOff:'जीपीएस बंद',
        searchPlaceholder:'क्षेत्र खोजें...',noResults:'कोई परिणाम नहीं',
        filters:'फिल्टर',nearby:'आसपास',
      },
    };
    return trans[lang] || trans.en;
  }, [lang]);

  // ==================== TOAST ====================
  const showToast = useCallback((m: string) => {
    setToastMsg(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => { if (aliveRef.current) setToastMsg(null); }, 2500);
  }, []);

  // ==================== FETCH REAL LOCATIONS ====================
  useEffect(() => {
    let active = true;
    const fetchLocs = async () => {
      try {
        const { data } = await supabase.from('worker_locations').select('worker_id,latitude,longitude,is_online').eq('is_online',true).limit(300);
        if (data && active) {
          const m = new Map<string,WorkerPosition>();
          data.forEach((loc:any) => { if (loc.latitude&&loc.longitude) m.set(loc.worker_id,{lat:loc.latitude,lng:loc.longitude}); });
          setRealLocs(m);
        }
      } catch {}
    };
    fetchLocs();
    const interval = setInterval(fetchLocs, 60000);
    return () => { active=false; clearInterval(interval); };
  }, [country]);

  // ==================== AUTO DETECT ON LOAD ====================
  useEffect(() => {
    if (autoDone.current) return;
    autoDone.current = true;
    (async () => {
      setIsDetecting(true);
      const result = await autoDetectLocation(areas);
      if (!aliveRef.current) return;
      if (result) {
        setUserLoc(result.userLoc);
        setDistFilter(result.distFilter);
        setActiveArea(result.area);
        setDetectedArea(result.area);
        setDetectSource(result.source);
        setFlyTo({ lat: result.userLoc.lat, lng: result.userLoc.lng, zoom: 14 });
        showToast(`📍 ${getAreaName(result.area, lang)} - ${result.distFilter}${T.km} ${T.within}`);
      }
      setIsDetecting(false);
    })();
    return () => { aliveRef.current = false; };
  }, []);

  // ==================== FLY TO EFFECT ====================
  useEffect(() => { if (!flyTo || !mapRef.current) return; mapRef.current.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom, { duration: 1.2 }); }, [flyTo]);

  // ==================== GPS TOGGLE ====================
  const toggleGPS = useCallback(() => {
    const next = !gpsOn; setGpsOn(next);
    localStorage.setItem('gps-enabled', String(next));
    if (next) {
      if (gpsWatch.current) navigator.geolocation.clearWatch(gpsWatch.current);
      gpsWatch.current = navigator.geolocation.watchPosition(p => { if (aliveRef.current) { setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); setDistFilter(5); setActiveArea(null); } }, () => {}, { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 });
      showToast(`🛰️ ${T.gpsOn}`);
    } else {
      if (gpsWatch.current) { navigator.geolocation.clearWatch(gpsWatch.current); gpsWatch.current = null; }
      detectFromIP().then(ip => { if (ip && aliveRef.current) { setUserLoc({ lat: ip.lat, lng: ip.lng }); setDistFilter(5); setActiveArea(null); } });
      showToast(`📍 ${T.gpsOff} (IP)`);
    }
  }, [gpsOn, T]);

  // ==================== AREA CHANGE ====================
  const changeArea = useCallback((areaName: string | null) => {
    setAreaSearch(''); setShowSuggestions(false);
    if (areaName) {
      const area = areas.find(a => a.name === areaName);
      if (area) {
        setActiveArea(area.name); setDetectedArea(area.name); setDetectSource('manual');
        setDistFilter(area.radius); setFlyTo({ lat: area.lat, lng: area.lng, zoom: 14 });
        try { localStorage.setItem('pref-area', area.name); } catch {}
        showToast(`${T.nowShowing}: ${getAreaName(area.name, lang)}`);
      }
    } else {
      setActiveArea(null); setDetectedArea(null); setDetectSource(null);
      setDistFilter(5); setFlyTo({ lat: center.lat, lng: center.lng, zoom: center.zoom });
      try { localStorage.removeItem('pref-area'); } catch {}
      showToast(`🗺️ ${T.allQatar}`);
    }
  }, [areas, center, lang, T]);

  // ==================== SEARCH WITH SUGGESTIONS ====================
  const handleSearchChange = useCallback((value: string) => {
    setAreaSearch(value);
    if (!value.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    const filtered = areas.filter(a => {
      const q = value.toLowerCase();
      return a.name.toLowerCase().includes(q) || (qatarAreaTranslations.bn[a.name]||'').toLowerCase().includes(q) || (qatarAreaTranslations.ar[a.name]||'').toLowerCase().includes(q) || (qatarAreaTranslations.hi[a.name]||'').toLowerCase().includes(q);
    });
    setSuggestions(filtered.slice(0, 6)); setShowSuggestions(true);
  }, [areas]);

  const selectSuggestion = useCallback((area: Area) => { changeArea(area.name); }, [changeArea]);

  // ==================== AREA COUNTS ====================
  useEffect(() => {
    if (!labors.length) return;
    const timer = setTimeout(() => {
      const counts: Record<string,number> = {};
      for (const a of areas) { let c=0; for (let i=0; i<Math.min(labors.length,2000); i++) { const pos=realLocs.get(labors[i].id)||posCache.get(labors[i].id); if (pos&&calcDist(pos.lat,pos.lng,a.lat,a.lng)<=a.radius+2) c++; } counts[a.name]=c; }
      setAreaCounts(counts);
    }, 800);
    return () => clearTimeout(timer);
  }, [labors.length, areas, realLocs]);

  // ==================== WORKER POSITION ====================
  const getWorkerPos = useCallback((id: string): WorkerPosition => {
    if (realLocs.has(id)) return realLocs.get(id)!;
    const cached = posCache.get(id); if (cached) return cached;
    let pos: WorkerPosition;
    if (areas.length>0) { const a=areas[Math.floor(Math.random()*areas.length)]; pos={ lat:a.lat+(Math.random()*0.03-0.015)*(a.radius/5), lng:a.lng+(Math.random()*0.03-0.015)*(a.radius/5) }; }
    else { pos={ lat:center.lat+(Math.random()*0.05-0.025), lng:center.lng+(Math.random()*0.05-0.025) }; }
    posCache.set(id, pos); return pos;
  }, [realLocs, areas, center]);

  // ==================== MAP READY ====================
  useEffect(() => { const tm=setTimeout(()=>{if(aliveRef.current)setMapReady(true);},200); return ()=>clearTimeout(tm); }, [mapKey]);
  useEffect(() => {
    if (!mapReady||!mapRef.current) return;
    const m=mapRef.current; let db: NodeJS.Timeout;
    const up=()=>{clearTimeout(db);db=setTimeout(()=>{if(aliveRef.current){setBounds({n:m.getBounds().getNorth(),s:m.getBounds().getSouth(),e:m.getBounds().getEast(),w:m.getBounds().getWest()});setZoom(m.getZoom());}},150);};
    m.on('moveend',up);m.on('zoomend',up);up();
    requestAnimationFrame(()=>m.invalidateSize());
    return ()=>{m.off('moveend',up);m.off('zoomend',up);clearTimeout(db);};
  }, [mapReady]);

  // ==================== BOOKMARKS ====================
  useEffect(() => { try { const s=localStorage.getItem('bookmarked-workers'); if (s) { const p=JSON.parse(s); if (Array.isArray(p)&&p.length<500) setBookmarks(p); } } catch {} }, []);
  const toggleBookmark = useCallback((id: string) => { setBookmarks(p => { const u=p.includes(id)?p.filter(b=>b!==id):[...p.slice(-199),id]; try{localStorage.setItem('bookmarked-workers',JSON.stringify(u));}catch{} return u; }); }, []);

  // ==================== FILTERED WORKERS ====================
  const filtered = useMemo(() => {
    let r = labors.slice(0, 5000);
    if (category !== 'all') { r = r.filter((l: any) => l.category === category); }
    if (filter === 'online') r = r.filter((l: any) => l.is_online);
    else if (filter === 'rated') r = r.filter((l: any) => (l.rating || 0) >= 4);
    else if (filter === 'budget') r = r.filter((l: any) => { const s=parseInt((l.expected_salary||'0').replace(/[^0-9]/g,'')); return s>=salaryRange.min&&s<=salaryRange.max; });
    if (activeArea) { const area=areas.find(a=>a.name===activeArea); if (area) { r=r.filter((l:any)=>{const pos=getWorkerPos(l.id);return pos&&calcDist(pos.lat,pos.lng,area.lat,area.lng)<=area.radius+2;}); if(r.length>0)r=[...r].sort((a:any,b:any)=>{const pa=getWorkerPos(a.id),pb=getWorkerPos(b.id);return calcDist(area.lat,area.lng,pa.lat,pa.lng)-calcDist(area.lat,area.lng,pb.lat,pb.lng);}); return r; } }
    if (userLoc&&distFilter&&!activeArea) { r=r.filter((l:any)=>{const pos=getWorkerPos(l.id);return pos&&calcDist(userLoc.lat,userLoc.lng,pos.lat,pos.lng)<=distFilter;}); if(r.length>0)r=[...r].sort((a:any,b:any)=>{const pa=getWorkerPos(a.id),pb=getWorkerPos(b.id);return calcDist(userLoc.lat,userLoc.lng,pa.lat,pa.lng)-calcDist(userLoc.lat,userLoc.lng,pb.lat,pb.lng);}); }
    return r;
  }, [labors, filter, category, distFilter, userLoc, activeArea, areas, getWorkerPos]);

  useEffect(() => { setNearbyCount(filtered.length); }, [filtered.length]);

  // ==================== ROUTE LINE ====================
  const routeLine = useMemo(() => { if(!routeTo||!userLoc||!gpsOn)return null; const p=getWorkerPos(routeTo.id); return [[userLoc.lat,userLoc.lng],[p.lat,p.lng]] as [number,number][]; }, [routeTo, userLoc, gpsOn, getWorkerPos]);

  // ==================== MARKERS ====================
  const workerMarkers = useMemo(() => {
    const max=zoom>=14?200:100; const visible=filtered.slice(0,max);
    return visible.map((l:any)=>{const p=getWorkerPos(l.id);if(!p)return null;if(bounds){const m=0.05;if(p.lat>bounds.n+m||p.lat<bounds.s-m||p.lng>bounds.e+m||p.lng<bounds.w-m)return null;} return (<CircleMarker key={`m-${l.id}`} center={[p.lat,p.lng]} radius={l.is_online?5:3} pathOptions={{color:categoryColors[l.category]||'#6B7280',fillColor:categoryColors[l.category]||'#6B7280',fillOpacity:l.is_online?0.8:0.3,weight:1.5}} eventHandlers={{click:()=>setSelected(l)}}/>);}).filter(Boolean);
  }, [filtered.length, zoom, bounds, getWorkerPos]);

  // ==================== AREA CIRCLES ====================
  const areaCircles = useMemo(() => { const show=activeArea?areas.filter(a=>a.name===activeArea):(showPills?areas.slice(0,8):[]); return show.map(a=><Circle key={`ac-${a.name}`} center={[a.lat,a.lng]} radius={a.radius*1000} pathOptions={{color:'#3B82F6',fillColor:'#3B82F6',fillOpacity:0.08,weight:2}}/>); }, [activeArea, showPills, areas]);

  const navigateToProfile = useCallback((id: string) => { router.push(`/${country}/${lang}/profile/${id}`); }, [router, country, lang]);
  const shareLoc = useCallback((l: any) => { const txt=`${l.name} - ${translateCategory(l.category, lang)}`; if(navigator.share)navigator.share({title:l.name,text:txt}).catch(()=>{}); else window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`,'_blank'); }, [lang]);

  // ==================== RENDER ====================
  return (
    <div className="relative w-full select-none" style={{ height: 'clamp(450px, 65vh, 650px)', paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

      {/* TOAST */}
      {toastMsg && <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[3000] bg-black/85 text-white text-xs px-4 py-2 rounded-full whitespace-nowrap pointer-events-none animate-fade-in shadow-lg">{toastMsg}</div>}

      {/* ============ TOP BAR ============ */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1100] w-[94%] max-w-[420px]">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg px-2 py-2 flex flex-col gap-1.5 border border-gray-200/80 relative">
          <div className="flex items-center gap-1.5">
            {isDetecting ? <Loader size={14} className="animate-spin text-orange-500 shrink-0 ml-1" /> : detectSource ? <Crosshair size={14} className="text-green-500 shrink-0 ml-1" /> : <MapPin size={14} className="text-orange-500 shrink-0 ml-1" />}
            <div className="flex items-center flex-1 min-w-0 bg-gray-50 rounded-full px-3 py-1.5 relative">
              <Search size={13} className="text-gray-400 shrink-0 mr-1.5" />
              <input ref={searchRef} value={areaSearch} onChange={e => handleSearchChange(e.target.value)} onFocus={() => areaSearch.trim() && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder={T.searchPlaceholder} className="text-[12px] bg-transparent outline-none flex-1 min-w-0 text-gray-700 placeholder-gray-400" />
              {areaSearch && <button onClick={() => { setAreaSearch(''); setSuggestions([]); setShowSuggestions(false); }} className="p-0.5 rounded-full hover:bg-gray-200 shrink-0"><X size={12} className="text-gray-400" /></button>}
            </div>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-[200px] overflow-y-auto z-[1200]">
              {suggestions.map(area => (
                <button key={`sug-${area.name}`} onMouseDown={() => selectSuggestion(area)} className="w-full text-left px-3 py-2.5 text-[12px] hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-0 active:bg-blue-100">
                  <span className="flex items-center gap-2"><MapPin size={12} className="text-blue-500 shrink-0" /><span className="font-medium">{getAreaName(area.name, lang)}</span></span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{areaCounts[area.name] || 0} {T.workers}</span>
                </button>
              ))}
            </div>
          )}
          {showSuggestions && areaSearch.trim() && suggestions.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-center z-[1200]"><p className="text-[12px] text-gray-500">{T.noResults}: "{areaSearch}"</p></div>
          )}
          <div className="flex items-center gap-1.5">
            <select value={activeArea||''} onChange={e => changeArea(e.target.value||null)} className="text-[12px] font-semibold bg-gray-50 outline-none cursor-pointer text-gray-800 flex-1 min-w-0 appearance-none rounded-full px-3 py-1.5 border border-gray-100">
              <option value="">🗺️ {T.allQatar}</option>
              {areas.map(area => (<option key={area.name} value={area.name}>📍 {getAreaName(area.name, lang)} ({areaCounts[area.name]||0})</option>))}
            </select>
            <ChevronDown size={14} className="text-gray-400 shrink-0 -ml-8 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ============ AREA PILLS ============ */}
      {showPills && (
        <div className="absolute top-[6.5rem] left-1 right-1 z-[1050] overflow-x-auto pb-1.5 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-1.5 flex-nowrap min-w-max px-1">
            <button onClick={() => changeArea(null)} className={`px-3 py-2 text-[11px] font-bold rounded-full shadow-md active:scale-95 transition-all min-h-[36px] shrink-0 ${!activeArea?'bg-blue-600 text-white':'bg-white text-gray-700'}`}>{T.allAreas}</button>
            {areas.slice(0, 15).map(a => (
              <button key={`p-${a.name}`} onClick={() => changeArea(a.name)} className={`px-3 py-2 text-[11px] font-bold rounded-full shadow-md active:scale-95 transition-all min-h-[36px] shrink-0 ${activeArea===a.name?'bg-blue-600 text-white':'bg-white text-gray-700'}`}>{getAreaName(a.name, lang)} ({areaCounts[a.name]||0})</button>
            ))}
          </div>
        </div>
      )}

      {/* ============ MAP ============ */}
      <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative">
        {mapReady && viewMode === 'map' && (
          <MapContainer key={mapKey} center={[center.lat,center.lng]} zoom={center.zoom} className="w-full h-full" zoomControl={false} style={{ width:'100%',height:'100%' }} ref={mapRef} attributionControl={false} scrollWheelZoom={true} dragging={true} maxZoom={18} minZoom={5}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" keepBuffer={2} />
            {routeLine && <Polyline positions={routeLine} pathOptions={{ color:'#3B82F6',weight:2,dashArray:'8 8' }} />}
            <CircleMarker center={[center.lat,center.lng]} radius={5} pathOptions={{ color:'#EA580C',fillColor:'#EA580C',fillOpacity:0.5,weight:1 }} />
            {areaCircles}
            {workerMarkers}
            {userLoc && <Circle center={[userLoc.lat,userLoc.lng]} radius={distFilter*1000||5000} pathOptions={{ color:'#3B82F6',fillColor:'#3B82F6',fillOpacity:0.06,weight:1.5 }} />}
            {userLoc && <CircleMarker center={[userLoc.lat,userLoc.lng]} radius={6} pathOptions={{ color:'#fff',fillColor:'#3B82F6',fillOpacity:1,weight:2.5 }} />}
          </MapContainer>
        )}
        {!mapReady && viewMode==='map' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-3">
            <Loader size={28} className="animate-spin text-orange-600" />
            <button onClick={() => setMapKey(k=>k+1)} className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 active:scale-95 shadow-lg"><RefreshCw size={15} /> {T.loading}</button>
          </div>
        )}
        {viewMode==='list' && (
          <div className="w-full h-full overflow-y-auto bg-gray-50 p-2.5 space-y-2" style={{ WebkitOverflowScrolling:'touch' }}>
            <div className="flex justify-between items-center mb-1 px-1">
              <span className="text-[11px] text-gray-600 font-medium">{filtered.length} {T.workers}</span>
              <button onClick={() => setMapKey(k=>k+1)} className="text-[11px] text-orange-600 font-bold flex items-center gap-1 active:scale-95"><RefreshCw size={12} /> {T.refresh}</button>
            </div>
            {filtered.length===0 ? (
              <div className="text-center py-14 text-gray-400"><MapPin size={36} className="mx-auto mb-2 opacity-30" /><p className="text-sm">{T.noWorkers}</p></div>
            ) : (
              filtered.slice(0, 200).map((l: any) => {
                const pos = getWorkerPos(l.id);
                const dist = userLoc ? calcDist(userLoc.lat, userLoc.lng, pos.lat, pos.lng).toFixed(1) : null;
                return (
                  <div key={`list-${l.id}`} onClick={() => navigateToProfile(l.id)} className="flex items-center gap-3 p-3 bg-white rounded-xl border active:scale-[0.98] cursor-pointer shadow-sm min-h-[52px]">
                    <img src={l.photo_url||'/default-avatar.png'} className="w-10 h-10 rounded-full object-cover shrink-0" loading="lazy" width={40} height={40} alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-gray-800">{l.name}</p>
                      <p className="text-[11px] text-gray-500">{translateCategory(l.category, lang)}{l.area ? ` • ${getAreaName(l.area, lang)}` : ''}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Star size={11} className="text-yellow-500" fill="#EAB308" />
                        <span className="text-[11px]">{l.rating ? translateNumber(l.rating, lang) : T.new}</span>
                        {l.expected_salary && <span className="text-[11px] text-gray-400">{translateNumber(String(l.expected_salary).replace(/[^0-9]/g,''), lang)} {getCurrencySymbol(lang)}</span>}
                        {dist && <span className="text-[10px] text-blue-500 ml-auto">{dist} {T.km}</span>}
                      </div>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: categoryColors[l.category]||'#6B7280' }} />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ============ CONTROLS ============ */}
      <div className="absolute bottom-3 right-2 left-2 z-[1100] pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-1.5 items-end">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide w-full justify-end" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex bg-white/95 backdrop-blur shadow-md rounded-lg p-0.5 shrink-0">
              <button onClick={() => setViewMode('map')} className={`px-2.5 py-2 text-[11px] font-bold rounded-md flex items-center gap-1 active:scale-95 transition-all min-h-[36px] ${viewMode==='map'?'bg-blue-600 text-white':''}`}><MapIcon size={13} /><span className="hidden sm:inline">{T.mapMode}</span></button>
              <button onClick={() => setViewMode('list')} className={`px-2.5 py-2 text-[11px] font-bold rounded-md flex items-center gap-1 active:scale-95 transition-all min-h-[36px] ${viewMode==='list'?'bg-blue-600 text-white':''}`}><List size={13} /><span className="hidden sm:inline">{T.listMode}</span></button>
            </div>
            <button onClick={toggleGPS} className={`px-2.5 py-2 text-[11px] font-bold rounded-lg shadow-md flex items-center gap-1 active:scale-95 transition-all min-h-[36px] shrink-0 ${gpsOn?'bg-blue-600 text-white':'bg-white'}`}>{gpsOn ? <Navigation size={13} /> : <Compass size={13} />}<span className="hidden sm:inline">{gpsOn ? T.gpsOn : T.gpsOff}</span></button>
            <button onClick={() => setShowPills(!showPills)} className="px-2.5 py-2 text-[11px] font-bold rounded-lg bg-white/95 shadow-md flex items-center gap-1 active:scale-95 shrink-0 min-h-[36px]"><Building2 size={13} /><span className="hidden sm:inline">{showPills ? T.close : T.areas}</span></button>
            {routeTo && <button onClick={() => setRouteTo(null)} className="px-2.5 py-2 text-[11px] font-bold rounded-lg bg-red-50 text-red-500 border border-red-200 shadow-md active:scale-95 min-h-[36px] shrink-0"><X size={13} /></button>}
            <button onClick={() => { posCache.clear(); distCache.clear(); setMapKey(k=>k+1); }} className="px-2.5 py-2 text-[11px] font-bold rounded-lg bg-white/95 shadow-md flex items-center gap-1 active:scale-95 min-h-[36px] shrink-0"><RefreshCw size={13} className="text-orange-600" /></button>
          </div>
          {showFilters && (
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide w-full justify-end" style={{ WebkitOverflowScrolling: 'touch' }}>
              {(['all','online','rated','budget'] as const).map(f => (
                <button key={`f-${f}`} onClick={() => setFilter(f)} className={`px-2.5 py-2 text-[11px] font-bold rounded-lg shadow-md active:scale-95 whitespace-nowrap transition-all shrink-0 min-h-[36px] ${filter===f?'bg-orange-600 text-white':'bg-white/95'}`}>
                  {f==='all'&&T.all}
                  {f==='online'&&<span className="flex items-center gap-0.5"><Zap size={11} />{T.online}</span>}
                  {f==='rated'&&<span className="flex items-center gap-0.5"><Star size={11} />{T.rated}</span>}
                  {f==='budget'&&<span className="flex items-center gap-0.5"><DollarSign size={11} />{T.budget}</span>}
                </button>
              ))}
              {/* ✅ KM বাটন - T.km ব্যবহার করে */}
              <div className="flex bg-white/95 shadow-md rounded-lg p-0.5 shrink-0">
                {([5,10,20,0] as const).map(d => (
                  <button key={`d-${d}`} onClick={() => setDistFilter(d||5)} className={`px-2.5 py-2 text-[11px] font-bold rounded-md active:scale-95 transition-all min-h-[36px] ${distFilter===(d||5)?'bg-green-600 text-white':''}`}>
                    {d===0 ? T.all : `${d}${T.km}`}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={() => setShowFilters(!showFilters)} className="px-2.5 py-2 text-[11px] font-bold rounded-lg bg-white/95 shadow-md flex items-center gap-1 active:scale-95 shrink-0 min-h-[36px] pointer-events-auto">
            <SlidersHorizontal size={13} /><span className="hidden sm:inline">{showFilters ? T.close : T.filters}</span>
          </button>
        </div>
      </div>

      {/* ✅ STATS BAR - within + km LANGUAGE FIXED */}
      <div className="absolute bottom-[8rem] sm:bottom-[6rem] left-3 z-[1100] bg-white/95 backdrop-blur rounded-xl shadow-lg px-3 py-2 text-[11px] flex items-center gap-2 pointer-events-none">
        <Users size={14} className="text-green-600 shrink-0" />
        <span className="font-bold text-gray-800">{nearbyCount}</span>
        <span className="text-gray-500">{T.workers}</span>
        {category !== 'all' && <span className="text-orange-500 font-medium">· {translateCategory(category, lang)}</span>}
        {userLoc && distFilter && <span className="text-blue-500 font-medium">· {T.within} {distFilter}{T.km}</span>}
        {detectedArea && <span className="text-purple-500 font-medium">· {getAreaName(detectedArea, lang)}</span>}
      </div>

      {/* ✅ WORKER POPUP - FIXED with MarkerPopup */}
      {selected && viewMode==='map' && (
        <div className="absolute bottom-14 left-3 right-3 z-[1500] bg-white rounded-2xl shadow-2xl p-3 animate-slide-up max-w-sm mx-auto">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] text-gray-400 font-medium">{T.details}</span>
            <div className="flex gap-0.5">
              <button onClick={() => toggleBookmark(selected.id)} className={`p-2 rounded-lg active:scale-90 min-h-[32px] ${bookmarks.includes(selected.id)?'bg-yellow-50 text-yellow-500':'bg-gray-50 text-gray-400'}`}><Bookmark size={14} fill={bookmarks.includes(selected.id)?'#EAB308':'none'} /></button>
              <button onClick={() => shareLoc(selected)} className="p-2 rounded-lg bg-gray-50 text-gray-400 active:scale-90 min-h-[32px]"><Share2 size={14} /></button>
              <button onClick={() => setShowQR(selected)} className="p-2 rounded-lg bg-gray-50 text-gray-400 active:scale-90 min-h-[32px]"><QrCode size={14} /></button>
              <button onClick={() => { if (gpsOn) setRouteTo(selected); else toggleGPS(); }} className={`p-2 rounded-lg active:scale-90 min-h-[32px] ${routeTo?.id===selected.id?'bg-blue-100 text-blue-600':'bg-blue-50 text-blue-500'}`}><Route size={14} /></button>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg bg-gray-50 text-gray-400 active:scale-90 min-h-[32px]"><X size={14} /></button>
            </div>
          </div>
          {/* ✅ Normalized data for MarkerPopup */}
          <MarkerPopup 
            labor={{
              worker_id: selected.id,
              latitude: 0,
              longitude: 0,
              is_online: selected.is_online ?? false,
              last_seen: selected.last_seen || '',
              expected_salary: selected.expected_salary ? parseInt(String(selected.expected_salary).replace(/[^0-9]/g, '')) : undefined,
              phone: selected.phone || '',
              profiles: {
                name: selected.name || '',
                photo_url: selected.photo_url || '',
                category: selected.category || '',
                rating: selected.rating || 0,
                country: selected.country || country,
              },
              distance: userLoc ? parseFloat(calcDist(userLoc.lat, userLoc.lng, getWorkerPos(selected.id).lat, getWorkerPos(selected.id).lng).toFixed(1)) : undefined,
            }}
            href={`/${country}/${lang}/profile/${selected.id}`} 
            lang={lang} 
          />
        </div>
      )}

      {/* ============ QR MODAL ============ */}
      {showQR && (
        <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/50 rounded-xl" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-2xl p-5 text-center m-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-base mb-2">{showQR.name}</h3>
            <div className="w-32 h-32 bg-gray-200 rounded-xl mx-auto mb-3 flex items-center justify-center"><QrCode size={48} className="text-gray-800" /></div>
            <p className="text-[11px] text-gray-500">{T.scanQR}</p>
            <button onClick={() => setShowQR(null)} className="mt-3 px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold active:scale-95 min-h-[40px]">{T.close}</button>
          </div>
        </div>
      )}

    </div>
  );
}