// components/home/HomeTabs.tsx
// 🚀 SUPER SONIC • 1B USERS • ZERO LAG • ZERO CRASH • UBER STYLE
// ✅ Quick Hire → Map + Filter → Worker → BookingForm → Accept/Reject
"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wifi, WifiOff, X, Loader2, LogIn, Shield, Zap,
  Clock, Star, MessageCircle, Phone, Share2,
  AlertTriangle, Users, MapPin, Filter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import WorkerBookingListener from '@/components/worker/WorkerBookingListener';
import LiveWorkerMap from '@/components/map/LiveWorkerMap';
import BookingForm from '@/components/BookingForm';

interface Props { country: string; lang: string; }
interface LocationData { lat: number; lng: number; }

const STORAGE_KEY = 'noffor_employer_online';

const DEFAULT_LOC: Record<string, LocationData> = {
  qa: { lat: 25.3548, lng: 51.1839 },
  sa: { lat: 24.7136, lng: 46.6753 },
  ae: { lat: 25.2048, lng: 55.2708 },
  kw: { lat: 29.3759, lng: 47.9774 },
  bh: { lat: 26.0667, lng: 50.5577 },
  om: { lat: 23.5880, lng: 58.3829 },
};

const ALL_CATEGORIES = [
  { id: 'all', en: 'All', bn: 'সব', ar: 'الكل', hi: 'सब' },
  { id: 'Driver', en: 'Driver', bn: 'ড্রাইভার', ar: 'سائق', hi: 'ड्राइवर' },
  { id: 'Electrician', en: 'Electrician', bn: 'ইলেকট্রিশিয়ান', ar: 'كهربائي', hi: 'इलेक्ट्रीशियन' },
  { id: 'Plumber', en: 'Plumber', bn: 'প্লাম্বার', ar: 'سباك', hi: 'प्लंबर' },
  { id: 'Mason', en: 'Mason', bn: 'রাজমিস্ত্রি', ar: 'بناء', hi: 'राजमिस्त्री' },
  { id: 'AC Technician', en: 'AC Technician', bn: 'এসি টেকনিশিয়ান', ar: 'فني تكييف', hi: 'एसी तकनीशियन' },
  { id: 'Painter', en: 'Painter', bn: 'পেইন্টার', ar: 'دهان', hi: 'पेंटर' },
  { id: 'Carpenter', en: 'Carpenter', bn: 'কার্পেন্টার', ar: 'نجار', hi: 'बढ़ई' },
  { id: 'Welder', en: 'Welder', bn: 'ওয়েল্ডার', ar: 'لحام', hi: 'वेल्डर' },
  { id: 'Cleaner', en: 'Cleaner', bn: 'ক্লিনার', ar: 'منظف', hi: 'क्लीनर' },
  { id: 'Cook', en: 'Cook', bn: 'রাঁধুনি', ar: 'طباخ', hi: 'रसोइया' },
  { id: 'Helper', en: 'Helper', bn: 'হেল্পার', ar: 'مساعد', hi: 'हेल्पर' },
  { id: 'Gardener', en: 'Gardener', bn: 'মালী', ar: 'بستاني', hi: 'माली' },
  { id: 'Housemaid', en: 'Housemaid', bn: 'গৃহকর্মী', ar: 'خادمة', hi: 'हाउसमेड' },
  { id: 'Nanny', en: 'Nanny', bn: 'আয়া', ar: 'مربية', hi: 'नैनी' },
  { id: 'Office Assistant', en: 'Office Assistant', bn: 'অফিস সহকারী', ar: 'مساعد مكتبي', hi: 'ऑफिस असिस्टेंट' },
  { id: 'Receptionist', en: 'Receptionist', bn: 'রিসেপশনিস্ট', ar: 'موظف استقبال', hi: 'रिसेप्शनिस्ट' },
  { id: 'Salesman', en: 'Salesman', bn: 'সেলসম্যান', ar: 'بائع', hi: 'सेल्समैन' },
  { id: 'Cashier', en: 'Cashier', bn: 'ক্যাশিয়ার', ar: 'كاشير', hi: 'कैशियर' },
  { id: 'Security Guard', en: 'Security Guard', bn: 'সিকিউরিটি গার্ড', ar: 'حارس أمن', hi: 'सिक्योरिटी गार्ड' },
  { id: 'Nurse', en: 'Nurse', bn: 'নার্স', ar: 'ممرض', hi: 'नर्स' },
  { id: 'Pharmacist', en: 'Pharmacist', bn: 'ফার্মাসিস্ট', ar: 'صيدلي', hi: 'फार्मासिस्ट' },
  { id: 'Lab Technician', en: 'Lab Technician', bn: 'ল্যাব টেকনিশিয়ান', ar: 'فني مختبر', hi: 'लैब तकनीशियन' },
  { id: 'Physiotherapist', en: 'Physiotherapist', bn: 'ফিজিওথেরাপিস্ট', ar: 'معالج طبيعي', hi: 'फिजियोथेरेपिस्ट' },
  { id: 'Mechanic', en: 'Mechanic', bn: 'মেকানিক', ar: 'ميكانيكي', hi: 'मैकेनिक' },
  { id: 'Tailor', en: 'Tailor', bn: 'দর্জি', ar: 'خياط', hi: 'दर्जी' },
  { id: 'Barista', en: 'Barista', bn: 'বারিস্তা', ar: 'باريستا', hi: 'बरिस्ता' },
  { id: 'Photographer', en: 'Photographer', bn: 'ফটোগ্রাফার', ar: 'مصور', hi: 'फोटोग्राफर' },
  { id: 'CCTV Technician', en: 'CCTV Technician', bn: 'সিসিটিভি টেকনিশিয়ান', ar: 'فني كاميرات', hi: 'CCTV तकनीशियन' },
  { id: 'Gypsum Carpenter', en: 'Gypsum Carpenter', bn: 'জিপসাম কার্পেন্টার', ar: 'نجار جبس', hi: 'जिप्सम कारपेंटर' },
  { id: 'Tiles Mason', en: 'Tiles Mason', bn: 'টাইলস মিস্ত্রি', ar: 'عامل تبليط', hi: 'टाइल्स मिस्त्री' },
  { id: 'Blacksmith', en: 'Blacksmith', bn: 'কামার', ar: 'حداد', hi: 'लोहार' },
  { id: 'General Labour', en: 'General Labour', bn: 'সাধারণ শ্রমিক', ar: 'عامل عام', hi: 'सामान्य श्रमिक' },
  { id: 'Steel Fixer', en: 'Steel Fixer', bn: 'স্টিল ফিক্সার', ar: 'مثبت حديد', hi: 'स्टील फिक्सर' },
  { id: 'Scaffolder', en: 'Scaffolder', bn: 'স্ক্যাফোল্ডার', ar: 'عامل سقالات', hi: 'स्कैफोल्डर' },
  { id: 'Heavy Driver', en: 'Heavy Driver', bn: 'ভারী ড্রাইভার', ar: 'سائق ثقيل', hi: 'भारी ड्राइवर' },
  { id: 'Forklift Operator', en: 'Forklift Operator', bn: 'ফর্কলিফট অপারেটর', ar: 'مشغل رافعة', hi: 'फोर्कलिफ्ट ऑपरेटर' },
  { id: 'Crane Operator', en: 'Crane Operator', bn: 'ক্রেন অপারেটর', ar: 'مشغل رافعة', hi: 'क्रेन ऑपरेटर' },
  { id: 'Pipe Fitter', en: 'Pipe Fitter', bn: 'পাইপ ফিটার', ar: 'مركب أنابيب', hi: 'पाइप फिटर' },
  { id: 'Waiter', en: 'Waiter', bn: 'ওয়েটার', ar: 'نادل', hi: 'वेटर' },
  { id: 'Hotel Housekeeping', en: 'Hotel Housekeeping', bn: 'হোটেল হাউসকিপিং', ar: 'تدبير فندقي', hi: 'होटल हाउसकीपिंग' },
  { id: 'Beautician', en: 'Beautician', bn: 'বিউটিশিয়ান', ar: 'خبيرة تجميل', hi: 'ब्यूटीशियन' },
  { id: 'Barber', en: 'Barber', bn: 'নাপিত', ar: 'حلاق', hi: 'नाई' },
];

