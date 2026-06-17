// components/BookingForm.tsx
// 🚀 SUPER SONIC • AUTO-FILL • IMAGE UPLOAD • BODY SCROLL LOCK • 4 LANGUAGES • 1B READY
// ✅ FIXED: Added onConfirm callback
"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef, startTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Clock, DollarSign, Send, X, Loader2, Navigation, Star, User, Briefcase, Camera, Trash2 } from 'lucide-react';
import { getText, LangCode, translateName, translateNumber } from '@/lib/language';
import { compressImage } from '@/lib/imageCompression';
import { useAuth } from '@/context/AuthContext';

const T: Record<string, Record<string, string>> = {
  en: { job_details: 'Job Details', your_name: 'Your Name *', phone: 'Phone *', location: 'Location *', description: 'Description', use_location: 'Use current location', schedule_payment: 'Schedule & Payment', start_date: 'Start Date', start_time: 'Start Time', duration_days: 'Duration (Days)', offered_amount: 'Offered Amount', payment_method: 'Payment Method', expects: 'Worker expects:', cash: 'Cash', online: 'Online', review_confirm: 'Review & Confirm', worker_label: 'Worker:', category_label: 'Category:', distance_label: 'Distance:', eta: 'ETA:', location_label: 'Location:', date_label: 'Date:', duration_label: 'Duration:', total: 'Total:', back: 'Back', next: 'Next', confirm: 'Confirm Booking', submitting: 'Submitting...', required: 'Please fill all required fields', km: 'km', min: 'min', day: 'day(s)', new: 'New', error: 'Booking failed. Please try again.', success: 'Booking confirmed! Redirecting...', add_photos: 'Job Photos', optional: 'Optional', max_photos: 'Max 3', add_more: 'Add More', left: 'left', uploading: 'Uploading images...', compressed: 'WebP compressed • ~25KB per photo', auto_location: 'Auto-detected from GPS' },
  bn: { job_details: 'কাজের বিবরণ', your_name: 'আপনার নাম *', phone: 'ফোন *', location: 'অবস্থান *', description: 'বিবরণ', use_location: 'বর্তমান অবস্থান', schedule_payment: 'সময়সূচি ও পেমেন্ট', start_date: 'শুরুর তারিখ', start_time: 'শুরুর সময়', duration_days: 'সময়কাল (দিন)', offered_amount: 'অফারকৃত মূল্য', payment_method: 'পেমেন্ট পদ্ধতি', expects: 'শ্রমিক আশা করে:', cash: 'ক্যাশ', online: 'অনলাইন', review_confirm: 'রিভিউ ও নিশ্চিতকরণ', worker_label: 'শ্রমিক:', category_label: 'ক্যাটাগরি:', distance_label: 'দূরত্ব:', eta: 'সময়:', location_label: 'অবস্থান:', date_label: 'তারিখ:', duration_label: 'সময়কাল:', total: 'মোট:', back: 'পিছনে', next: 'পরবর্তী', confirm: 'বুকিং নিশ্চিত', submitting: 'জমা হচ্ছে...', required: 'সব প্রয়োজনীয় তথ্য পূরণ করুন', km: 'কিমি', min: 'মিনিট', day: 'দিন', new: 'নতুন', error: 'বুকিং ব্যর্থ। আবার চেষ্টা করুন।', success: 'বুকিং নিশ্চিত! রিডাইরেক্ট হচ্ছে...', add_photos: 'কাজের ছবি', optional: 'ঐচ্ছিক', max_photos: 'সর্বোচ্চ ৩টি', add_more: 'আরও যোগ করুন', left: 'বাকি', uploading: 'ছবি আপলোড হচ্ছে...', compressed: 'WebP কম্প্রেসড • প্রতি ছবি ~২৫KB', auto_location: 'GPS থেকে স্বয়ংক্রিয়ভাবে' },
  ar: { job_details: 'تفاصيل العمل', your_name: 'اسمك *', phone: 'هاتف *', location: 'موقع *', description: 'وصف', use_location: 'استخدام الموقع', schedule_payment: 'الجدول والدفع', start_date: 'تاريخ البدء', start_time: 'وقت البدء', duration_days: 'المدة (أيام)', offered_amount: 'المبلغ', payment_method: 'طريقة الدفع', expects: 'العامل يتوقع:', cash: 'نقداً', online: 'أونلاين', review_confirm: 'مراجعة وتأكيد', worker_label: 'العامل:', category_label: 'الفئة:', distance_label: 'المسافة:', eta: 'الوقت:', location_label: 'الموقع:', date_label: 'التاريخ:', duration_label: 'المدة:', total: 'المجموع:', back: 'رجوع', next: 'التالي', confirm: 'تأكيد', submitting: 'جاري...', required: 'يرجى ملء جميع الحقول', km: 'كم', min: 'دقيقة', day: 'يوم', new: 'جديد', error: 'فشل الحجز. حاول مرة أخرى.', success: 'تم التأكيد! جاري التحويل...', add_photos: 'صور العمل', optional: 'اختياري', max_photos: 'الحد الأقصى ٣', add_more: 'أضف المزيد', left: 'متبقي', uploading: 'جاري رفع الصور...', compressed: 'WebP مضغوط • ~٢٥KB لكل صورة', auto_location: 'تم تحديده تلقائياً من GPS' },
  hi: { job_details: 'काम का विवरण', your_name: 'आपका नाम *', phone: 'फ़ोन *', location: 'स्थान *', description: 'विवरण', use_location: 'वर्तमान स्थान', schedule_payment: 'समय और भुगतान', start_date: 'शुरू तारीख', start_time: 'शुरू समय', duration_days: 'अवधि (दिन)', offered_amount: 'राशि', payment_method: 'भुगतान विधि', expects: 'श्रमिक अपेक्षा:', cash: 'नकद', online: 'ऑनलाइन', review_confirm: 'समीक्षा और पुष्टि', worker_label: 'श्रमिक:', category_label: 'श्रेणी:', distance_label: 'दूरी:', eta: 'समय:', location_label: 'स्थान:', date_label: 'तारीख:', duration_label: 'अवधि:', total: 'कुल:', back: 'पीछे', next: 'अगला', confirm: 'पुष्टि', submitting: 'जमा हो रहा...', required: 'सभी ज़रूरी जानकारी भरें', km: 'किमी', min: 'मिनट', day: 'दिन', new: 'नया', error: 'बुकिंग विफल। पुनः प्रयास करें।', success: 'पुष्टि हो गई! रीडायरेक्ट...', add_photos: 'काम की तस्वीरें', optional: 'वैकल्पिक', max_photos: 'अधिकतम ३', add_more: 'और जोड़ें', left: 'बाकी', uploading: 'तस्वीरें अपलोड हो रही...', compressed: 'WebP कंप्रेस्ड • ~२५KB प्रति फोटो', auto_location: 'GPS से स्वतः पता लगाया' },
};

