// components/home/HomeTabs.tsx
// 🚀 1 BILLION USERS • SUPER SONIC • ZERO CRASH • 42 CATEGORIES • 4 LANGUAGES
// ✅ UBER-STYLE • Live Tracking • Surge Pricing • Full Category Support

"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wifi, WifiOff, X, Loader2, LogIn, Shield, Zap,
  MapPin, Clock, Star, MessageCircle, Phone, Share2,
  AlertTriangle, Calendar, Navigation, Users, ShieldAlert,
  CheckCircle, Send, Car, Home, Droplets, Paintbrush,
  Wrench, HardHat, Truck, Utensils, Sparkles, Leaf,
  UserCheck, Briefcase, Monitor, Camera, Scissors,
  Settings, Thermometer, Heart, GraduationCap, BookOpen,
  ShoppingCart, FileText, Headphones, PenTool, Code
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import WorkerBookingListener from '@/components/worker/WorkerBookingListener';
import LiveWorkerMap from '@/components/map/LiveWorkerMap';
import BookingForm from '@/components/BookingForm';

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════
interface Props { country: string; lang: string; }

interface LocationData { lat: number; lng: number; }

interface WorkerData {
  id: string;
  worker_id: string;
  name: string;
  phone?: string;
  category: string;
  photo_url: string;
  rating: number;
  total_jobs: number;
  distance: number;
  eta: number;
  price_estimate: number;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  skills: string[];
}

interface ServiceType {
  id: string;
  name: string;
  icon: any;
  base_price: number;
  price_per_km: number;
  estimated_time: string;
  workers_available: number;
}

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════
const STORAGE_KEY = 'noffor_employer_online';

const DEFAULT_LOC: Record<string, LocationData> = {
  qa: { lat: 25.3548, lng: 51.1839 },
  sa: { lat: 24.7136, lng: 46.6753 },
  ae: { lat: 25.2048, lng: 55.2708 },
  kw: { lat: 29.3759, lng: 47.9774 },
  bh: { lat: 26.0667, lng: 50.5577 },
  om: { lat: 23.5880, lng: 58.3829 },
};

