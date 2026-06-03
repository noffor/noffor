"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef, useCallback, useMemo, startTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  X, Search, Zap, DollarSign, Users, MapPin, List, MapIcon, 
  Wifi, WifiOff, Bookmark, Share2, QrCode, Route, Star, 
  Loader, MessageCircle, Crosshair, ExternalLink, SlidersHorizontal, 
  ChevronDown, RefreshCw, Building2 
} from 'lucide-react';
import { getText, LangCode, translateCategory, translateNumber, getCurrencySymbol } from '@/lib/language';
import MarkerPopup from '@/components/map/MarkerPopup';
import 'leaflet/dist/leaflet.css';

// ============================================
// DYNAMIC IMPORTS
// ============================================
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(m => m.Circle), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

// ============================================
// TYPES
// ============================================
type Area = { name: string; lat: number; lng: number; radius: number };
type CountryCenter = { lat: number; lng: number; zoom: number; name: string; areas: Area[] };
type WorkerPosition = { lat: number; lng: number };

// ============================================
// COUNTRY CENTERS
// ============================================
const countryCenters: Record<string, CountryCenter> = {
  qa: { lat: 25.2867, lng: 51.5333, zoom: 11, name: 'Qatar', areas: [
    { name: 'Doha', lat: 25.2854, lng: 51.5310, radius: 8 },
    { name: 'Al Rayyan', lat: 25.2920, lng: 51.4240, radius: 6 },
    { name: 'Al Wakrah', lat: 25.1667, lng: 51.6000, radius: 5 },
    { name: 'Al Khor', lat: 25.6833, lng: 51.5000, radius: 4 },
    { name: 'Industrial Area', lat: 25.2134, lng: 51.4865, radius: 3 },
  ]},
  sa: { lat: 24.7136, lng: 46.6753, zoom: 6, name: 'Saudi Arabia', areas: [
    { name: 'Riyadh', lat: 24.7136, lng: 46.6753, radius: 15 },
    { name: 'Jeddah', lat: 21.5433, lng: 39.1728, radius: 12 },
    { name: 'Mecca', lat: 21.3891, lng: 39.8579, radius: 10 },
    { name: 'Dammam', lat: 26.4342, lng: 50.1033, radius: 7 },
  ]},
  ae: { lat: 25.2048, lng: 55.2708, zoom: 8, name: 'UAE', areas: [
    { name: 'Dubai', lat: 25.2048, lng: 55.2708, radius: 12 },
    { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773, radius: 10 },
    { name: 'Sharjah', lat: 25.3573, lng: 55.4033, radius: 6 },
  ]},
  kw: { lat: 29.3759, lng: 47.9774, zoom: 10, name: 'Kuwait', areas: [{ name: 'Kuwait City', lat: 29.3759, lng: 47.9774, radius: 8 }]},
  om: { lat: 23.5880, lng: 58.3829, zoom: 7, name: 'Oman', areas: [{ name: 'Muscat', lat: 23.5880, lng: 58.3829, radius: 10 }]},
  bh: { lat: 26.0667, lng: 50.5577, zoom: 11, name: 'Bahrain', areas: [{ name: 'Manama', lat: 26.2285, lng: 50.5860, radius: 6 }]},
};

const categoryColors: Record<string, string> = {
  Driver: '#3B82F6', Electrician: '#F59E0B', Plumber: '#10B981', Mason: '#8B5CF6',
  'AC Technician': '#06B6D4', Painter: '#EC4899', Carpenter: '#F97316',
  Welder: '#6366F1', Cleaner: '#14B8A6', Cook: '#EF4444', Helper: '#84CC16', Gardener: '#22D3EE',
};

// ============================================
// CACHE SYSTEM
// ============================================
const posCache = new Map<string, WorkerPosition>();
const distCache = new Map<string, number>();
const MAX_CACHE = 3000;

function cacheSet<T>(map: Map<string, T>, key: string, val: T, max: number): void {
  if (map.size >= max) { const first = map.keys().next().value; if (first) map.delete(first); }
  map.set(key, val);
}

function getPos(id: string, center: CountryCenter, areas: Area[]): WorkerPosition {
  if (posCache.has(id)) return posCache.get(id)!;
  let pos: WorkerPosition;
  if (areas.length > 0) {
    const a = areas[Math.floor(Math.random() * areas.length)];
    pos = { lat: a.lat + (Math.random() * 0.03 - 0.015) * (a.radius / 5), lng: a.lng + (Math.random() * 0.03 - 0.015) * (a.radius / 5) };
  } else {
    pos = { lat: center.lat + (Math.random() * 0.05 - 0.025), lng: center.lng + (Math.random() * 0.05 - 0.025) };
  }
  cacheSet(posCache, id, pos, MAX_CACHE);
  return pos;
}