const CATEGORY_MAP: Record<string, Record<string, string>> = {
  Driver: { bn: 'ড্রাইভার', ar: 'سائق', hi: 'ड्राइवर' }, Electrician: { bn: 'ইলেকট্রিশিয়ান', ar: 'كهربائي', hi: 'इलेक्ट्रीशियन' },
  Plumber: { bn: 'প্লাম্বার', ar: 'سباك', hi: 'प्लंबर' }, Mason: { bn: 'রাজমিস্ত্রি', ar: 'بناء', hi: 'राजमिस्त्री' },
  'AC Technician': { bn: 'এসি টেকনিশিয়ান', ar: 'فني تكييف', hi: 'एसी तकनीशियन' }, Painter: { bn: 'পেইন্টার', ar: 'دهان', hi: 'पेंटर' },
  Carpenter: { bn: 'কার্পেন্টার', ar: 'نجار', hi: 'बढ़ई' }, Welder: { bn: 'ওয়েল্ডার', ar: 'لحام', hi: 'वेल्डर' },
  Cleaner: { bn: 'ক্লিনার', ar: 'منظف', hi: 'क्लीनर' }, Cook: { bn: 'রাঁধুনি', ar: 'طباخ', hi: 'रसोइया' },
  Helper: { bn: 'হেল্পার', ar: 'مساعد', hi: 'हेल्पर' }, Gardener: { bn: 'মালী', ar: 'بستاني', hi: 'माली' },
  Housemaid: { bn: 'গৃহকর্মী', ar: 'خادمة', hi: 'हाउसमेड' }, Nanny: { bn: 'আয়া', ar: 'مربية', hi: 'नैनी' },
  'Office Assistant': { bn: 'অফিস সহকারী', ar: 'مساعد مكتبي', hi: 'ऑफिस असिस्टेंट' }, Receptionist: { bn: 'রিসেপশনিস্ট', ar: 'موظف استقبال', hi: 'रिसेप्शनिस्ट' },
  Salesman: { bn: 'সেলসম্যান', ar: 'بائع', hi: 'सेल्समैन' }, Cashier: { bn: 'ক্যাশিয়ার', ar: 'كاشير', hi: 'कैशियर' },
  'Security Guard': { bn: 'সিকিউরিটি গার্ড', ar: 'حارس أمن', hi: 'सिक्योरिटी गार्ड' }, Nurse: { bn: 'নার্স', ar: 'ممرض', hi: 'नर्स' },
  Pharmacist: { bn: 'ফার্মাসিস্ট', ar: 'صيدلي', hi: 'फार्मासिस्ट' }, 'Lab Technician': { bn: 'ল্যাব টেকনিশিয়ান', ar: 'فني مختبر', hi: 'लैब तकनीशियन' },
  Physiotherapist: { bn: 'ফিজিওথেরাপিস্ট', ar: 'معالج طبيعي', hi: 'फिजियोथेरेपिस्ट' }, Mechanic: { bn: 'মেকানিক', ar: 'ميكانيكي', hi: 'मैकेनिक' },
  Tailor: { bn: 'দর্জি', ar: 'خياط', hi: 'दर्जी' }, Barista: { bn: 'বারিস্তা', ar: 'باريستا', hi: 'बरिस्ता' },
  Photographer: { bn: 'ফটোগ্রাফার', ar: 'مصور', hi: 'फोटोग्राफर' }, 'CCTV Technician': { bn: 'সিসিটিভি টেকনিশিয়ান', ar: 'فني كاميرات', hi: 'CCTV तकनीशियन' },
  'Gypsum Carpenter': { bn: 'জিপসাম কার্পেন্টার', ar: 'نجار جبس', hi: 'जिप्सम कारपेंटर' }, 'Tiles Mason': { bn: 'টাইলস মিস্ত্রি', ar: 'عامل تبليط', hi: 'टाइल्स मिस्त्री' },
  Blacksmith: { bn: 'কামার', ar: 'حداد', hi: 'लोहार' }, 'General Labour': { bn: 'সাধারণ শ্রমিক', ar: 'عامل عام', hi: 'सामान्य श्रमिक' },
  'Steel Fixer': { bn: 'স্টিল ফিক্সার', ar: 'مثبت حديد', hi: 'स्टील फिक्सर' }, Scaffolder: { bn: 'স্ক্যাফোল্ডার', ar: 'عامل سقالات', hi: 'स्कैफोल्डर' },
  'Heavy Driver': { bn: 'ভারী ড্রাইভার', ar: 'سائق ثقيل', hi: 'भारी ड्राइवर' }, 'Forklift Operator': { bn: 'ফর্কলিফট অপারেটর', ar: 'مشغل رافعة', hi: 'फोर्कलिफ्ट ऑपरेटर' },
  'Crane Operator': { bn: 'ক্রেন অপারেটর', ar: 'مشغل رافعة', hi: 'क्रेन ऑपरेटर' }, 'Pipe Fitter': { bn: 'পাইপ ফিটার', ar: 'مركب أنابيب', hi: 'पाइप फिटर' },
  Waiter: { bn: 'ওয়েটার', ar: 'نادل', hi: 'वेटर' }, 'Hotel Housekeeping': { bn: 'হোটেল হাউসকিপিং', ar: 'تدبير فندقي', hi: 'होटल हाउसकीपिंग' },
  Beautician: { bn: 'বিউটিশিয়ান', ar: 'خبيرة تجميل', hi: 'ब्यूटीशियन' }, Barber: { bn: 'নাপিত', ar: 'حلاق', hi: 'नाई' },
};