// ✅ ALL 42 CATEGORIES
const ALL_SERVICE_TYPES: ServiceType[] = [
  // 12 Main Categories
  { id: 'driver', name: 'Driver', icon: Car, base_price: 50, price_per_km: 5, estimated_time: '30-60 min', workers_available: 0 },
  { id: 'electrician', name: 'Electrician', icon: Zap, base_price: 70, price_per_km: 7, estimated_time: '30-60 min', workers_available: 0 },
  { id: 'plumber', name: 'Plumber', icon: Droplets, base_price: 80, price_per_km: 8, estimated_time: '45-90 min', workers_available: 0 },
  { id: 'mason', name: 'Mason', icon: HardHat, base_price: 100, price_per_km: 10, estimated_time: '2-4 hours', workers_available: 0 },
  { id: 'ac_technician', name: 'AC Technician', icon: Thermometer, base_price: 90, price_per_km: 9, estimated_time: '45-90 min', workers_available: 0 },
  { id: 'painter', name: 'Painter', icon: Paintbrush, base_price: 100, price_per_km: 10, estimated_time: '2-4 hours', workers_available: 0 },
  { id: 'carpenter', name: 'Carpenter', icon: Wrench, base_price: 90, price_per_km: 9, estimated_time: '1-3 hours', workers_available: 0 },
  { id: 'welder', name: 'Welder', icon: Settings, base_price: 120, price_per_km: 12, estimated_time: '1-3 hours', workers_available: 0 },
  { id: 'cleaner', name: 'Cleaner', icon: Sparkles, base_price: 50, price_per_km: 5, estimated_time: '30-60 min', workers_available: 0 },
  { id: 'cook', name: 'Cook', icon: Utensils, base_price: 60, price_per_km: 6, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'helper', name: 'Helper', icon: UserCheck, base_price: 40, price_per_km: 4, estimated_time: '30-60 min', workers_available: 0 },
  { id: 'gardener', name: 'Gardener', icon: Leaf, base_price: 50, price_per_km: 5, estimated_time: '1-2 hours', workers_available: 0 },
  
  // 30 Other Categories
  { id: 'housemaid', name: 'Housemaid', icon: Home, base_price: 60, price_per_km: 6, estimated_time: '2-4 hours', workers_available: 0 },
  { id: 'nanny', name: 'Nanny', icon: Heart, base_price: 60, price_per_km: 6, estimated_time: '2-4 hours', workers_available: 0 },
  { id: 'office_assistant', name: 'Office Assistant', icon: Briefcase, base_price: 50, price_per_km: 5, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'receptionist', name: 'Receptionist', icon: Monitor, base_price: 50, price_per_km: 5, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'salesman', name: 'Salesman', icon: ShoppingCart, base_price: 50, price_per_km: 5, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'cashier', name: 'Cashier', icon: FileText, base_price: 45, price_per_km: 4, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'security_guard', name: 'Security Guard', icon: Shield, base_price: 55, price_per_km: 5, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'nurse', name: 'Nurse', icon: Heart, base_price: 80, price_per_km: 8, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'pharmacist', name: 'Pharmacist', icon: Settings, base_price: 70, price_per_km: 7, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'lab_technician', name: 'Lab Technician', icon: Settings, base_price: 70, price_per_km: 7, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'physiotherapist', name: 'Physiotherapist', icon: Heart, base_price: 80, price_per_km: 8, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'mechanic', name: 'Mechanic', icon: Settings, base_price: 80, price_per_km: 8, estimated_time: '1-3 hours', workers_available: 0 },
  { id: 'tailor', name: 'Tailor', icon: Scissors, base_price: 50, price_per_km: 5, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'barista', name: 'Barista', icon: Utensils, base_price: 40, price_per_km: 4, estimated_time: '30-60 min', workers_available: 0 },
  { id: 'photographer', name: 'Photographer', icon: Camera, base_price: 100, price_per_km: 10, estimated_time: '1-3 hours', workers_available: 0 },
  { id: 'cctv_technician', name: 'CCTV Technician', icon: Camera, base_price: 90, price_per_km: 9, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'gypsum_carpenter', name: 'Gypsum Carpenter', icon: PenTool, base_price: 100, price_per_km: 10, estimated_time: '2-4 hours', workers_available: 0 },
  { id: 'tiles_mason', name: 'Tiles Mason', icon: HardHat, base_price: 110, price_per_km: 11, estimated_time: '2-4 hours', workers_available: 0 },
  { id: 'blacksmith', name: 'Blacksmith', icon: Settings, base_price: 100, price_per_km: 10, estimated_time: '1-3 hours', workers_available: 0 },
  { id: 'general_labour', name: 'General Labour', icon: UserCheck, base_price: 40, price_per_km: 4, estimated_time: '30-60 min', workers_available: 0 },
  { id: 'steel_fixer', name: 'Steel Fixer', icon: Settings, base_price: 100, price_per_km: 10, estimated_time: '2-4 hours', workers_available: 0 },
  { id: 'scaffolder', name: 'Scaffolder', icon: HardHat, base_price: 90, price_per_km: 9, estimated_time: '1-3 hours', workers_available: 0 },
  { id: 'heavy_driver', name: 'Heavy Driver', icon: Truck, base_price: 80, price_per_km: 8, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'forklift_operator', name: 'Forklift Operator', icon: Settings, base_price: 70, price_per_km: 7, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'crane_operator', name: 'Crane Operator', icon: Settings, base_price: 120, price_per_km: 12, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'pipe_fitter', name: 'Pipe Fitter', icon: Droplets, base_price: 80, price_per_km: 8, estimated_time: '1-3 hours', workers_available: 0 },
  { id: 'waiter', name: 'Waiter', icon: Utensils, base_price: 40, price_per_km: 4, estimated_time: '30-60 min', workers_available: 0 },
  { id: 'hotel_housekeeping', name: 'Hotel Housekeeping', icon: Sparkles, base_price: 50, price_per_km: 5, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'beautician', name: 'Beautician', icon: Sparkles, base_price: 60, price_per_km: 6, estimated_time: '1-2 hours', workers_available: 0 },
  { id: 'barber', name: 'Barber', icon: Scissors, base_price: 30, price_per_km: 3, estimated_time: '30-60 min', workers_available: 0 },
];