function calcDist(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const key = `${lat1.toFixed(4)},${lng1.toFixed(4)},${lat2.toFixed(4)},${lng2.toFixed(4)}`;
  if (distCache.has(key)) return distCache.get(key)!;
  const dLat = (lat2 - lat1) * 0.0174533;
  const dLng = (lng2 - lng1) * 0.0174533;
  const a = Math.sin(dLat * 0.5) ** 2 + Math.cos(lat1 * 0.0174533) * Math.cos(lat2 * 0.0174533) * Math.sin(dLng * 0.5) ** 2;
  const d = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  cacheSet(distCache, key, d, 5000);
  return d;
}

function nearestArea(lat: number, lng: number, areas: Area[]): (Area & { distance: number }) | null {
  if (!areas.length) return null;
  let n = areas[0], min = calcDist(lat, lng, n.lat, n.lng);
  for (let i = 1; i < areas.length; i++) { const d = calcDist(lat, lng, areas[i].lat, areas[i].lng); if (d < min) { min = d; n = areas[i]; } }
  return { ...n, distance: min };
}

async function detectFromIP(): Promise<WorkerPosition & { city?: string } | null> {
  try { const c = new AbortController(); setTimeout(() => c.abort(), 3000); const r = await fetch('https://ipapi.co/json/', { signal: c.signal }); const d = await r.json(); return d?.latitude ? { lat: d.latitude, lng: d.longitude, city: d.city } : null; } catch { return null; }
}

function detectFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  try { const p = new URLSearchParams(window.location.search); return p.get('area') || p.get('city') || null; } catch { return null; }
}

function detectFromBrowser(): Promise<WorkerPosition | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition((pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }), () => resolve(null), { timeout: 5000, maximumAge: 300000, enableHighAccuracy: false });
  });
}

async function autoDetectArea(areas: Area[]): Promise<(Area & { source: string }) | null> {
  const urlArea = detectFromURL();
  if (urlArea) { const found = areas.find((a) => a.name.toLowerCase().includes(urlArea.toLowerCase())); if (found) return { ...found, source: 'url' }; }
  try { const saved = localStorage.getItem('pref-area'); if (saved) { const found = areas.find((a) => a.name === saved); if (found) return { ...found, source: 'saved' }; } } catch {}
  const gps = await detectFromBrowser();
  if (gps) { const near = nearestArea(gps.lat, gps.lng, areas); if (near && near.distance < 50) return { ...near, source: 'gps' }; }
  const ip = await detectFromIP();
  if (ip) { const near = nearestArea(ip.lat, ip.lng, areas); if (near && near.distance < 100) return { ...near, source: 'ip' }; }
  return null;
}

function FlyToLocation({ lat, lng, zoom = 14 }: { lat: number; lng: number; zoom?: number }) {
  const done = useRef(false);
  useEffect(() => { if (done.current) return; requestAnimationFrame(() => { const m = (document.querySelector('.leaflet-container') as any)?._leaflet_map; if (m) { m.flyTo([lat, lng], zoom, { duration: 0.4 }); done.current = true; } }); }, [lat, lng, zoom]);
  return null;
}

function getWorkersInArea(area: Area, labors: any[]): number {
  let count = 0;
  for (let i = 0; i < labors.length; i++) { const pos = posCache.get(labors[i].id); if (pos && calcDist(pos.lat, pos.lng, area.lat, area.lng) <= area.radius + 2) count++; if (count > 999) break; }
  return count;
}

