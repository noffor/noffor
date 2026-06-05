// components/booking/BookingRequestPopup.tsx
// 🚀 UBER-STYLE • WORKER ACCEPT/REJECT POPUP • REAL-TIME
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  X, MapPin, Clock, DollarSign, Navigation, 
  CheckCircle, XCircle, Loader2, Phone, Star 
} from 'lucide-react';

// ═══════════════════ TRANSLATIONS ═══════════════════
const T: Record<string, Record<string, string>> = {
  en: {
    newRequest: '🔔 New Job Request!',
    from: 'From',
    distance: 'Distance',
    eta: 'ETA',
    min: 'min',
    km: 'km',
    accept: 'Accept',
    reject: 'Reject',
    accepting: 'Accepting...',
    requestAccepted: '✅ Request Accepted!',
    requestRejected: '❌ Request Rejected',
    jobDetails: 'Job Details',
    location: 'Location',
    price: 'Price',
    expiresIn: 'Expires in',
    seconds: 'sec',
    expired: '⏰ Request Expired',
    callEmployer: 'Call Employer',
  },
  bn: {
    newRequest: '🔔 নতুন কাজের অনুরোধ!',
    from: 'থেকে',
    distance: 'দূরত্ব',
    eta: 'আনুমানিক সময়',
    min: 'মিনিট',
    km: 'কিমি',
    accept: 'গ্রহণ করুন',
    reject: 'বাতিল করুন',
    accepting: 'গ্রহণ করা হচ্ছে...',
    requestAccepted: '✅ অনুরোধ গৃহীত!',
    requestRejected: '❌ অনুরোধ বাতিল',
    jobDetails: 'কাজের বিবরণ',
    location: 'অবস্থান',
    price: 'মূল্য',
    expiresIn: 'সময় শেষ হবে',
    seconds: 'সেকেন্ড',
    expired: '⏰ অনুরোধের সময় শেষ',
    callEmployer: 'নিয়োগকর্তাকে কল করুন',
  },
  ar: {
    newRequest: '🔔 طلب عمل جديد!',
    from: 'من',
    distance: 'المسافة',
    eta: 'الوقت المقدر',
    min: 'دقيقة',
    km: 'كم',
    accept: 'قبول',
    reject: 'رفض',
    accepting: 'جاري القبول...',
    requestAccepted: '✅ تم قبول الطلب!',
    requestRejected: '❌ تم رفض الطلب',
    jobDetails: 'تفاصيل العمل',
    location: 'الموقع',
    price: 'السعر',
    expiresIn: 'ينتهي في',
    seconds: 'ثانية',
    expired: '⏰ انتهت صلاحية الطلب',
    callEmployer: 'اتصل بصاحب العمل',
  },
  hi: {
    newRequest: '🔔 नया कार्य अनुरोध!',
    from: 'से',
    distance: 'दूरी',
    eta: 'अनुमानित समय',
    min: 'मिनट',
    km: 'किमी',
    accept: 'स्वीकार करें',
    reject: 'अस्वीकार करें',
    accepting: 'स्वीकार किया जा रहा है...',
    requestAccepted: '✅ अनुरोध स्वीकृत!',
    requestRejected: '❌ अनुरोध अस्वीकृत',
    jobDetails: 'कार्य विवरण',
    location: 'स्थान',
    price: 'कीमत',
    expiresIn: 'समाप्त होने में',
    seconds: 'सेकंड',
    expired: '⏰ अनुरोध समाप्त',
    callEmployer: 'नियोक्ता को कॉल करें',
  },
};

// ═══════════════════ HELPERS ═══════════════════
const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const calcETA = (dist: number): number => Math.ceil((dist / 30) * 60);

// ═══════════════════ TYPES ═══════════════════
interface BookingRequest {
  id: string;
  job_title: string;
  job_description?: string;
  category: string;
  offered_amount: number;
  total_amount: number;
  employer_name: string;
  employer_phone?: string;
  contact_phone?: string;
  location_text?: string;
  location_lat?: number;
  location_lng?: number;
  distance_km?: number;
  eta_minutes?: number;
  created_at: string;
  status: string;
}

interface Props {
  booking: BookingRequest;
  workerId: string;
  workerLat: number;
  workerLng: number;
  lang: string;
  onAccept: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  onClose: () => void;
}