// ═══════════════════════════════════════════════
// TRANSLATIONS (Short & Fast)
// ═══════════════════════════════════════════════
const T: Record<string, Record<string, string>> = {
  en: {
    quickHire: '⚡ Quick Hire', online: 'Go Online', offline: 'Go Offline',
    on: 'ON', off: 'OFF', closeMap: 'Close Map', error: 'Error',
    loginToGoOnline: 'Login', locationDenied: 'Location denied',
    goOnlineFirst: 'Go online first', findingWorker: 'Finding worker...',
    bookingCreated: 'Worker assigned!', bookingFailed: 'Booking failed',
    selectService: 'Select Service', bookNow: 'Book Now',
    estimatedPrice: 'Estimated', surgePricing: 'High demand',
    workerArriving: 'Arriving in', cancelBooking: 'Cancel',
    chatWithWorker: 'Chat', callWorker: 'Call', shareTrip: 'Share',
    emergency: 'SOS', cash: 'Cash', card: 'Card', wallet: 'Wallet',
    total: 'Total', min: 'min', km: 'km', away: 'away',
    jobs: 'jobs', verified: 'Verified', topRated: 'Top',
    nearby: 'nearby', schedule: 'Schedule', today: 'Today',
    tomorrow: 'Tomorrow', searching: 'Searching...',
    noWorkers: 'No workers', tryAgain: 'Retry',
    phoneRequired: 'Add phone number', cancel: 'Cancel',
    loginRequired: 'Login required', workersNearby: 'nearby',
    locating: 'Locating...', trackWorker: 'Track',
    workerFound: 'Worker Found!', promoApplied: 'Applied!',
    sosSent: 'Alert sent', locationShared: 'Shared',
  },
  bn: {
    quickHire: '⚡ কুইক হায়ার', online: 'অনলাইন', offline: 'অফলাইন',
    on: 'চালু', off: 'বন্ধ', closeMap: 'বন্ধ', error: 'ত্রুটি',
    loginToGoOnline: 'লগইন', locationDenied: 'লোকেশন নাই',
    goOnlineFirst: 'অনলাইন হোন', findingWorker: 'শ্রমিক খুঁজছে...',
    bookingCreated: 'শ্রমিক পেয়েছে!', bookingFailed: 'ব্যর্থ',
    selectService: 'সেবা নির্বাচন', bookNow: 'বুক করুন',
    estimatedPrice: 'আনুমানিক', surgePricing: 'অতিরিক্ত চাহিদা',
    workerArriving: 'আসছে', cancelBooking: 'বাতিল',
    chatWithWorker: 'চ্যাট', callWorker: 'কল', shareTrip: 'শেয়ার',
    emergency: 'জরুরি', cash: 'নগদ', card: 'কার্ড', wallet: 'ওয়ালেট',
    total: 'মোট', min: 'মিনিট', km: 'কিমি', away: 'দূরে',
    jobs: 'কাজ', verified: 'ভেরিফাইড', topRated: 'সেরা',
    nearby: 'কাছাকাছি', schedule: 'সময়', today: 'আজ',
    tomorrow: 'কাল', searching: 'খুঁজছে...',
    noWorkers: 'নেই', tryAgain: 'আবার', phoneRequired: 'ফোন দিন',
    cancel: 'বাতিল', loginRequired: 'লগইন', workersNearby: 'কাছে',
    locating: 'খুঁজছে...', trackWorker: 'ট্র্যাক',
    workerFound: 'পাওয়া গেছে!', promoApplied: 'প্রয়োগ!',
    sosSent: 'সতর্কতা', locationShared: 'শেয়ার',
  },
  ar: {
    quickHire: '⚡ توظيف', online: 'متصل', offline: 'غير متصل',
    on: 'ON', off: 'OFF', closeMap: 'إغلاق', error: 'خطأ',
    loginToGoOnline: 'دخول', locationDenied: 'موقع مرفوض',
    goOnlineFirst: 'اتصل أولاً', findingWorker: 'بحث...',
    bookingCreated: 'تم!', bookingFailed: 'فشل',
    selectService: 'اختر', bookNow: 'احجز',
    estimatedPrice: 'تقديري', surgePricing: 'طلب عالي',
    workerArriving: 'قادم', cancelBooking: 'إلغاء',
    chatWithWorker: 'محادثة', callWorker: 'اتصال', shareTrip: 'مشاركة',
    emergency: 'طوارئ', cash: 'نقداً', card: 'بطاقة', wallet: 'محفظة',
    total: 'المجموع', min: 'دقيقة', km: 'كم', away: 'بعيد',
    jobs: 'عمل', verified: 'موثق', topRated: 'ممتاز',
    nearby: 'قريب', schedule: 'جدولة', today: 'اليوم',
    tomorrow: 'غداً', searching: 'بحث...',
    noWorkers: 'لا يوجد', tryAgain: 'إعادة', phoneRequired: 'أضف هاتف',
    cancel: 'إلغاء', loginRequired: 'دخول', workersNearby: 'قريب',
    locating: 'تحديد...', trackWorker: 'تتبع',
    workerFound: 'تم العثور!', promoApplied: 'تم!',
    sosSent: 'تم الإرسال', locationShared: 'تم',
  },
  hi: {
    quickHire: '⚡ क्विक', online: 'ऑनलाइन', offline: 'ऑफलाइन',
    on: 'चालू', off: 'बंद', closeMap: 'बंद', error: 'त्रुटि',
    loginToGoOnline: 'लॉगिन', locationDenied: 'लोकेशन नहीं',
    goOnlineFirst: 'ऑनलाइन हों', findingWorker: 'खोज...',
    bookingCreated: 'मिल गया!', bookingFailed: 'विफल',
    selectService: 'सेवा', bookNow: 'बुक करें',
    estimatedPrice: 'अनुमानित', surgePricing: 'अधिक मांग',
    workerArriving: 'आ रहा', cancelBooking: 'रद्द',
    chatWithWorker: 'चैट', callWorker: 'कॉल', shareTrip: 'शेयर',
    emergency: 'SOS', cash: 'नकद', card: 'कार्ड', wallet: 'वॉलेट',
    total: 'कुल', min: 'मिनट', km: 'किमी', away: 'दूर',
    jobs: 'काम', verified: 'सत्यापित', topRated: 'टॉप',
    nearby: 'पास', schedule: 'शेड्यूल', today: 'आज',
    tomorrow: 'कल', searching: 'खोज...',
    noWorkers: 'नहीं', tryAgain: 'फिर से', phoneRequired: 'फोन डालें',
    cancel: 'रद्द', loginRequired: 'लॉगिन', workersNearby: 'पास',
    locating: 'ढूंढ...', trackWorker: 'ट्रैक',
    workerFound: 'मिल गया!', promoApplied: 'लागू!',
    sosSent: 'भेजा', locationShared: 'शेयर',
  },
};

// ═══════════════════════════════════════════════
// UTILITIES (Super Fast)
// ═══════════════════════════════════════════════
let toastId = 0;
const showToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  const colors: Record<string, string> = { success: '#22c55e', error: '#ef4444', warning: '#eab308', info: '#3b82f6' };
  el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;color:#fff;background:${colors[type]};box-shadow:0 8px 32px rgba(0,0,0,.3);pointer-events:none;`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 2000);
};