// ============================================
// MAIN COMPONENT - 100% TRANSLATION
// ============================================
export default function LaborMap({ country, labors, lang = 'en' }: { country: string; labors: any[]; lang?: string }) {
  const mapRef = useRef<any>(null);
  const gpsRef = useRef<number | null>(null);
  const aliveRef = useRef(true);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoDone = useRef(false);
  const idleRef = useRef<number | null>(null);
  const batchRef = useRef(false);

  const center = useMemo(() => countryCenters[country] || countryCenters.qa, [country]);
  const areas = useMemo(() => center.areas || [], [center]);

  const [userLoc, setUserLoc] = useState<WorkerPosition | null>(null);
  const [gpsOn, setGpsOn] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [showStats, setShowStats] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'online' | 'rated' | 'budget'>('all');
  const [areaSearch, setAreaSearch] = useState('');
  const [salaryRange, setSalaryRange] = useState({ min: 0, max: 10000 });
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [routeTo, setRouteTo] = useState<any>(null);
  const [showQR, setShowQR] = useState<any>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [distFilter, setDistFilter] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [detectedArea, setDetectedArea] = useState<string | null>(null);
  const [detectSource, setDetectSource] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [bounds, setBounds] = useState<any>(null);
  const [zoom, setZoom] = useState(center.zoom);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [showPills, setShowPills] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [areaWorkerCounts, setAreaWorkerCounts] = useState<Record<string, number>>({});
  const [isDetecting, setIsDetecting] = useState(true);
  const [langKey, setLangKey] = useState(0);

  // ⭐ 100% TRANSLATION - useMemo with [lang] - সব টেক্সট একসাথে
  const t = useMemo(() => ({
    // Map UI
    workers: getText(lang as LangCode, 'map_workers'),
    no_workers: getText(lang as LangCode, 'map_no_workers'),
    worker_details: getText(lang as LangCode, 'map_worker_details'),
    new_text: getText(lang as LangCode, 'map_new'),
    online: getText(lang as LangCode, 'map_online'),
    all: getText(lang as LangCode, 'map_all'),
    rated: getText(lang as LangCode, 'map_rated'),
    budget: getText(lang as LangCode, 'map_budget'),
    gps: getText(lang as LangCode, 'map_gps'),
    map_mode: getText(lang as LangCode, 'map_map'),
    list_mode: getText(lang as LangCode, 'map_list'),
    hide: getText(lang as LangCode, 'map_hide'),
    areas_label: getText(lang as LangCode, 'map_areas'),
    all_areas: getText(lang as LangCode, 'map_all_areas'),
    all_qatar: getText(lang as LangCode, 'map_all_qatar'),
    showing: getText(lang as LangCode, 'map_showing'),
    now_showing: getText(lang as LangCode, 'map_now_showing'),
    min: getText(lang as LangCode, 'map_min'),
    max: getText(lang as LangCode, 'map_max'),
    area_placeholder: getText(lang as LangCode, 'map_area_placeholder'),
    scan_qr: getText(lang as LangCode, 'map_scan_qr'),
    close: getText(lang as LangCode, 'map_close'),
    you_are_in: getText(lang as LangCode, 'map_you_are_in'),
    whatsapp: getText(lang as LangCode, 'map_whatsapp'),
    view_profile: getText(lang as LangCode, 'map_view_profile'),
    salary_label: getText(lang as LangCode, 'map_salary'),
    experience_label: getText(lang as LangCode, 'map_experience'),
    distance_label: getText(lang as LangCode, 'map_distance'),
    eta_label: getText(lang as LangCode, 'map_eta'),
    loading_text: getText(lang as LangCode, 'map_loading'),
  }), [lang]);

  const showToast = useCallback((m: string) => {
    setToastMsg(m);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => { if (aliveRef.current) setToastMsg(null); }, 2500);
  }, []);

  // ⭐ Language change - force re-render
  useEffect(() => {
    setLangKey(k => k + 1);
  }, [lang]);

  // Auto area detection
  useEffect(() => {
    if (autoDone.current) return;
    autoDone.current = true;
    (async () => {
      setIsDetecting(true);
      const detected = await autoDetectArea(areas);
      if (!aliveRef.current) return;
      if (detected) {
        startTransition(() => { setActiveArea(detected.name); setDetectedArea(detected.name); setDetectSource(detected.source); setFlyTo({ lat: detected.lat, lng: detected.lng, zoom: 14 }); });
        showToast(`${t.showing}: ${detected.name}`);
      }
      setIsDetecting(false);
    })();
  }, []);

  const changeArea = useCallback((areaName: string | null) => {
    if (areaName) {
      const area = areas.find((a) => a.name === areaName);
      if (area) {
        startTransition(() => { setActiveArea(area.name); setDetectedArea(area.name); setDetectSource('manual'); setFlyTo({ lat: area.lat, lng: area.lng, zoom: 14 }); });
        try { localStorage.setItem('pref-area', area.name); } catch {}
        showToast(`${t.now_showing}: ${area.name}`);
      }
    } else {
      startTransition(() => { setActiveArea(null); setDetectedArea(null); setDetectSource(null); setFlyTo({ lat: center.lat, lng: center.lng, zoom: center.zoom }); });
      try { localStorage.removeItem('pref-area'); } catch {}
    }
  }, [areas, center, showToast, t]);

  useEffect(() => {
    if (!labors.length) return;
    const timer = setTimeout(() => {
      const counts: Record<string, number> = {};
      for (const area of areas) { counts[area.name] = getWorkersInArea(area, labors); }
      startTransition(() => setAreaWorkerCounts(counts));
    }, 500);
    return () => clearTimeout(timer);
  }, [labors.length, areas]);

  const refreshMap = useCallback(() => {
    posCache.clear(); distCache.clear();
    startTransition(() => { setMapReady(false); setSelected(null); setMapKey(k => k + 1); });
    requestAnimationFrame(() => { if (aliveRef.current) startTransition(() => setMapReady(true)); });
  }, []);

  useEffect(() => {
    if (!labors.length) return;
    const batchSize = 150; let i = 0; batchRef.current = true;
    const process = () => {
      if (!aliveRef.current || !batchRef.current) return;
      const end = Math.min(i + batchSize, labors.length);
      for (; i < end; i++) { const l = labors[i]; if (l?.id && !posCache.has(l.id)) getPos(l.id, center, areas); }
      if (i < labors.length) { idleRef.current = typeof requestIdleCallback !== 'undefined' ? requestIdleCallback(process, { timeout: 50 }) : setTimeout(process, 0) as unknown as number; }
      else batchRef.current = false;
    };
    requestAnimationFrame(process);
    return () => { batchRef.current = false; if (idleRef.current) { if (typeof cancelIdleCallback !== 'undefined') cancelIdleCallback(idleRef.current); else clearTimeout(idleRef.current); } };
  }, [labors.length]);

  useEffect(() => { aliveRef.current = true; const tm = setTimeout(() => { if (aliveRef.current) startTransition(() => setMapReady(true)); }, 200); return () => { aliveRef.current = false; clearTimeout(tm); }; }, [mapKey]);

  useEffect(() => {
    if (!mapReady) return;
    let db: NodeJS.Timeout;
    const tm = setTimeout(() => {
      const m = (document.querySelector('.leaflet-container') as any)?._leaflet_map;
      if (!m) return;
      const up = () => { clearTimeout(db); db = setTimeout(() => { if (!aliveRef.current) return; const b = m.getBounds(); startTransition(() => { setBounds({ n: b.getNorth(), s: b.getSouth(), e: b.getEast(), w: b.getWest() }); setZoom(m.getZoom()); }); }, 100); };
      m.on('moveend', up); m.on('zoomend', up); up();
      requestAnimationFrame(() => m.invalidateSize());
      return () => { m.off('moveend', up); m.off('zoomend', up); clearTimeout(db); };
    }, 300);
    return () => clearTimeout(tm);
  }, [mapReady]);

  useEffect(() => {
    let active = true;
    const poll = async () => { if (!active) return; try { await Promise.all([supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('country', country), supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('country', country).eq('is_online', true)]); } catch {} };
    poll(); const iv = setInterval(poll, 30000);
    return () => { active = false; clearInterval(iv); };
  }, [country]);

  useEffect(() => {
    if (localStorage.getItem('gps-enabled') === 'true') { setGpsOn(true); startGPS(); }
    try { const s = localStorage.getItem('bookmarked-workers'); if (s) { const p = JSON.parse(s); if (Array.isArray(p)) setBookmarks(p); } } catch {}
    return () => { if (gpsRef.current) { navigator.geolocation?.clearWatch(gpsRef.current); gpsRef.current = null; } };
  }, []);

  const startGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    if (gpsRef.current) navigator.geolocation.clearWatch(gpsRef.current);
    gpsRef.current = navigator.geolocation.watchPosition((p) => { if (aliveRef.current) startTransition(() => setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude })); }, () => {}, { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 });
  }, []);

  const toggleGPS = useCallback(() => {
    const n = !gpsOn; setGpsOn(n); localStorage.setItem('gps-enabled', String(n));
    if (n) startGPS(); else { if (gpsRef.current) { navigator.geolocation.clearWatch(gpsRef.current); gpsRef.current = null; } startTransition(() => { setUserLoc(null); setRouteTo(null); }); }
  }, [gpsOn, startGPS]);

  const toggleBookmark = useCallback((id: string) => { startTransition(() => { setBookmarks(p => { const u = p.includes(id) ? p.filter(b => b !== id) : [...p, id]; try { localStorage.setItem('bookmarked-workers', JSON.stringify(u)); } catch {} return u; }); }); }, []);
  
  const shareLoc = useCallback((l: any) => { const txt = `${l.name} - ${l.category}`; if (navigator.share) navigator.share({ title: l.name, text: txt }).catch(() => {}); else window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank'); }, []);

  const searchA = useCallback(async () => {
    if (!areaSearch.trim()) return; setSearching(true);
    const f = areas.find((a) => a.name.toLowerCase().includes(areaSearch.toLowerCase()));
    if (f) { startTransition(() => { setFlyTo({ lat: f.lat, lng: f.lng, zoom: 14 }); setSearchResults([{ name: f.name }]); changeArea(f.name); setSearching(false); }); return; }
    try { const { data } = await supabase.from('profiles').select('id,name,area,city,category').or(`area.ilike.%${areaSearch}%,city.ilike.%${areaSearch}%`).limit(5); if (aliveRef.current) startTransition(() => { setSearchResults(data || []); setSearching(false); }); } catch { startTransition(() => { setSearchResults([]); setSearching(false); }); }
  }, [areaSearch, areas, changeArea]);

  const filtered = useMemo(() => {
    let r = labors;
    if (filter === 'online') r = r.filter((l: any) => l.is_online);
    else if (filter === 'rated') r = r.filter((l: any) => (l.rating || 0) >= 4);
    else if (filter === 'budget') r = r.filter((l: any) => { const s = parseInt((l.expected_salary || '0').replace(/[^0-9]/g, '')); return s >= salaryRange.min && s <= salaryRange.max; });
    if (activeArea) { const area = areas.find((a) => a.name === activeArea); if (area) { r = r.filter((l: any) => { const pos = posCache.get(l.id); return pos ? calcDist(pos.lat, pos.lng, area.lat, area.lng) <= area.radius + 2 : false; }); } }
    if (distFilter && userLoc) { r = r.filter((l: any) => { const pos = posCache.get(l.id); return pos ? calcDist(userLoc.lat, userLoc.lng, pos.lat, pos.lng) <= distFilter : true; }); }
    if (userLoc && r.length > 0) { r = [...r].sort((a: any, b: any) => { const pa = posCache.get(a.id), pb = posCache.get(b.id); return (pa ? calcDist(userLoc.lat, userLoc.lng, pa.lat, pa.lng) : 999) - (pb ? calcDist(userLoc.lat, userLoc.lng, pb.lat, pb.lng) : 999); }); }
    return r;
  }, [labors, filter, salaryRange.min, salaryRange.max, distFilter, userLoc, activeArea, areas]);

  const routeLine = useMemo(() => { if (!routeTo || !userLoc || !gpsOn) return null; const p = posCache.get(routeTo.id) || { lat: center.lat + 0.02, lng: center.lng + 0.02 }; return [[userLoc.lat, userLoc.lng], [p.lat, p.lng]] as [number, number][]; }, [routeTo?.id, userLoc, gpsOn]);

  const workerMarkers = useMemo(() => {
    const max = zoom >= 14 ? 250 : 120; const visible = filtered.slice(0, max);
    return visible.map((l: any) => { const p = posCache.get(l.id); if (!p) return null; if (bounds) { const m = 0.05; if (p.lat > bounds.n + m || p.lat < bounds.s - m || p.lng > bounds.e + m || p.lng < bounds.w - m) return null; } return (<CircleMarker key={`m-${l.id}`} center={[p.lat, p.lng]} radius={l.is_online ? 5 : 3} pathOptions={{ color: categoryColors[l.category] || '#6B7280', fillColor: categoryColors[l.category] || '#6B7280', fillOpacity: l.is_online ? 0.8 : 0.3, weight: 1.5 }} eventHandlers={{ click: () => startTransition(() => setSelected(l)) }} />); }).filter(Boolean);
  }, [filtered.length, zoom, bounds?.n, bounds?.s, bounds?.e, bounds?.w]);

  const areaCircles = useMemo(() => { if (!activeArea && !showPills) return null; const show = activeArea ? areas.filter((a) => a.name === activeArea) : areas.slice(0, 5); return show.map((a) => (<Circle key={`ac-${a.name}`} center={[a.lat, a.lng]} radius={a.radius * 1000} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1, weight: 2 }} />)); }, [activeArea, showPills, areas]);

  const hFilter = (f: typeof filter) => startTransition(() => setFilter(f));
  const hDist = (d: number | null) => startTransition(() => setDistFilter(d));
  const hView = (m: 'map' | 'list') => startTransition(() => setViewMode(m));

  return (
    <div className="relative w-full select-none" style={{ height: 'clamp(450px, 65vh, 650px)' }}>
      {toastMsg && (<div className="absolute top-14 left-1/2 -translate-x-1/2 z-[2000] bg-black/80 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none animate-fade-in">{toastMsg}</div>)}

      {/* Area Selector */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur rounded-full shadow-lg px-3 py-1.5 flex items-center gap-2 border border-gray-200">
          {isDetecting ? (<Loader size={14} className="animate-spin text-orange-500" />) : detectSource ? (<Crosshair size={14} className="text-green-500" />) : (<MapPin size={14} className="text-orange-500" />)}
          <select value={activeArea || ''} onChange={(e) => changeArea(e.target.value || null)} className="text-xs font-bold bg-transparent outline-none cursor-pointer text-gray-800 min-w-[100px] appearance-none">
            <option value="">🗺️ {t.all_qatar}</option>
            {areas.map(area => (<option key={area.name} value={area.name}>📍 {area.name} ({areaWorkerCounts[area.name] || 0})</option>))}
          </select>
        </div>
      </div>

      {/* Area Pills */}
      {showPills && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] flex gap-1 flex-wrap justify-center max-w-[93vw]">
          <button onClick={() => changeArea(null)} className={`px-3 py-1.5 text-[10px] font-bold rounded-full shadow-md active:scale-95 transition-all ${!activeArea ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>{t.all_areas}</button>
          {areas.map((a) => (<button key={`p-${a.name}`} onClick={() => changeArea(a.name)} className={`px-3 py-1.5 text-[10px] font-bold rounded-full shadow-md active:scale-95 transition-all ${activeArea === a.name ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>{a.name} ({areaWorkerCounts[a.name] || 0})</button>))}
        </div>
      )}

      {/* Map Container */}
      <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative">
        {mapReady && viewMode === 'map' && (
          <MapContainer key={mapKey} center={[center.lat, center.lng]} zoom={center.zoom} className="w-full h-full" zoomControl={false} style={{ width: '100%', height: '100%' }} ref={mapRef} attributionControl={false} doubleClickZoom={false} scrollWheelZoom={true} dragging={true} maxZoom={18} minZoom={5}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" keepBuffer={2} updateWhenZooming={false} />
            {flyTo && <FlyToLocation lat={flyTo.lat} lng={flyTo.lng} zoom={flyTo.zoom} />}
            {routeLine && <Polyline positions={routeLine} pathOptions={{ color: '#3B82F6', weight: 2, dashArray: '8 8' }} />}
            <CircleMarker center={[center.lat, center.lng]} radius={5} pathOptions={{ color: '#EA580C', fillColor: '#EA580C', fillOpacity: 0.5, weight: 1 }} />
            {areaCircles}
            {workerMarkers}
            {gpsOn && userLoc && (<><Circle center={[userLoc.lat, userLoc.lng]} radius={400} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.06, weight: 1 }} /><CircleMarker center={[userLoc.lat, userLoc.lng]} radius={5} pathOptions={{ color: '#fff', fillColor: '#3B82F6', fillOpacity: 1, weight: 2 }} /></>)}
          </MapContainer>
        )}

        {!mapReady && viewMode === 'map' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-4">
            <Loader size={28} className="animate-spin text-orange-600" />
            <button onClick={refreshMap} className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 active:scale-95 shadow-lg"><RefreshCw size={15} /> {t.loading_text}</button>
          </div>
        )}

        {/* ⭐ LIST VIEW - 100% TRANSLATED */}
        {viewMode === 'list' && (
          <div className="w-full h-full overflow-y-auto bg-gray-50 p-2.5 space-y-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex justify-between items-center mb-1 px-1">
              <span className="text-[11px] text-gray-600 font-medium">{filtered.length} {t.workers}</span>
              <button onClick={refreshMap} className="text-[11px] text-orange-600 font-bold flex items-center gap-1 active:scale-95"><RefreshCw size={12} /> Refresh</button>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-14 text-gray-400"><MapPin size={36} className="mx-auto mb-2 opacity-30" /><p className="text-sm">{t.no_workers}</p></div>
            ) : (
              filtered.slice(0, 200).map((l: any) => {
                // ⭐ 100% Translation for List Item
                const displayCategory = translateCategory(l.category, lang);
                const displayRating = l.rating ? translateNumber(l.rating, lang) : t.new_text;
                const displaySalary = l.expected_salary ? `${translateNumber(String(l.expected_salary).replace(/[^0-9]/g, ''), lang)} ${getCurrencySymbol(lang)}` : '';
                
                return (
                  <div 
                    key={`list-${l.id}-${langKey}`} 
                    onClick={() => window.location.href = `/${country}/${lang}/profile/${l.id}`}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border active:scale-[0.98] cursor-pointer shadow-sm"
                  >
                    <img src={l.photo_url || '/default-avatar.png'} className="w-11 h-11 rounded-full object-cover flex-shrink-0" loading="lazy" width={44} height={44} alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-gray-800">{l.name}</p>
                      {/* ⭐ Translated Category */}
                      <p className="text-[11px] text-gray-500">{displayCategory}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Star size={12} className="text-yellow-500" fill="#EAB308" />
                        {/* ⭐ Translated Rating */}
                        <span className="text-[11px]">{displayRating}</span>
                        {/* ⭐ Translated Salary */}
                        <span className="text-[11px] text-gray-400">{displaySalary}</span>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColors[l.category] || '#6B7280' }} />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      {mapReady && viewMode === 'map' && (
        <button onClick={refreshMap} className="absolute top-2 left-2 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md px-2 py-1.5 text-[11px] font-bold flex items-center gap-1 active:scale-90"><RefreshCw size={13} className="text-orange-600" /></button>
      )}

      {/* ⭐ Worker Popup - MarkerPopup */}
      {selected && viewMode === 'map' && (
        <div key={`popup-${selected.id}-${langKey}`} className="absolute bottom-3 left-3 right-3 z-[1000] bg-white rounded-2xl shadow-2xl p-3 animate-slide-up max-w-sm mx-auto">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] text-gray-400 font-medium">{t.worker_details}</span>
            <div className="flex gap-0.5">
              <button onClick={() => toggleBookmark(selected.id)} className={`p-1.5 rounded-lg active:scale-90 ${bookmarks.includes(selected.id) ? 'bg-yellow-50 text-yellow-500' : 'bg-gray-50 text-gray-400'}`}><Bookmark size={14} fill={bookmarks.includes(selected.id) ? '#EAB308' : 'none'} /></button>
              <button onClick={() => shareLoc(selected)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 active:scale-90"><Share2 size={14} /></button>
              <button onClick={() => setShowQR(selected)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 active:scale-90"><QrCode size={14} /></button>
              <button onClick={() => setRouteTo(selected)} className={`p-1.5 rounded-lg active:scale-90 ${routeTo?.id === selected.id ? 'bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-500'}`}><Route size={14} /></button>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 active:scale-90"><X size={14} /></button>
            </div>
          </div>
          <MarkerPopup labor={selected} href={`/${country}/${lang}/profile/${selected.id}`} lang={lang} />
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-12 right-2 z-[1000] flex flex-col gap-1.5" style={{ maxWidth: 'calc(100vw - 70px)' }}>
        <div className="flex gap-1.5">
          <div className="flex bg-white/95 backdrop-blur shadow-md rounded-lg p-0.5">
            <button onClick={() => hView('map')} className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md flex items-center gap-1 active:scale-95 transition-all ${viewMode==='map'?'bg-blue-600 text-white':''}`}><MapIcon size={13} /><span className="hidden sm:inline">{t.map_mode}</span></button>
            <button onClick={() => hView('list')} className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md flex items-center gap-1 active:scale-95 transition-all ${viewMode==='list'?'bg-blue-600 text-white':''}`}><List size={13} /><span className="hidden sm:inline">{t.list_mode}</span></button>
          </div>
          <button onClick={toggleGPS} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg shadow-md flex items-center gap-1.5 active:scale-95 transition-all ${gpsOn?'bg-blue-600 text-white':'bg-white'}`}>{gpsOn ? <Wifi size={13} /> : <WifiOff size={13} />}{t.gps}</button>
          {routeTo && <button onClick={() => setRouteTo(null)} className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-red-50 text-red-500 border border-red-200 shadow-md active:scale-95"><X size={13} /></button>}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setShowFilters(!showFilters)} className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-white/95 shadow-md flex items-center gap-1 active:scale-95"><SlidersHorizontal size={13} /><ChevronDown size={11} /></button>
          <button onClick={() => setShowPills(!showPills)} className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-white/95 shadow-md flex items-center gap-1 active:scale-95"><Building2 size={13} />{showPills ? t.hide : t.areas_label}</button>
          {(['all','online','rated','budget'] as const).map(f => (
            <button key={`f-${f}`} onClick={() => hFilter(f)} className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg shadow-md active:scale-95 whitespace-nowrap transition-all ${filter===f?'bg-orange-600 text-white':'bg-white/95'}`}>
              {f==='all'&&t.all}{f==='online'&&<span className="flex items-center gap-1"><Zap size={11} />{t.online}</span>}{f==='rated'&&<span className="flex items-center gap-1"><Star size={11} />{t.rated}</span>}{f==='budget'&&<span className="flex items-center gap-1"><DollarSign size={11} />{t.budget}</span>}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="flex gap-1.5 flex-wrap">
            <div className="flex bg-white/95 shadow-md rounded-lg p-0.5">
              {([null,5,10,20] as const).map(d => (<button key={`d-${d}`} onClick={() => hDist(d)} className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md active:scale-95 transition-all ${distFilter===d?'bg-green-600 text-white':''}`}>{d===null?t.all:`${d}km`}</button>))}
            </div>
            {filter==='budget' && (<div className="flex items-center gap-1 bg-white/95 shadow-md rounded-lg px-2 py-1"><input type="number" placeholder={t.min} value={salaryRange.min||''} onChange={e => startTransition(() => setSalaryRange(p=>({...p,min:+e.target.value})))} className="w-14 px-2 py-1 text-[11px] border rounded outline-none" /><span className="text-[11px] font-bold">-</span><input type="number" placeholder={t.max} value={salaryRange.max||''} onChange={e => startTransition(() => setSalaryRange(p=>({...p,max:+e.target.value})))} className="w-14 px-2 py-1 text-[11px] border rounded outline-none" /></div>)}
            <div className="flex items-center bg-white/95 shadow-md rounded-lg overflow-hidden"><input value={areaSearch} onChange={e => setAreaSearch(e.target.value)} onKeyDown={e => e.key==='Enter' && searchA()} placeholder={t.area_placeholder} className="w-20 px-2 py-1.5 text-[11px] outline-none" /><button onClick={searchA} className="px-3 py-1.5 bg-orange-600 text-white active:scale-95">{searching ? <Loader size={12} className="animate-spin"/> : <Search size={12}/>}</button></div>
          </div>
        )}

        {searchResults.length>0 && areaSearch && (<div className="bg-white/95 shadow-md rounded-lg p-1.5 max-w-[200px] max-h-24 overflow-y-auto text-[11px]">{searchResults.map((r: any, i: number) => (<div key={`r-${i}`} className="px-2 py-1 hover:bg-gray-50 rounded cursor-pointer font-medium" onClick={() => startTransition(() => { setFlyTo({lat: r.lat||center.lat, lng: r.lng||center.lng, zoom: 14}); changeArea(r.name||r.area); })}>{r.name||r.area}</div>))}</div>)}
      </div>

      {/* Stats */}
      {showStats && viewMode==='map' && (<div className="absolute bottom-2 left-12 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md px-3 py-1.5 text-[11px]"><div className="flex items-center gap-2"><Users size={14} className="text-green-600" /><span className="font-bold">{filtered.length}</span><span className="text-gray-500">{t.workers}</span>{detectedArea && <span className="text-blue-500 font-medium">· {detectedArea}</span>}</div><button onClick={() => setShowStats(false)} className="absolute -top-1 -right-1 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center"><X size={9} /></button></div>)}
      {!showStats && viewMode==='map' && (<button onClick={() => setShowStats(true)} className="absolute bottom-2 left-12 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-md px-3 py-1.5 text-[11px] font-bold flex items-center gap-1 active:scale-95"><Zap size={12} className="text-green-500" />{filtered.length}</button>)}

      {/* QR Modal */}
      {showQR && (<div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/50 rounded-xl" onClick={() => setShowQR(null)}><div className="bg-white rounded-2xl p-5 text-center" onClick={e => e.stopPropagation()}><h3 className="font-bold text-base mb-2">{showQR.name}</h3><div className="w-36 h-36 bg-gray-200 rounded-xl mx-auto mb-3 flex items-center justify-center"><QrCode size={56} className="text-gray-800" /></div><p className="text-[11px] text-gray-500">{t.scan_qr}</p><button onClick={() => setShowQR(null)} className="mt-3 px-5 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold active:scale-95">{t.close}</button></div></div>)}
    </div>
  );
}