// ═══════════════════ MAIN COMPONENT ═══════════════════
export default function BookingRequestPopup({
  booking,
  workerId,
  workerLat,
  workerLng,
  lang,
  onAccept,
  onReject,
  onClose,
}: Props) {
  const tr = useMemo(() => T[lang] || T.en, [lang]);
  const [accepting, setAccepting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to respond
  const [expired, setExpired] = useState(false);
  const [result, setResult] = useState<'accepted' | 'rejected' | null>(null);

  // Calculate real distance
  const distance = useMemo(() => {
    if (booking.location_lat && booking.location_lng) {
      return calcDistance(workerLat, workerLng, booking.location_lat, booking.location_lng);
    }
    return booking.distance_km || 0;
  }, [booking, workerLat, workerLng]);

  const eta = useMemo(() => calcETA(distance), [distance]);

  // Countdown timer (Uber-style 30 second window)
  useEffect(() => {
    if (result) return;
    if (timeLeft <= 0) {
      setExpired(true);
      setTimeout(() => {
        onReject(booking.id);
        onClose();
      }, 2000);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result, booking.id, onReject, onClose]);

  // Handle Accept
  const handleAccept = useCallback(async () => {
    if (accepting || result) return;
    setAccepting(true);

    try {
      // Update booking status
      await supabase
        .from('bookings')
        .update({ 
          status: 'accepted', 
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      // Notify employer
      await supabase.from('notifications').insert({
        user_id: booking.contact_phone || 'employer',
        title: '✅ Worker Accepted!',
        message: `Worker accepted your request • ${distance}km • ~${eta}min`,
        type: 'booking_accepted',
        is_read: false,
        created_at: new Date().toISOString(),
        metadata: { booking_id: booking.id },
      });

      setResult('accepted');
      onAccept(booking.id);

      // Auto close after 2 seconds
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error('Accept error:', err);
      setAccepting(false);
    }
  }, [accepting, result, booking, distance, eta, onAccept, onClose]);

  // Handle Reject
  const handleReject = useCallback(async () => {
    if (accepting || result) return;
    
    try {
      await supabase
        .from('bookings')
        .update({ 
          status: 'rejected', 
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Worker rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      setResult('rejected');
      onReject(booking.id);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error('Reject error:', err);
    }
  }, [accepting, result, booking, onReject, onClose]);

  // Progress bar percentage
  const progressPercent = (timeLeft / 30) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}>
        
        {/* ═══ HEADER ═══ */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
          {result ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-2">
                {result === 'accepted' ? (
                  <CheckCircle size={36} className="text-green-300" />
                ) : (
                  <XCircle size={36} className="text-red-300" />
                )}
              </div>
              <p className="text-white font-bold text-lg">
                {result === 'accepted' ? tr.requestAccepted : tr.requestRejected}
              </p>
            </div>
          ) : expired ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-2">
                <Clock size={36} className="text-yellow-300" />
              </div>
              <p className="text-white font-bold text-lg">{tr.expired}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">{tr.newRequest}</h2>
                <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20">
                  <X size={18} />
                </button>
              </div>
              
              {/* Countdown Progress Bar */}
              <div className="mt-3 bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? 'bg-red-400' : 'bg-green-400'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className={`text-[10px] mt-1 ${isUrgent ? 'text-red-200' : 'text-white/70'}`}>
                {tr.expiresIn}: {timeLeft}{tr.seconds}
              </p>
            </>
          )}
        </div>

        {/* ═══ BODY ═══ */}
        {!result && !expired && (
          <div className="p-5 space-y-4">
            {/* Employer Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {booking.employer_name?.[0] || 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{booking.employer_name || 'Employer'}</p>
                <p className="text-xs text-gray-500">{booking.job_title || 'Quick Hire'}</p>
                {booking.contact_phone && (
                  <a href={`tel:${booking.contact_phone}`}
                    className="text-blue-600 text-xs flex items-center gap-1 mt-0.5 no-underline">
                    <Phone size={10} /> {tr.callEmployer}
                  </a>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 text-lg">{booking.offered_amount || booking.total_amount} QAR</p>
                <p className="text-[10px] text-gray-400">{tr.price}</p>
              </div>
            </div>

            {/* Job Details Card */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <MapPin size={14} className="text-blue-500" /> {tr.distance}
                </span>
                <span className="font-bold text-blue-700">{distance} {tr.km}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock size={14} className="text-green-500" /> {tr.eta}
                </span>
                <span className="font-bold text-green-700">~{eta} {tr.min}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <Navigation size={14} className="text-purple-500" /> {tr.location}
                </span>
                <span className="text-xs text-gray-600 truncate max-w-[180px]">
                  {booking.location_text || 'Location'}
                </span>
              </div>
              {booking.job_description && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{tr.jobDetails}</p>
                  <p className="text-xs text-gray-600">{booking.job_description}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReject}
                disabled={accepting}
                className="flex-1 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ touchAction: 'manipulation', minHeight: '52px' }}>
                <XCircle size={20} /> {tr.reject}
              </button>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="flex-[2] py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                style={{ touchAction: 'manipulation', minHeight: '52px' }}>
                {accepting ? (
                  <><Loader2 size={20} className="animate-spin" /> {tr.accepting}</>
                ) : (
                  <><CheckCircle size={20} /> {tr.accept}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result State */}
        {result && (
          <div className="p-5 text-center">
            <p className="text-gray-500 text-sm">
              {result === 'accepted' 
                ? 'The employer has been notified. You are on your way!'
                : 'Request has been rejected.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}