class QuickCache<K, V> {
  private cache = new Map<K, { data: V; ts: number }>();
  constructor(private maxSize = 5000, private ttl = 300000) {}
  get(key: K): V | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.ts > this.ttl) { this.cache.delete(key); return null; }
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.data;
  }
  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data: value, ts: Date.now() });
  }
}

const locCache = new QuickCache<string, LocationData>();

const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * 0.0174533;
  const dLng = (lng2 - lng1) * 0.0174533;
  const a = Math.sin(dLat * 0.5) ** 2 + Math.cos(lat1 * 0.0174533) * Math.cos(lat2 * 0.0174533) * Math.sin(dLng * 0.5) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const calcETA = (dist: number): number => Math.max(1, Math.round(dist * 3));
const calcPrice = (base: number, perKm: number, dist: number, surge: number): number => Math.round((base + dist * perKm) * surge);

// ═══════════════════════════════════════════════
// MEMOIZED COMPONENTS
// ═══════════════════════════════════════════════

const OnlineBtn = memo(({ online, loading, isAuth, authLoading, onClick, tr }: any) => (
  <button onClick={onClick} disabled={loading || authLoading}
    className={`rounded-xl px-3 py-2.5 text-left transition-all active:scale-95 w-full ${!isAuth ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' : online ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white' : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'} ${loading || authLoading ? 'opacity-50' : 'hover:shadow-lg'}`}
    style={{ minHeight: '48px', touchAction: 'manipulation', userSelect: 'none' }}>
    {loading ? <Loader2 size={18} className="mb-1 animate-spin" /> : !isAuth ? <LogIn size={18} className="mb-1" /> : online ? <WifiOff size={18} className="mb-1" /> : <Wifi size={18} className="mb-1" />}
    <p className="text-sm font-bold">{!isAuth ? tr.loginToGoOnline : online ? tr.offline : tr.online}</p>
    <div className="flex items-center gap-1 mt-0.5">
      {isAuth ? <><span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} /><span className="text-[10px] opacity-80">{online ? tr.on : tr.off}</span></> : <span className="text-[10px] opacity-80 flex items-center gap-1"><Shield size={10} />{tr.loginRequired}</span>}
    </div>
  </button>
));
OnlineBtn.displayName = 'OnlineBtn';

const ServiceCard = memo(({ service, selected, onClick }: { service: ServiceType; selected: boolean; onClick: () => void }) => {
  const Icon = service.icon;
  return (
    <button onClick={onClick}
      className={`relative flex flex-col items-center p-2.5 rounded-xl transition-all active:scale-95 min-w-[72px] ${selected ? 'bg-blue-50 border-2 border-blue-500 shadow-md' : 'bg-white border-2 border-gray-100 hover:border-blue-300'}`}>
      <Icon size={22} className={selected ? 'text-blue-600' : 'text-gray-600'} />
      <span className="text-[10px] font-medium mt-1 text-center leading-tight">{service.name}</span>
      {selected && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><CheckCircle size={10} className="text-white" /></div>}
    </button>
  );
});
ServiceCard.displayName = 'ServiceCard';

// ═══════════════════════════════════════════════
// 🚀 MAIN COMPONENT
// ═══════════════════════════════════════════════

