// components/BookingForm.tsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Clock, DollarSign, Send, X, Loader2, Navigation } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

interface Worker {
  id: string;
  name: string;
  category: string;
  photo_url?: string;
  rating?: number;
  experience?: string;
  expected_salary?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  eta?: number;
}

interface BookingFormProps {
  worker: Worker;
  isOpen: boolean;
  onClose: () => void;
  country: string;
  lang: string;
}

export default function BookingForm({ worker, isOpen, onClose, country, lang }: BookingFormProps) {
  const router = useRouter();
  const t = (key: string) => getText(lang as LangCode, key);
  
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

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, [isOpen]);

  const calculateDistance = useCallback(() => {
    if (!userLocation || !worker.latitude || !worker.longitude) return undefined;
    const R = 6371;
    const dLat = (worker.latitude - userLocation.lat) * Math.PI / 180;
    const dLon = (worker.longitude - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI/180) * Math.cos(worker.latitude * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  }, [userLocation, worker]);

  const calculateETA = useCallback((distanceKm?: number) => {
    if (!distanceKm) return undefined;
    const avgSpeed = 30;
    return Math.ceil((distanceKm / avgSpeed) * 60);
  }, []);

  const distanceKm = calculateDistance();
  const etaMinutes = calculateETA(distanceKm);

  const handleSubmit = async () => {
    if (!name || !phone || !location) {
      alert(t('required') || 'Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        worker_id: worker.id,
        employer_name: name,
        job_title: worker.category,
        job_description: description,
        category: worker.category,
        offered_amount: parseInt(offeredAmount) || 0,
        payment_type: 'fixed',
        payment_method: paymentMethod,
        hourly_rate: undefined,
        daily_rate: undefined,
        total_amount: parseInt(offeredAmount) || 0,
        start_date: startDate || new Date().toISOString().split('T')[0],
        start_time: startTime || '08:00',
        duration_days: parseInt(duration) || 1,
        location_text: location,
        location_lat: userLocation?.lat || undefined,
        location_lng: userLocation?.lng || undefined,
        worker_lat: worker.latitude || undefined,
        worker_lon: worker.longitude || undefined,
        distance_km: distanceKm || undefined,
        eta_minutes: etaMinutes || undefined,
        special_instructions: '',
        contact_phone: phone,
        status: 'pending',
        employer_id: phone,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: worker.id,
        title: lang === 'bn' ? 'নতুন বুকিং রিকোয়েস্ট' : 'New Booking Request',
        message: `${name} - ${offeredAmount} QAR`,
        type: 'booking_request',
        is_read: false,
      });

      onClose();
      router.push(`/${country}/${lang}/tracking/${data.id}`);
    } catch (err: any) {
      console.error('Booking error:', err);
      alert(err.message || 'Booking failed');
    }
    setSubmitting(false);
  };

  const texts: any = {
    en: { job_details: 'Job Details', your_name: 'Your Name *', phone: 'Phone *', location: 'Location *', description: 'Description', use_location: 'Use current location', schedule_payment: 'Schedule & Payment', start_date: 'Start Date', start_time: 'Start Time', duration_days: 'Duration (Days)', offered_amount: 'Offered Amount (QAR)', payment_method: 'Payment Method', expects: 'Worker expects:', cash: '💵 Cash', online: '💳 Online', review_confirm: 'Review & Confirm', worker_label: 'Worker:', category_label: 'Category:', distance_label: 'Distance:', eta: 'ETA:', location_label: 'Location:', date_label: 'Date:', duration_label: 'Duration:', total: 'Total:', back: 'Back', next: 'Next', confirm: 'Confirm Booking', submitting: 'Submitting...', required: 'Please fill all required fields', km: 'km', min: 'min', day: 'day(s)' },
    bn: { job_details: 'কাজের বিবরণ', your_name: 'আপনার নাম *', phone: 'ফোন *', location: 'অবস্থান *', description: 'বিবরণ', use_location: 'বর্তমান অবস্থান ব্যবহার', schedule_payment: 'সময়সূচি ও পেমেন্ট', start_date: 'শুরুর তারিখ', start_time: 'শুরুর সময়', duration_days: 'সময়কাল (দিন)', offered_amount: 'অফারকৃত মূল্য (QAR)', payment_method: 'পেমেন্ট পদ্ধতি', expects: 'শ্রমিক আশা করে:', cash: '💵 ক্যাশ', online: '💳 অনলাইন', review_confirm: 'রিভিউ ও নিশ্চিতকরণ', worker_label: 'শ্রমিক:', category_label: 'ক্যাটাগরি:', distance_label: 'দূরত্ব:', eta: 'সময়:', location_label: 'অবস্থান:', date_label: 'তারিখ:', duration_label: 'সময়কাল:', total: 'মোট:', back: 'পিছনে', next: 'পরবর্তী', confirm: 'বুকিং নিশ্চিত', submitting: 'জমা হচ্ছে...', required: 'সব প্রয়োজনীয় তথ্য পূরণ করুন', km: 'কিমি', min: 'মিনিট', day: 'দিন' },
    ar: { job_details: 'تفاصيل العمل', your_name: 'اسمك *', phone: 'هاتف *', location: 'موقع *', description: 'وصف', use_location: 'استخدام الموقع الحالي', schedule_payment: 'الجدول والدفع', start_date: 'تاريخ البدء', start_time: 'وقت البدء', duration_days: 'المدة (أيام)', offered_amount: 'المبلغ المعروض (QAR)', payment_method: 'طريقة الدفع', expects: 'العامل يتوقع:', cash: '💵 نقداً', online: '💳 أونلاين', review_confirm: 'مراجعة وتأكيد', worker_label: 'العامل:', category_label: 'الفئة:', distance_label: 'المسافة:', eta: 'الوقت:', location_label: 'الموقع:', date_label: 'التاريخ:', duration_label: 'المدة:', total: 'المجموع:', back: 'رجوع', next: 'التالي', confirm: 'تأكيد', submitting: 'جاري...', required: 'يرجى ملء جميع الحقول', km: 'كم', min: 'دقيقة', day: 'يوم' },
    hi: { job_details: 'काम का विवरण', your_name: 'आपका नाम *', phone: 'फ़ोन *', location: 'स्थान *', description: 'विवरण', use_location: 'वर्तमान स्थान', schedule_payment: 'समय और भुगतान', start_date: 'शुरू तारीख', start_time: 'शुरू समय', duration_days: 'अवधि (दिन)', offered_amount: 'राशि (QAR)', payment_method: 'भुगतान विधि', expects: 'श्रमिक अपेक्षा:', cash: '💵 नकद', online: '💳 ऑनलाइन', review_confirm: 'समीक्षा और पुष्टि', worker_label: 'श्रमिक:', category_label: 'श्रेणी:', distance_label: 'दूरी:', eta: 'समय:', location_label: 'स्थान:', date_label: 'तारीख:', duration_label: 'अवधि:', total: 'कुल:', back: 'पीछे', next: 'अगला', confirm: 'पुष्टि', submitting: 'जमा हो रहा...', required: 'सभी ज़रूरी जानकारी भरें', km: 'किमी', min: 'मिनट', day: 'दिन' },
  };
  const txt = texts[lang] || texts.en;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <img src={worker.photo_url || '/default-avatar.png'} className="w-10 h-10 rounded-full" alt="" />
            <div>
              <p className="font-bold text-gray-800">{worker.name}</p>
              <p className="text-xs text-gray-500">{worker.category} • ⭐ {worker.rating || 'New'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="flex items-center px-4 py-3 gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="p-4">
          {step === 1 && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-800">{txt.job_details}</h3>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{txt.your_name}</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{txt.phone}</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{txt.location}</label>
                <div className="relative">
                  <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2.5 pl-9 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                  <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                </div>
                {userLocation && (
                  <button onClick={() => setLocation(`${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`)} className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Navigation size={12} /> {txt.use_location}
                  </button>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{txt.description}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-800">{txt.schedule_payment}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{txt.start_date}</label>
                  <div className="relative">
                    <input value={startDate} onChange={e => setStartDate(e.target.value)} type="date" className="w-full px-3 py-2.5 pl-9 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                    <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{txt.start_time}</label>
                  <div className="relative">
                    <input value={startTime} onChange={e => setStartTime(e.target.value)} type="time" className="w-full px-3 py-2.5 pl-9 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                    <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{txt.duration_days}</label>
                <input value={duration} onChange={e => setDuration(e.target.value)} type="number" min="1" max="30" className="w-24 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{txt.offered_amount}</label>
                <div className="relative">
                  <input value={offeredAmount} onChange={e => setOfferedAmount(e.target.value)} type="number" className="w-full px-3 py-2.5 pl-9 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" />
                  <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                </div>
                {worker.expected_salary && <p className="text-xs text-gray-400 mt-1">{txt.expects} {worker.expected_salary} QAR</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{txt.payment_method}</label>
                <div className="flex gap-2">
                  {['cash', 'online'].map(method => (
                    <button key={method} onClick={() => setPaymentMethod(method)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${paymentMethod === method ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      {method === 'cash' ? txt.cash : txt.online}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-800">{txt.review_confirm}</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">{txt.worker_label}</span><span className="font-medium">{worker.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">{txt.category_label}</span><span className="font-medium">{worker.category}</span></div>
                {distanceKm && <div className="flex justify-between text-sm"><span className="text-gray-500">{txt.distance_label}</span><span className="font-medium text-blue-600">{distanceKm} {txt.km}</span></div>}
                {etaMinutes && <div className="flex justify-between text-sm"><span className="text-gray-500">{txt.eta}</span><span className="font-medium text-green-600">{etaMinutes} {txt.min}</span></div>}
                <hr className="border-gray-200" />
                <div className="flex justify-between text-sm"><span className="text-gray-500">{txt.location_label}</span><span className="font-medium">{location}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">{txt.date_label}</span><span className="font-medium">{startDate || 'Today'} at {startTime || '08:00'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">{txt.duration_label}</span><span className="font-medium">{duration} {txt.day}</span></div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-base font-bold"><span className="text-gray-700">{txt.total}</span><span className="text-green-600">{offeredAmount} QAR</span></div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200">{txt.back}</button>}
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700">{txt.next}</button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {submitting ? txt.submitting : txt.confirm}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}