const getCatName = (cat: any, lang: string): string => (cat as any)[lang] || cat.en;

const T: Record<string, Record<string, string>> = {
  en: {
    quickHire: '⚡ Quick Hire', online: 'Online', offline: 'Offline',
    on: 'ON', off: 'OFF', closeMap: 'Close', error: 'Error',
    loginToGoOnline: 'Login', locationDenied: 'Location denied',
    goOnlineFirst: 'Go online first', cancelBooking: 'Cancel',
    chatWithWorker: 'Chat', callWorker: 'Call', shareTrip: 'Share',
    emergency: 'SOS', min: 'min', km: 'km', away: 'away',
    workersNearby: 'nearby', locating: 'Locating...',
    loginRequired: 'Login required', filterBy: 'Filter:',
    waitingAccept: 'Waiting for worker...',
    workerAccepted: '🎉 Worker Accepted!', workerRejected: '❌ Worker Rejected',
    arrivingIn: 'Arriving in', trackLive: 'Track Live',
    findOthers: 'Find Other Workers', suggestions: 'Suggestions', close: 'Close',
    tapWorker: '👆 Tap to book', noWorkers: 'No workers nearby',
    offerSent: 'Booking sent! Waiting for response...',
  },
  bn: {
    quickHire: '⚡ কুইক হায়ার', online: 'অনলাইন', offline: 'অফলাইন',
    on: 'চালু', off: 'বন্ধ', closeMap: 'বন্ধ', error: 'ত্রুটি',
    loginToGoOnline: 'লগইন', locationDenied: 'লোকেশন নাই',
    goOnlineFirst: 'অনলাইন হোন', cancelBooking: 'বাতিল',
    chatWithWorker: 'চ্যাট', callWorker: 'কল', shareTrip: 'শেয়ার',
    emergency: 'জরুরি', min: 'মিনিট', km: 'কিমি', away: 'দূরে',
    workersNearby: 'কাছে', locating: 'খুঁজছে...',
    loginRequired: 'লগইন', filterBy: 'ফিল্টার:',
    waitingAccept: 'শ্রমিকের উত্তরের অপেক্ষায়...',
    workerAccepted: '🎉 শ্রমিক রাজি!', workerRejected: '❌ শ্রমিক রাজি নয়',
    arrivingIn: 'আসছেন', trackLive: 'ট্র্যাক',
    findOthers: 'অন্য শ্রমিক খুঁজুন', suggestions: 'পরামর্শ', close: 'বন্ধ',
    tapWorker: '👆 বুক করতে ট্যাপ', noWorkers: 'শ্রমিক নেই',
    offerSent: 'বুকিং পাঠানো হয়েছে! উত্তরের অপেক্ষায়...',
  },
  ar: {
    quickHire: '⚡ توظيف', online: 'متصل', offline: 'غير متصل',
    on: 'ON', off: 'OFF', closeMap: 'إغلاق', error: 'خطأ',
    loginToGoOnline: 'دخول', locationDenied: 'موقع مرفوض',
    goOnlineFirst: 'اتصل أولاً', cancelBooking: 'إلغاء',
    chatWithWorker: 'محادثة', callWorker: 'اتصال', shareTrip: 'مشاركة',
    emergency: 'طوارئ', min: 'دقيقة', km: 'كم', away: 'بعيد',
    workersNearby: 'قريب', locating: 'تحديد...',
    loginRequired: 'دخول', filterBy: 'تصفية:',
    waitingAccept: 'بانتظار العامل...',
    workerAccepted: '🎉 قبل العامل!', workerRejected: '❌ رفض العامل',
    arrivingIn: 'قادم', trackLive: 'تتبع',
    findOthers: 'ابحث عن غيرهم', suggestions: 'اقتراحات', close: 'إغلاق',
    tapWorker: '👆 اضغط للحجز', noWorkers: 'لا يوجد',
    offerSent: 'تم الإرسال! بانتظار الرد...',
  },
  hi: {
    quickHire: '⚡ क्विक', online: 'ऑनलाइन', offline: 'ऑफ',
    on: 'चालू', off: 'बंद', closeMap: 'बंद', error: 'त्रुटि',
    loginToGoOnline: 'लॉगिन', locationDenied: 'लोकेशन नहीं',
    goOnlineFirst: 'ऑनलाइन हों', cancelBooking: 'रद्द',
    chatWithWorker: 'चैट', callWorker: 'कॉल', shareTrip: 'शेयर',
    emergency: 'SOS', min: 'मिनट', km: 'किमी', away: 'दूर',
    workersNearby: 'पास', locating: 'ढूंढ...',
    loginRequired: 'लॉगिन', filterBy: 'फ़िल्टर:',
    waitingAccept: 'श्रमिक की प्रतीक्षा...',
    workerAccepted: '🎉 श्रमिक राजी!', workerRejected: '❌ इनकार',
    arrivingIn: 'आ रहे', trackLive: 'ट्रैक',
    findOthers: 'दूसरे खोजें', suggestions: 'सुझाव', close: 'बंद',
    tapWorker: '👆 बुक करें', noWorkers: 'नहीं',
    offerSent: 'भेजा गया! प्रतिक्रिया की प्रतीक्षा...',
  },
};