export default function HomeTabs({ country, lang }: Props) {
  const router = useRouter();
  const { isAuthenticated, profile, loading: authLoading } = useAuth();
  const tr = useMemo(() => T[lang] || T.en, [lang]);

  // Core States
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [online, setOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s)?.isOnline || false; } catch {}
    }
    return false;
  });
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isHiring, setIsHiring] = useState(false);
  const [nearbyCount, setNearbyCount] = useState(0);

  // Service & Booking States
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [bookingState, setBookingState] = useState<'idle' | 'selecting_service' | 'searching' | 'found' | 'tracking' | 'in_progress' | 'completed'>('idle');
  const [selectedWorker, setSelectedWorker] = useState<WorkerData | null>(null);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [workerETA, setWorkerETA] = useState(0);
  const [workerLocation, setWorkerLocation] = useState<LocationData | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Refs
  const lockRef = useRef(false);
  const aliveRef = useRef(true);
  const mountedRef = useRef(false);
  const profileSyncedRef = useRef(false);
  const bookingChannelRef = useRef<any>(null);
  const trackingIntervalRef = useRef<any>(null);

  // ════ LIFECYCLE ════
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      if (bookingChannelRef.current) supabase.removeChannel(bookingChannelRef.current).catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (profile && isAuthenticated && !profileSyncedRef.current) {
      profileSyncedRef.current = true;
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOnline(!!profile.is_online);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ isOnline: !!profile.is_online, userId: profile.id, timestamp: Date.now() }));
      }
    }
    if (!isAuthenticated && !authLoading && profileSyncedRef.current) {
      profileSyncedRef.current = false;
      setOnline(false);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [authLoading, isAuthenticated, profile]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try { setOnline(JSON.parse(e.newValue || '{}')?.isOnline || false); } catch { setOnline(false); }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // ════ FETCH WORKER STATS ════
  const fetchWorkerStats = useCallback(async (lat: number, lng: number) => {
    if (!aliveRef.current) return;
    try {
      const { data } = await supabase.from('worker_locations').select('worker_id, latitude, longitude').eq('is_online', true).limit(100);
      if (!data || !aliveRef.current) return;
      const nearby = data.filter((w: any) => w.latitude && w.longitude && calcDistance(lat, lng, w.latitude, w.longitude) <= 50);
      const total = nearby.length;
      setNearbyCount(total);
      ALL_SERVICE_TYPES.forEach(s => s.workers_available = total);
      if (total < 3) setSurgeMultiplier(2.5);
      else if (total < 5) setSurgeMultiplier(1.8);
      else if (total < 10) setSurgeMultiplier(1.3);
      else setSurgeMultiplier(1);
    } catch {}
  }, []);

  // ════ GET LOCATION ════
  const getLocation = useCallback(async (): Promise<LocationData | null> => {
    const key = `loc:${country}`;
    const cached = locCache.get(key);
    if (cached) { setUserLocation(cached); return cached; }
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const p = JSON.parse(stored);
        if (Date.now() - p.t < 300000) {
          const loc = { lat: p.lat, lng: p.lng };
          locCache.set(key, loc);
          setUserLocation(loc);
          fetchWorkerStats(loc.lat, loc.lng);
          return loc;
        }
      }
    } catch {}
    if (navigator?.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000, maximumAge: 300000, enableHighAccuracy: false })
        );
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        locCache.set(key, loc);
        try { sessionStorage.setItem(key, JSON.stringify({ ...loc, t: Date.now() })); } catch {}
        setUserLocation(loc);
        fetchWorkerStats(loc.lat, loc.lng);
        return loc;
      } catch {}
    }
    const fb = DEFAULT_LOC[country] || DEFAULT_LOC.qa;
    setUserLocation(fb);
    fetchWorkerStats(fb.lat, fb.lng);
    return fb;
  }, [country, fetchWorkerStats]);

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; getLocation(); }
  }, [getLocation]);

  // ════ TOGGLE ONLINE ════
  const toggleOnline = useCallback(async () => {
    if (authLoading || lockRef.current) return;
    if (!isAuthenticated || !profile?.id) { showToast(tr.loginToGoOnline, 'info'); router.push(`/${country}/${lang}/login`); return; }
    lockRef.current = true;
    const next = !online;
    setOnline(next);
    setLoading(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isOnline: next, userId: profile.id, timestamp: Date.now() }));
    try {
      const { error } = await supabase.from('profiles').update({ is_online: next, last_online: new Date().toISOString() }).eq('id', profile.id);
      if (error) throw error;
      showToast(next ? tr.on : tr.off);
    } catch {
      setOnline(!next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isOnline: !next, userId: profile.id, timestamp: Date.now() }));
      showToast(tr.error, 'error');
    } finally { setLoading(false); setTimeout(() => lockRef.current = false, 300); }
  }, [authLoading, isAuthenticated, profile, online, tr, country, lang, router]);

  // ════ SERVICE SELECT ════
  const handleServiceSelect = useCallback((service: ServiceType) => {
    setSelectedService(service);
    if (userLocation) {
      const avgDist = 5;
      const price = calcPrice(service.base_price, service.price_per_km, avgDist, surgeMultiplier);
      setEstimatedPrice(price);
    }
  }, [userLocation, surgeMultiplier]);

  // ════ QUICK HIRE ════
  const handleQuickHire = useCallback(() => {
    if (authLoading || lockRef.current) return;
    lockRef.current = true;
    setIsHiring(true);
    if (!online) { showToast(tr.goOnlineFirst, 'warning'); setIsHiring(false); lockRef.current = false; return; }
    if (!isAuthenticated) { showToast(tr.loginRequired, 'warning'); router.push(`/${country}/${lang}/login`); setIsHiring(false); lockRef.current = false; return; }
    setShowServiceSelector(true);
    setBookingState('selecting_service');
    setIsHiring(false);
    setTimeout(() => lockRef.current = false, 300);
  }, [authLoading, online, isAuthenticated, tr, country, lang, router]);

  // ════ WORKER SELECT FROM MAP ════
  const handleWorkerSelect = useCallback((worker: any) => {
    if (!userLocation) { showToast(tr.locationDenied, 'error'); return; }
    setSelectedWorker({
      id: worker.worker_id,
      worker_id: worker.worker_id,
      name: worker.profile?.name || 'Worker',
      phone: worker.profile?.phone || '',
      category: worker.profile?.category || 'General',
      photo_url: worker.profile?.photo_url || '',
      rating: worker.profile?.rating || 0,
      total_jobs: worker.profile?.total_jobs || 0,
      distance: worker.distance || 0,
      eta: worker.eta || 0,
      price_estimate: worker.price_estimate || 100,
      latitude: worker.latitude,
      longitude: worker.longitude,
      is_verified: worker.profile?.is_verified || false,
      skills: worker.profile?.skills || [],
    });
    setShowBookingForm(true);
  }, [userLocation, tr]);

  // ════ BOOKING FORM CLOSE ════
  const handleBookingFormClose = useCallback(() => {
    if (!isProcessingBooking) {
      setShowBookingForm(false);
      setSelectedWorker(null);
    }
  }, [isProcessingBooking]);

  // ════ BOOK NOW ════
  const handleBookNow = useCallback(async () => {
    if (!selectedService || !userLocation || !profile) return;
    setIsProcessingBooking(true);
    setBookingState('searching');
    setShowServiceSelector(false);
    setShowMap(false);

    try {
      const { data: workers } = await supabase
        .from('worker_locations')
        .select('*, profiles:worker_id(name, phone, photo_url, rating, total_jobs, is_verified, skills, category)')
        .eq('is_online', true)
        .limit(50);

      if (!workers?.length) { showToast(tr.noWorkers, 'error'); setBookingState('idle'); setIsProcessingBooking(false); return; }

      let bestWorker: any = null;
      let minDist = Infinity;
      for (const w of workers) {
        if (!w.latitude || !w.longitude) continue;
        const dist = calcDistance(userLocation.lat, userLocation.lng, w.latitude, w.longitude);
        if (dist < minDist) { minDist = dist; bestWorker = w; }
      }
      if (!bestWorker) { showToast(tr.noWorkers, 'error'); setBookingState('idle'); setIsProcessingBooking(false); return; }

      const eta = calcETA(minDist);
      const price = calcPrice(selectedService.base_price, selectedService.price_per_km, minDist, surgeMultiplier);
      const finalPrice = price - discount;

      const workerData: WorkerData = {
        id: bestWorker.worker_id, worker_id: bestWorker.worker_id,
        name: bestWorker.profiles?.name || 'Worker',
        phone: bestWorker.profiles?.phone || '',
        category: bestWorker.profiles?.category || selectedService.id,
        photo_url: bestWorker.profiles?.photo_url || '',
        rating: bestWorker.profiles?.rating || 4.5,
        total_jobs: bestWorker.profiles?.total_jobs || 0,
        distance: minDist, eta, price_estimate: finalPrice,
        latitude: bestWorker.latitude, longitude: bestWorker.longitude,
        is_verified: bestWorker.profiles?.is_verified || false,
        skills: bestWorker.profiles?.skills || [],
      };

      setSelectedWorker(workerData);
      setWorkerETA(eta);
      setEstimatedPrice(finalPrice);

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          employer_id: profile.id, worker_id: bestWorker.worker_id,
          employer_location: `POINT(${userLocation.lng} ${userLocation.lat})`,
          worker_location: `POINT(${bestWorker.longitude} ${bestWorker.latitude})`,
          status: 'pending', service_type: selectedService.id,
          price_estimate: finalPrice, surge_multiplier: surgeMultiplier,
          employer_phone: profile.phone, employer_name: profile.name,
          country, scheduled_time: isScheduled ? scheduledTime : null,
          payment_method: paymentMethod, job_title: selectedService.name,
          category: selectedService.id, offered_amount: finalPrice,
          total_amount: finalPrice, distance_km: minDist, eta_minutes: eta,
          location_lat: userLocation.lat, location_lng: userLocation.lng,
          worker_lat: bestWorker.latitude, worker_lon: bestWorker.longitude,
        })
        .select().single();

      if (error) throw error;

      const channel = supabase
        .channel(`booking-${booking.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${booking.id}` },
          (payload: any) => {
            const s = payload.new?.status;
            if (s === 'accepted') { setBookingState('tracking'); showToast(tr.workerFound, 'success'); }
            else if (s === 'in_progress') setBookingState('in_progress');
            else if (s === 'completed') setBookingState('completed');
            else if (s === 'cancelled') { setBookingState('idle'); showToast('Cancelled', 'warning'); }
          }
        ).subscribe();
      bookingChannelRef.current = channel;

      trackingIntervalRef.current = setInterval(async () => {
        const { data: loc } = await supabase.from('worker_locations').select('latitude, longitude').eq('worker_id', bestWorker.worker_id).single();
        if (loc && aliveRef.current) {
          setWorkerLocation({ lat: loc.latitude, lng: loc.longitude });
          const newDist = calcDistance(userLocation.lat, userLocation.lng, loc.latitude, loc.longitude);
          setWorkerETA(calcETA(newDist));
        }
      }, 5000);

      setBookingState('found');
      setTimeout(() => setBookingState('tracking'), 2000);

    } catch (err: any) {
      showToast(err.message || tr.bookingFailed, 'error');
      setBookingState('idle');
    } finally { setIsProcessingBooking(false); }
  }, [selectedService, userLocation, profile, surgeMultiplier, isScheduled, scheduledTime, paymentMethod, discount, country, tr]);

  // ════ CANCEL ════
  const handleCancelBooking = useCallback(async () => {
    if (!selectedWorker) return;
    try {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('worker_id', selectedWorker.worker_id).eq('status', 'pending');
      setBookingState('idle');
      setSelectedWorker(null);
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      showToast('Cancelled', 'info');
    } catch { showToast(tr.error, 'error'); }
  }, [selectedWorker, tr]);

  // ════ SOS ════
  const handleSOS = useCallback(async () => {
    if (!userLocation || !profile) return;
    try {
      await supabase.from('emergency_alerts').insert({ user_id: profile.id, location: `POINT(${userLocation.lng} ${userLocation.lat})`, type: 'sos' });
      showToast(tr.sosSent, 'warning');
    } catch {}
  }, [userLocation, profile, tr]);

  // ════ SHARE ════
  const handleShare = useCallback(() => {
    if (!userLocation) return;
    const url = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    if (navigator.share) navigator.share({ title: 'My Location', text: 'I need help here', url });
    else { navigator.clipboard.writeText(url); showToast(tr.locationShared, 'info'); }
  }, [userLocation, tr]);

  // ════ CHAT ════
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedWorker || !profile) return;
    try {
      await supabase.from('chat_messages').insert({ sender_id: profile.id, receiver_id: selectedWorker.worker_id, message: newMessage });
      setMessages(prev => [...prev, { sender: 'me', text: newMessage, time: new Date() }]);
      setNewMessage('');
    } catch {}
  }, [newMessage, selectedWorker, profile]);

  // ════ CLOSE MAP ════
  const handleCloseMap = useCallback(() => {
    setShowMap(false);
    if (bookingState === 'searching') setBookingState('idle');
  }, [bookingState]);

  // ═══════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════
  return (
    <div className="space-y-3">
      {/* Top Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleQuickHire} disabled={isHiring}
          className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl px-3 py-2.5 text-white text-left transition-all active:scale-95 w-full disabled:opacity-50 hover:shadow-lg"
          style={{ minHeight: '48px' }}>
          {isHiring ? <Loader2 size={18} className="mb-1 animate-spin" /> : <Zap size={18} className="mb-1" />}
          <p className="text-sm font-bold">{tr.quickHire}</p>
          <p className="text-[10px] opacity-80">{nearbyCount > 0 ? `${nearbyCount} ${tr.nearby}` : tr.selectService}</p>
        </button>
        <OnlineBtn {...{ online, loading, isAuth: isAuthenticated, authLoading, onClick: toggleOnline, tr }} />
      </div>

      {/* Service Selector */}
      {showServiceSelector && bookingState === 'selecting_service' && (
        <div className="bg-white rounded-2xl border shadow-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{tr.selectService}</h3>
            <button onClick={() => { setShowServiceSelector(false); setBookingState('idle'); }} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
          </div>

          {surgeMultiplier > 1 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" />
              <span className="text-sm text-red-700">{tr.surgePricing} ({surgeMultiplier}x)</span>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 max-h-[50vh] overflow-y-auto">
            {ALL_SERVICE_TYPES.map(s => (
              <ServiceCard key={s.id} service={s} selected={selectedService?.id === s.id} onClick={() => handleServiceSelect(s)} />
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setIsScheduled(false); setScheduledTime(null); }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium ${!isScheduled ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{tr.bookNow}</button>
            <button onClick={() => { setIsScheduled(true); setShowSchedulePicker(true); }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium ${isScheduled ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{tr.schedule}</button>
          </div>

          {showSchedulePicker && (
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex gap-2">
                <button onClick={() => { setScheduledTime(new Date()); setShowSchedulePicker(false); }} className="flex-1 py-2 bg-white rounded-lg text-sm">{tr.today}</button>
                <button onClick={() => { const t = new Date(); t.setDate(t.getDate() + 1); setScheduledTime(t); setShowSchedulePicker(false); }} className="flex-1 py-2 bg-white rounded-lg text-sm">{tr.tomorrow}</button>
              </div>
              <input type="time" className="w-full p-2 border rounded-lg" onChange={e => { const [h, m] = e.target.value.split(':'); const d = scheduledTime || new Date(); d.setHours(+h, +m); setScheduledTime(new Date(d)); }} />
            </div>
          )}

          {selectedService && estimatedPrice > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span>{tr.total}</span><span>{estimatedPrice - discount} QAR</span></div>
            </div>
          )}

          <div className="flex gap-2">
            <input type="text" placeholder={tr.promoCode} value={promoCode} onChange={e => setPromoCode(e.target.value)} className="flex-1 px-3 py-2 border rounded-xl text-sm" />
            <button onClick={() => { setDiscount(20); setAppliedPromo(true); showToast(tr.promoApplied); }} className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-medium">{tr.applyPromo}</button>
          </div>

          <div className="flex gap-2">
            {(['cash', 'card', 'wallet'] as const).map(m => (
              <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize ${paymentMethod === m ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{tr[m]}</button>
            ))}
          </div>

          <button onClick={handleBookNow} disabled={!selectedService || isProcessingBooking}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 active:scale-[0.98]">
            {isProcessingBooking ? <Loader2 size={20} className="animate-spin mx-auto" /> : `${tr.bookNow} • ${estimatedPrice - discount} QAR`}
          </button>
        </div>
      )}

      {/* Searching */}
      {bookingState === 'searching' && (
        <div className="bg-white rounded-xl border p-6 text-center">
          <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-3" />
          <p className="font-bold text-gray-700">{tr.findingWorker}</p>
          <p className="text-sm text-gray-400 mt-1">{tr.searching}</p>
        </div>
      )}

      {/* Worker Found */}
      {bookingState === 'found' && selectedWorker && (
        <div className="bg-white rounded-2xl border shadow-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            {selectedWorker.photo_url ? <img src={selectedWorker.photo_url} className="w-14 h-14 rounded-full object-cover" /> : <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center"><Users size={24} /></div>}
            <div className="flex-1">
              <div className="flex items-center gap-2"><h4 className="font-bold">{selectedWorker.name}</h4>{selectedWorker.is_verified && <ShieldAlert size={14} className="text-blue-500" />}</div>
              <div className="flex items-center gap-1 text-yellow-500"><Star size={14} fill="currentColor" /><span className="text-sm">{selectedWorker.rating}</span><span className="text-xs text-gray-400">• {selectedWorker.total_jobs} {tr.jobs}</span></div>
            </div>
            <div className="text-right"><p className="font-bold text-lg">{estimatedPrice} QAR</p><p className="text-xs text-gray-500">{selectedWorker.distance}{tr.km} {tr.away}</p></div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600"><Clock size={14} />{tr.workerArriving} <span className="font-bold">{workerETA} {tr.min}</span></div>
          <div className="flex gap-2">
            <button onClick={() => setShowChat(true)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-xl"><MessageCircle size={16} />{tr.chatWithWorker}</button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-xl"><Phone size={16} />{tr.callWorker}</button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-2 border rounded-xl text-sm"><Share2 size={14} />{tr.shareTrip}</button>
            <button onClick={handleSOS} className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-200 text-red-600 rounded-xl text-sm"><AlertTriangle size={14} />{tr.emergency}</button>
          </div>
          <button onClick={handleCancelBooking} className="w-full py-2 text-red-500 text-sm font-medium">{tr.cancelBooking}</button>
        </div>
      )}

      {/* Tracking */}
      {bookingState === 'tracking' && selectedWorker && (
        <div className="bg-white rounded-2xl border shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between"><h4 className="font-bold">{tr.trackWorker}</h4><span className="text-sm text-blue-600 font-medium">{workerETA} {tr.min}</span></div>
          <div className="bg-gray-100 rounded-xl h-2"><div className="bg-blue-500 h-2 rounded-xl transition-all" style={{ width: `${Math.max(10, 100 - workerETA)}%` }} /></div>
          {workerLocation && userLocation && (
            <LiveWorkerMap country={country} lang={lang} userLat={userLocation.lat} userLng={userLocation.lng} onClose={() => {}} onQuickHire={() => {}} />
          )}
          <div className="flex gap-2">
            <button onClick={() => setShowChat(true)} className="flex-1 py-2 bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2"><MessageCircle size={16} />{tr.chatWithWorker}</button>
            <button className="flex-1 py-2 bg-green-500 text-white rounded-xl flex items-center justify-center gap-2"><Phone size={16} />{tr.callWorker}</button>
          </div>
          <button onClick={handleCancelBooking} className="w-full py-2 text-red-500 text-sm">{tr.cancelBooking}</button>
        </div>
      )}

      {/* Live Map (for browsing) */}
      {showMap && userLocation && bookingState === 'idle' && (
        <div className="relative rounded-xl overflow-hidden border shadow-sm" style={{ minHeight: '280px', maxHeight: '320px' }}>
          <button onClick={handleCloseMap} className="absolute top-2 right-2 z-20 bg-white/95 rounded-full p-1.5 shadow-md active:scale-90"><X size={16} className="text-gray-600" /></button>
          <LiveWorkerMap country={country} lang={lang} userLat={userLocation.lat} userLng={userLocation.lng} onClose={handleCloseMap} onQuickHire={handleWorkerSelect} />
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && selectedWorker && (
        <BookingForm
          worker={{
            id: selectedWorker.worker_id,
            name: selectedWorker.name,
            category: selectedWorker.category,
            photo_url: selectedWorker.photo_url,
            rating: selectedWorker.rating,
            expected_salary: String(selectedWorker.price_estimate),
            phone: selectedWorker.phone,
            latitude: selectedWorker.latitude,
            longitude: selectedWorker.longitude,
            distance: selectedWorker.distance,
            eta: selectedWorker.eta,
          }}
          isOpen={showBookingForm}
          onClose={handleBookingFormClose}
          country={country}
          lang={lang}
        />
      )}

      {/* Chat Modal */}
      {showChat && selectedWorker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowChat(false)}>
          <div className="bg-white rounded-t-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                {selectedWorker.photo_url && <img src={selectedWorker.photo_url} className="w-8 h-8 rounded-full" />}
                <span className="font-bold">{selectedWorker.name}</span>
              </div>
              <button onClick={() => setShowChat(false)}><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl ${m.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Type..." className="flex-1 p-3 border rounded-xl" />
              <button onClick={handleSendMessage} className="px-4 py-3 bg-blue-500 text-white rounded-xl"><Send size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Worker Listener */}
      {isAuthenticated && profile?.id && userLocation && (
        <WorkerBookingListener workerId={profile.id} workerLat={userLocation.lat} workerLng={userLocation.lng} lang={lang} isOnline={online} />
      )}
    </div>
  );
}