const translateCategory = (category: string, lang: string): string => CATEGORY_MAP[category]?.[lang] || category;
const translateTime = (time: string, lang: string): string => {
  if (lang === 'en') return time;
  const maps: Record<string, Record<string, string>> = { bn: {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'}, ar: {'0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩'}, hi: {'0':'०','1':'१','2':'२','3':'३','4':'४','5':'५','6':'६','7':'७','8':'८','9':'९'} };
  const map = maps[lang]; if (!map) return time;
  return time.replace(/[0-9]/g, (d) => map[d] || d);
};

const CONFIG = { GEOLOCATION_TIMEOUT: 5000, AVG_SPEED_KMPH: 30, EARTH_RADIUS_KM: 6371, MAX_RETRY: 2 };

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(CONFIG.EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
function calcETA(distKm: number): number { return Math.ceil((distKm / CONFIG.AVG_SPEED_KMPH) * 60); }

interface Worker { id: string; name: string; category: string; photo_url?: string; rating?: number; expected_salary?: string; phone?: string; latitude?: number; longitude?: number; distance?: number; eta?: number; }

// ✅ FIXED: Added onConfirm to interface
interface BookingFormProps { 
  worker: Worker; 
  isOpen: boolean; 
  onClose: () => void; 
  country: string; 
  lang: string;
  onConfirm?: (bookingId: string, bookingData: any) => void; // ✅ NEW
}

const StepIndicator = React.memo(({ step }: { step: number }) => (
  <div className="flex items-center px-4 py-3 gap-2 shrink-0">
    {[1, 2, 3].map((s) => (
      <div key={s} className="flex items-center gap-2 flex-1">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${step >= s ? 'bg-green-600 text-white scale-110' : 'bg-gray-200 text-gray-400'}`}>{step > s ? '✓' : s}</div>
        {s < 3 && <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
      </div>
    ))}
  </div>
));
StepIndicator.displayName = 'StepIndicator';

const WorkerHeader = React.memo(({ worker, txt, lang, onClose }: { worker: Worker; txt: Record<string, string>; lang: string; onClose: () => void }) => (
  <div className="sticky top-0 bg-white border-b p-3 sm:p-4 flex items-center justify-between z-10 rounded-t-2xl shrink-0">
    <div className="flex items-center gap-3 min-w-0">
      <img src={worker.photo_url || '/default-avatar.png'} alt={worker.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover bg-gray-100 flex-shrink-0" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }} />
      <div className="min-w-0"><p className="font-bold text-gray-800 text-sm sm:text-base truncate">{translateName(worker.name, lang)}</p><p className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1"><Briefcase size={10} /> {translateCategory(worker.category, lang)}{worker.rating && <><span className="mx-1">•</span><Star size={10} className="text-yellow-500" /> {worker.rating}</>}{!worker.rating && <><span className="mx-1">•</span>{txt.new}</>}</p></div>
    </div>
    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"><X size={20} className="text-gray-400" /></button>
  </div>
));
WorkerHeader.displayName = 'WorkerHeader';

const InputField = React.memo(({ label, value, onChange, type = 'text', icon, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; icon?: React.ReactNode; placeholder?: string; }) => (
  <div><label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">{label}</label><div className="relative"><input value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder} className={`w-full px-3 py-2.5 ${icon ? 'pl-9' : ''} border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all`} />{icon && <span className="absolute left-3 top-3 text-gray-400">{icon}</span>}</div></div>
));
InputField.displayName = 'InputField';

// ✅ FIXED: Destructure onConfirm from props
export default function BookingForm({ worker, isOpen, onClose, country, lang, onConfirm }: BookingFormProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const txt = useMemo(() => T[lang] || T.en, [lang]);
  const currencyText = useMemo(() => lang === 'bn' ? 'রিয়াল' : lang === 'ar' ? 'ريال' : lang === 'hi' ? 'रियाल' : 'QAR', [lang]);
  const todayText = useMemo(() => lang === 'bn' ? 'আজ' : lang === 'ar' ? 'اليوم' : lang === 'hi' ? 'आज' : 'Today', [lang]);
  const atText = useMemo(() => lang === 'bn' ? 'এ' : lang === 'ar' ? 'في' : lang === 'hi' ? 'पर' : 'at', [lang]);
  
  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; document.body.style.position = 'fixed'; document.body.style.width = '100%'; document.body.style.top = `-${window.scrollY}px`; }
    else { const scrollY = document.body.style.top; document.body.style.overflow = ''; document.body.style.position = ''; document.body.style.width = ''; document.body.style.top = ''; if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1); }
    return () => { document.body.style.overflow = ''; document.body.style.position = ''; document.body.style.width = ''; document.body.style.top = ''; };
  }, [isOpen]);
  
  if (!worker || !isOpen) return null;
  
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [offeredAmount, setOfferedAmount] = useState(worker?.expected_salary || '');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const alive = useRef(true);
  const autoFilledRef = useRef(false);

  useEffect(() => {
    if (isOpen && profile && !autoFilledRef.current) {
      autoFilledRef.current = true;
      if (profile.name) setName(profile.name);
      if (profile.phone) setPhone(profile.phone);
    }
    if (!isOpen) autoFilledRef.current = false;
  }, [isOpen, profile]);

  useEffect(() => {
    if (isOpen && userLocation && !location) {
      setLocation(`${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`);
    }
  }, [isOpen, userLocation]);

  useEffect(() => { return () => { imagePreviewUrls.forEach(url => URL.revokeObjectURL(url)); }; }, [imagePreviewUrls]);

  useEffect(() => {
    if (!isOpen) return; alive.current = true;
    try { const cached = sessionStorage.getItem('user_loc'); if (cached) { const p = JSON.parse(cached); if (Date.now() - p.t < 300000) { startTransition(() => setUserLocation({ lat: p.lat, lng: p.lng })); return; } } } catch {}
    if (navigator.geolocation) { navigator.geolocation.getCurrentPosition((pos) => { if (!alive.current) return; const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; startTransition(() => setUserLocation(loc)); try { sessionStorage.setItem('user_loc', JSON.stringify({ ...loc, t: Date.now() })); } catch {} }, () => {}, { timeout: CONFIG.GEOLOCATION_TIMEOUT, maximumAge: 300000 }); }
    return () => { alive.current = false; };
  }, [isOpen]);

  const { distanceKm, etaMinutes } = useMemo(() => {
    if (!userLocation || !worker.latitude || !worker.longitude) return {};
    const dist = calcDistance(userLocation.lat, userLocation.lng, worker.latitude, worker.longitude);
    return { distanceKm: dist, etaMinutes: calcETA(dist) };
  }, [userLocation, worker.latitude, worker.longitude]);

  const useCurrentLocation = useCallback(() => { if (userLocation) setLocation(`${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`); }, [userLocation]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const newImages = Array.from(files).slice(0, 3 - images.length);
    setImages(prev => [...prev, ...newImages]);
    newImages.forEach(file => { const url = URL.createObjectURL(file); setImagePreviewUrls(prev => [...prev, url]); });
    e.target.value = '';
  }, [images.length]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => { URL.revokeObjectURL(prev[index]); return prev.filter((_, i) => i !== index); });
  }, []);

  const uploadImages = useCallback(async (): Promise<string[]> => {
    if (images.length === 0) return [];
    setUploadingImages(true); const urls: string[] = [];
    for (const file of images) {
      try {
        const thumbnail = await compressImage(file, 'thumbnail');
        const full = await compressImage(file, 'full');
        const timestamp = Date.now(); const random = Math.random().toString(36).substring(7); const baseName = `${timestamp}-${random}`;
        await supabase.storage.from('booking_images').upload(`thumbnails/${baseName}.webp`, thumbnail, { contentType: 'image/webp', upsert: true });
        await supabase.storage.from('booking_images').upload(`full/${baseName}.webp`, full, { contentType: 'image/webp', upsert: true });
        const thumbUrl = supabase.storage.from('booking_images').getPublicUrl(`thumbnails/${baseName}.webp`).data.publicUrl;
        const fullUrl = supabase.storage.from('booking_images').getPublicUrl(`full/${baseName}.webp`).data.publicUrl;
        urls.push(JSON.stringify({ thumbnail: thumbUrl, full: fullUrl }));
      } catch (err) { console.error('Upload error:', err); }
    }
    setUploadingImages(false); return urls;
  }, [images]);

  // ✅ FIXED: handleSubmit এখন booking ID রিটার্ন করবে এবং onConfirm কল করবে
  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !phone.trim() || !location.trim()) { alert(txt.required); return; }
    if (submitting) return; setSubmitting(true);
    const uploadedImages = await uploadImages();
    const cleanAmount = parseInt(String(offeredAmount).replace(/[^0-9]/g, '')) || 0;
    const bookingData = {
      worker_id: worker.id, employer_name: name.trim(), worker_name: worker.name,
      job_title: worker.category, job_description: description.trim(), category: worker.category,
      offered_amount: cleanAmount, payment_type: 'fixed', payment_method: paymentMethod,
      total_amount: cleanAmount, start_date: startDate || new Date().toISOString().split('T')[0],
      start_time: startTime || '08:00', duration_days: parseInt(duration) || 1,
      location_text: location.trim(), location_lat: userLocation?.lat || null, location_lng: userLocation?.lng || null,
      worker_lat: worker.latitude || null, worker_lon: worker.longitude || null,
      distance_km: distanceKm || null, eta_minutes: etaMinutes || null,
      images: uploadedImages, special_instructions: description.trim(), contact_phone: phone.trim(),
      status: 'pending', employer_id: profile?.id || null, // ✅ FIXED: employer_id set
    };
    for (let r = 0; r <= CONFIG.MAX_RETRY; r++) {
      try {
        const { data: inserted, error } = await supabase.from('bookings').insert(bookingData).select('id').single();
        if (error) throw error;
        
        // ✅ Notification
        supabase.from('notifications').insert({ 
          user_id: worker.id, 
          title: 'New Booking Request', 
          message: `${name} - ${cleanAmount} ${currencyText}`, 
          type: 'booking_request', 
          is_read: false,
          metadata: { booking_id: inserted.id }
        }).then(() => {});
        
        // ✅ FIXED: Call onConfirm with booking ID
        onConfirm?.(inserted.id, bookingData);
        
        onClose(); 
        return;
      } catch (err: any) { 
        if (r >= CONFIG.MAX_RETRY) { 
          console.error('Booking error:', err); 
          alert(txt.error); 
        } else { 
          await new Promise(res => setTimeout(res, 500 * (r + 1))); 
        } 
      }
    }
    setSubmitting(false);
  }, [name, phone, location, description, offeredAmount, paymentMethod, startDate, startTime, duration, userLocation, worker, distanceKm, etaMinutes, submitting, txt, currencyText, onClose, uploadImages, profile, onConfirm]);

  const nextStep = useCallback(() => setStep(s => Math.min(s + 1, 3)), []);
  const prevStep = useCallback(() => setStep(s => Math.max(s - 1, 1)), []);

  const reviewItems = useMemo(() => {
    const cleanAmount = String(offeredAmount).replace(/[^0-9]/g, '');
    const displayAmount = cleanAmount ? `${translateNumber(cleanAmount, lang)} ${currencyText}` : `0 ${currencyText}`;
    const displayTime = translateTime(startTime || '08:00', lang);
    let displayDate: string;
    if (startDate) {
      const dateObj = new Date(startDate + 'T00:00:00'); const day = dateObj.getDate(); const year = dateObj.getFullYear();
      const monthNames: Record<string, string[]> = { en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], bn: ['জানু','ফেব্রু','মার্চ','এপ্রি','মে','জুন','জুলা','আগ','সেপ্টে','অক্টো','নভে','ডিসে'], ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'], hi: ['जन','फ़र','मार्च','अप्रैल','मई','जून','जुला','अग','सित','अक्टू','नव','दिस'] };
      const months = monthNames[lang] || monthNames.en;
      displayDate = `${translateNumber(String(day), lang)} ${months[dateObj.getMonth()]} ${translateNumber(String(year), lang)}`;
    } else { displayDate = todayText; }
    return [
      { label: txt.worker_label, value: translateName(worker.name, lang) },
      { label: txt.category_label, value: translateCategory(worker.category, lang) },
      ...(distanceKm ? [{ label: txt.distance_label, value: `${translateNumber(String(distanceKm), lang)} ${txt.km}`, cls: 'text-blue-600' }] : []),
      ...(etaMinutes ? [{ label: txt.eta, value: `${translateNumber(String(etaMinutes), lang)} ${txt.min}`, cls: 'text-green-600' }] : []),
      { label: txt.location_label, value: location },
      { label: txt.date_label, value: `${displayDate} ${atText} ${displayTime}` },
      { label: txt.duration_label, value: `${translateNumber(String(duration), lang)} ${txt.day}` },
      { label: txt.total, value: displayAmount, cls: 'text-green-600 font-bold text-base' },
    ];
  }, [worker, distanceKm, etaMinutes, location, startDate, startTime, duration, offeredAmount, txt, lang, currencyText, todayText, atText]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <WorkerHeader worker={worker} txt={txt} lang={lang} onClose={onClose} />
        <StepIndicator step={step} />
        <div className="flex-1 overflow-y-auto px-4 overscroll-contain">
          {step === 1 && (
            <div className="space-y-3 py-3">
              <h3 className="font-bold text-base sm:text-lg text-gray-800">{txt.job_details}</h3>
              <InputField label={txt.your_name} value={name} onChange={setName} icon={<User size={16} />} />
              <InputField label={txt.phone} value={phone} onChange={setPhone} type="tel" />
              <div>
                <InputField label={txt.location} value={location} onChange={setLocation} icon={<MapPin size={16} />} placeholder={txt.auto_location} />
                {userLocation && <button onClick={useCurrentLocation} className="text-[11px] sm:text-xs text-green-600 mt-1 flex items-center gap-1 hover:text-green-800 transition-colors"><Navigation size={12} /> {txt.use_location}</button>}
              </div>
              <div><label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">{txt.description}</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none transition-all" /></div>
              
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">📸 {txt.add_photos} <span className="text-gray-400 font-normal">({txt.optional} • {txt.max_photos})</span></label>
                {imagePreviewUrls.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {imagePreviewUrls.map((url, i) => (
                      <div key={i} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100">
                        <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                        <button onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><Trash2 size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < 3 && (
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                    <Camera size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{images.length === 0 ? txt.add_photos : `${txt.add_more} (${3 - images.length} ${txt.left})`}</span>
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" multiple />
                  </label>
                )}
                {uploadingImages && <p className="text-xs text-blue-500 mt-1">{txt.uploading}</p>}
                <p className="text-[10px] text-gray-400 mt-1">{txt.compressed}</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 py-3">
              <h3 className="font-bold text-base sm:text-lg text-gray-800">{txt.schedule_payment}</h3>
              <div className="grid grid-cols-2 gap-3"><InputField label={txt.start_date} value={startDate} onChange={setStartDate} type="date" icon={<Calendar size={16} />} /><InputField label={txt.start_time} value={startTime} onChange={setStartTime} type="time" icon={<Clock size={16} />} /></div>
              <InputField label={txt.duration_days} value={duration} onChange={setDuration} type="number" />
              <div><InputField label={`${txt.offered_amount} (${currencyText})`} value={offeredAmount} onChange={setOfferedAmount} type="number" icon={<DollarSign size={16} />} />{worker.expected_salary && <p className="text-[11px] sm:text-xs text-gray-400 mt-1">{txt.expects} {translateNumber(String(worker.expected_salary).replace(/[^0-9]/g, ''), lang)} {currencyText}</p>}</div>
              <div><label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">{txt.payment_method}</label><div className="flex gap-2">{['cash', 'online'].map(m => (<button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all active:scale-95 ${paymentMethod === m ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{m === 'cash' ? `💵 ${txt.cash}` : `💳 ${txt.online}`}</button>))}</div></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 py-3">
              <h3 className="font-bold text-base sm:text-lg text-gray-800">{txt.review_confirm}</h3>
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2">
                {reviewItems.map((item, i) => (<div key={i}>{item.label === txt.total && <hr className="border-gray-200 my-1" />}<div className="flex justify-between text-xs sm:text-sm"><span className="text-gray-500">{item.label}</span><span className={`font-medium ${item.cls || 'text-gray-800'}`}>{item.value}</span></div></div>))}
              </div>
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-2xl shrink-0">
          <div className="flex gap-3">
            {step > 1 && <button onClick={prevStep} className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 active:scale-95 transition-all">{txt.back}</button>}
            {step < 3 ? <button onClick={nextStep} className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 active:scale-[0.98] transition-all">{txt.next}</button> : <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50 active:scale-[0.98] transition-all">{submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}{submitting ? txt.submitting : txt.confirm}</button>}
          </div>
        </div>
      </div>
      <style>{`@keyframes slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}.animate-slide-up{animation:slide-up 0.3s ease-out}`}</style>
    </div>
  );
}