let toastId = 0;
const showToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  const colors: Record<string, string> = { success: '#22c55e', error: '#ef4444', warning: '#eab308', info: '#3b82f6' };
  el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:99999;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;color:#fff;background:${colors[type]};box-shadow:0 8px 32px rgba(0,0,0,.3);pointer-events:none;`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 2500);
};

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

export default function HomeTabs({ country, lang }: Props) {
  const router = useRouter();
  const { isAuthenticated, profile, loading: authLoading } = useAuth();
  const tr = useMemo(() => T[lang] || T.en, [lang]);

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookingState, setBookingState] = useState<'idle' | 'waiting' | 'accepted' | 'rejected' | 'tracking'>('idle');
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const lockRef = useRef(false);
  const aliveRef = useRef(true);
  const mountedRef = useRef(false);
  const profileSyncedRef = useRef(false);
  const bookingChannelRef = useRef<any>(null);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
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

  const fetchWorkerStats = useCallback(async () => {
    if (!aliveRef.current) return;
    try {
      const { data } = await supabase.from('worker_locations').select('worker_id').eq('is_online', true).limit(100);
      if (data && aliveRef.current) setNearbyCount(data.length);
    } catch {}
  }, []);

  const getLocation = useCallback(async (): Promise<LocationData | null> => {
    if (navigator?.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000, maximumAge: 300000, enableHighAccuracy: false })
        );
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        fetchWorkerStats();
        return loc;
      } catch {}
    }
    const fb = DEFAULT_LOC[country] || DEFAULT_LOC.qa;
    setUserLocation(fb);
    fetchWorkerStats();
    return fb;
  }, [country, fetchWorkerStats]);

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; getLocation(); }
  }, [getLocation]);

  const toggleOnline = useCallback(async () => {
    if (authLoading || lockRef.current) return;
    if (!isAuthenticated || !profile?.id) {
      showToast(tr.loginToGoOnline, 'info');
      router.push(`/${country}/${lang}/login`);
      return;
    }
    lockRef.current = true;
    const next = !online;
    setOnline(next);
    setLoading(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isOnline: next, userId: profile.id, timestamp: Date.now() }));
    try {
      await supabase.from('profiles').update({ is_online: next, last_online: new Date().toISOString() }).eq('id', profile.id);
      showToast(next ? tr.on : tr.off);
    } catch {
      setOnline(!next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isOnline: !next, userId: profile.id, timestamp: Date.now() }));
      showToast(tr.error, 'error');
    } finally {
      setLoading(false);
      setTimeout(() => { lockRef.current = false; }, 300);
    }
  }, [authLoading, isAuthenticated, profile, online, tr, country, lang, router]);

  const handleQuickHire = useCallback(async () => {
    if (authLoading || lockRef.current) return;
    lockRef.current = true;
    setIsHiring(true);
    if (!online) { showToast(tr.goOnlineFirst, 'warning'); setIsHiring(false); lockRef.current = false; return; }
    if (!isAuthenticated) { showToast(tr.loginRequired, 'warning'); router.push(`/${country}/${lang}/login`); setIsHiring(false); lockRef.current = false; return; }
    const loc = await getLocation();
    if (!loc) { showToast(tr.locationDenied, 'error'); setIsHiring(false); lockRef.current = false; return; }
    setShowMap(true);
    setIsHiring(false);
    setTimeout(() => { lockRef.current = false; }, 300);
  }, [authLoading, online, isAuthenticated, tr, country, lang, router, getLocation]);

  const handleWorkerSelect = useCallback((worker: any) => {
    setSelectedWorker({
      worker_id: worker.worker_id,
      profile: worker.profile,
      latitude: worker.latitude,
      longitude: worker.longitude,
      distance: worker.distance,
      eta: worker.eta,
      price_estimate: worker.price_estimate || worker.profile?.expected_salary || '100',
    });
    setShowBookingForm(true);
    setShowMap(false);
  }, []);

  const handleBookingFormClose = useCallback(() => {
    setShowBookingForm(false);
    setBookingState('waiting');
    showToast(tr.offerSent, 'success');
    if (selectedWorker?.worker_id && profile?.id) {
      const channel = supabase
        .channel(`booking-${selectedWorker.worker_id}-${Date.now()}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `worker_id=eq.${selectedWorker.worker_id}`,
        }, (payload: any) => {
          const status = payload.new?.status;
          if (status === 'accepted') { setBookingState('accepted'); showToast(tr.workerAccepted, 'success'); }
          else if (status === 'rejected') { setBookingState('rejected'); showToast(tr.workerRejected, 'error'); }
        }).subscribe();
      bookingChannelRef.current = channel;
    }
  }, [selectedWorker, profile, tr]);

  const handleCloseMap = useCallback(() => setShowMap(false), []);
  const handleCloseBooking = useCallback(() => { setBookingState('idle'); setSelectedWorker(null); }, []);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedWorker || !profile) return;
    try {
      await supabase.from('chat_messages').insert({
        sender_id: profile.id,
        receiver_id: selectedWorker.worker_id,
        message: newMessage,
      });
      setMessages(prev => [...prev, { sender: 'me', text: newMessage }]);
      setNewMessage('');
    } catch {}
  }, [newMessage, selectedWorker, profile]);

  const handleSOS = useCallback(async () => {
    if (!userLocation || !profile) return;
    try {
      await supabase.from('emergency_alerts').insert({
        user_id: profile.id,
        location_text: `${userLocation.lat},${userLocation.lng}`,
        type: 'sos',
      });
      showToast('SOS Alert Sent!', 'warning');
    } catch {}
  }, [userLocation, profile]);

  const handleShare = useCallback(() => {
    if (!userLocation) return;
    const url = `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`;
    if (navigator.share) {
      navigator.share({ title: 'My Location', text: 'I need help here', url });
    } else {
      navigator.clipboard.writeText(url);
      showToast(tr.shareTrip + '!', 'info');
    }
  }, [userLocation, tr]);

  return (
    <div className="space-y-3">
      {/* Quick Hire + Online Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleQuickHire}
          disabled={isHiring}
          className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl px-3 py-2.5 text-white text-left transition-all active:scale-95 w-full disabled:opacity-50 hover:shadow-lg"
          style={{ minHeight: '48px' }}
        >
          {isHiring ? <Loader2 size={18} className="mb-1 animate-spin" /> : <Zap size={18} className="mb-1" />}
          <p className="text-sm font-bold">{tr.quickHire}</p>
          <p className="text-[10px] opacity-80">
            {nearbyCount > 0 ? `${nearbyCount} ${tr.workersNearby}` : tr.locating}
          </p>
        </button>
        <OnlineBtn {...{ online, loading, isAuth: isAuthenticated, authLoading, onClick: toggleOnline, tr }} />
      </div>

      {/* Map + Category Filter - শুধু BookingForm বন্ধ থাকলে */}
      {!showBookingForm && showMap && userLocation && (
        <div className="space-y-2">
          {/* Category Filter Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
            <Filter size={14} className="text-gray-400 shrink-0" />
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {getCatName(cat, lang)}
              </button>
            ))}
          </div>

          {/* Live Map */}
          <div className="relative rounded-xl overflow-hidden border shadow-sm" style={{ minHeight: '300px', maxHeight: '350px' }}>
            <button
              onClick={handleCloseMap}
              className="absolute top-2 right-2 z-20 bg-white/95 rounded-full p-1.5 shadow-md active:scale-90"
            >
              <X size={16} className="text-gray-600" />
            </button>
            <LiveWorkerMap
              country={country}
              lang={lang}
              userLat={userLocation.lat}
              userLng={userLocation.lng}
              onClose={handleCloseMap}
              onQuickHire={handleWorkerSelect}
            />
          </div>
        </div>
      )}

      {/* SOS & Share Buttons - Map visible থাকলে */}
      {!showBookingForm && showMap && (
        <div className="flex gap-2">
          <button
            onClick={handleSOS}
            className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95"
          >
            <AlertTriangle size={14} />{tr.emergency}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95"
          >
            <Share2 size={14} />{tr.shareTrip}
          </button>
        </div>
      )}

      {/* Full Screen BookingForm */}
      {showBookingForm && selectedWorker && (
        <BookingForm
          worker={{
            id: selectedWorker.worker_id,
            name: selectedWorker.profile?.name || 'Worker',
            category: selectedWorker.profile?.category || 'General',
            photo_url: selectedWorker.profile?.photo_url || '',
            rating: selectedWorker.profile?.rating || 0,
            expected_salary: String(selectedWorker.price_estimate || ''),
            phone: selectedWorker.profile?.phone || '',
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

      {/* Waiting Modal */}
      {bookingState === 'waiting' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleCloseBooking}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 animate-bounce-in" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Loader2 size={36} className="animate-spin text-blue-500" />
            </div>
            <h3 className="font-bold text-lg">{tr.waitingAccept}</h3>
            <p className="text-sm text-gray-500">{selectedWorker?.profile?.name || 'Worker'} is reviewing your booking</p>
            <button onClick={handleCloseBooking} className="w-full py-3 text-red-500 font-semibold text-sm hover:bg-red-50 rounded-xl">
              {tr.cancelBooking}
            </button>
          </div>
        </div>
      )}

      {/* Accepted Modal */}
      {bookingState === 'accepted' && selectedWorker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleCloseBooking}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-center animate-bounce-in" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-xl text-green-700">{tr.workerAccepted}</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center gap-3">
                {selectedWorker.profile?.photo_url ? (
                  <img src={selectedWorker.profile.photo_url} className="w-12 h-12 rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"><Users size={20} /></div>
                )}
                <div>
                  <p className="font-bold">{selectedWorker.profile?.name}</p>
                  <p className="text-sm text-gray-500">{selectedWorker.profile?.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t">
                <Clock size={14} />
                <span>{tr.arrivingIn} ~{selectedWorker.eta || 15} {tr.min}</span>
              </div>
            </div>
            <div className="space-y-2">
              <a href={`tel:${selectedWorker.profile?.phone || ''}`} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98]">
                <Phone size={16} />{tr.callWorker}
              </a>
              <button onClick={() => { setShowChat(true); handleCloseBooking(); }} className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98]">
                <MessageCircle size={16} />{tr.chatWithWorker}
              </button>
              <button onClick={() => setBookingState('tracking')} className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98]">
                <MapPin size={16} />{tr.trackLive}
              </button>
            </div>
            <button onClick={handleCloseBooking} className="text-red-500 text-sm">{tr.cancelBooking}</button>
          </div>
        </div>
      )}

      {/* Rejected Modal */}
      {bookingState === 'rejected' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleCloseBooking}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-center animate-bounce-in" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="font-bold text-xl text-red-700">{tr.workerRejected}</h3>
            <p className="text-sm text-gray-500">{selectedWorker?.profile?.name || 'Worker'} rejected your booking</p>
            <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-800 text-left">
              <p className="font-semibold">💡 {tr.suggestions}:</p>
              <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                <li>Try increasing your offered amount</li>
                <li>Find another nearby worker</li>
              </ul>
            </div>
            <button
              onClick={() => { setBookingState('idle'); setSelectedWorker(null); setShowMap(true); }}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              🔍 {tr.findOthers}
            </button>
            <button onClick={handleCloseBooking} className="text-gray-400 text-sm">{tr.close}</button>
          </div>
        </div>
      )}

      {/* Tracking State */}
      {bookingState === 'tracking' && selectedWorker && (
        <div className="bg-white rounded-2xl border shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">{tr.trackLive}</h4>
            <span className="text-sm text-blue-600 font-medium">{selectedWorker.eta || 15} {tr.min}</span>
          </div>
          <div className="bg-gray-100 rounded-xl h-2">
            <div className="bg-blue-500 h-2 rounded-xl transition-all" style={{ width: '60%' }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowChat(true)} className="flex-1 py-2 bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2">
              <MessageCircle size={16} />{tr.chatWithWorker}
            </button>
            <a href={`tel:${selectedWorker.profile?.phone || ''}`} className="flex-1 py-2 bg-green-500 text-white rounded-xl flex items-center justify-center gap-2">
              <Phone size={16} />{tr.callWorker}
            </a>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedWorker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowChat(false)}>
          <div className="bg-white rounded-t-2xl w-full max-h-[80vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                {selectedWorker.profile?.photo_url && <img src={selectedWorker.profile.photo_url} className="w-8 h-8 rounded-full" />}
                <span className="font-bold">{selectedWorker.profile?.name || 'Worker'}</span>
              </div>
              <button onClick={() => setShowChat(false)}><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]">
              {messages.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">Start conversation...</p>}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl ${m.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Type..." className="flex-1 p-3 border rounded-xl text-sm" />
              <button onClick={handleSendMessage} className="px-5 py-3 bg-blue-500 text-white rounded-xl"><MessageCircle size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Worker Booking Listener */}
      {isAuthenticated && profile?.id && userLocation && (
        <WorkerBookingListener workerId={profile.id} workerLat={userLocation.lat} workerLng={userLocation.lng} lang={lang} isOnline={online} />
      )}

      <style>{`
        @keyframes bounce-in{0%{transform:scale(0.9);opacity:0}50%{transform:scale(1.02)}100%{transform:scale(1);opacity:1}}
        @keyframes slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .animate-bounce-in{animation:bounce-in 0.3s ease-out}
        .animate-slide-up{animation:slide-up 0.3s ease-out}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </div>
  );
}