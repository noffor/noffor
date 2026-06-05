// components/map/MarkerPopup.tsx
// 🚀 PRODUCTION READY • WhatsApp + View Profile Added
'use client';

import React, { memo, useMemo } from 'react';
import { Star, Clock, MapPin, Briefcase, User, ExternalLink, MessageCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════
interface Worker {
  worker_id: string;
  latitude: number;
  longitude: number;
  is_online: boolean;
  last_seen: string;
  expected_salary?: number;
  phone?: string;
  profiles?: {
    name: string;
    photo_url: string;
    category: string;
    rating: number;
    country: string;
  };
  distance?: number;
  eta?: number;
}

interface Props {
  labor: Worker;
  href: string;
  lang: string;
  onHire?: () => void;
}

// ═══════════════════════════════════════════════════
// Translations
// ═══════════════════════════════════════════════════
const T: Record<string, Record<string, string>> = {
  en: { 
    hire: 'Hire', km: 'km', min: 'min', unknown: 'Unknown Worker',
    viewProfile: 'View Profile', whatsapp: 'WhatsApp', call: 'Call',
  },
  bn: { 
    hire: 'নিয়োগ', km: 'কিমি', min: 'মিনিট', unknown: 'অজানা শ্রমিক',
    viewProfile: 'প্রোফাইল দেখুন', whatsapp: 'হোয়াটসঅ্যাপ', call: 'কল',
  },
  ar: { 
    hire: 'توظيف', km: 'كم', min: 'دقيقة', unknown: 'عامل غير معروف',
    viewProfile: 'عرض الملف', whatsapp: 'واتساب', call: 'اتصال',
  },
  hi: { 
    hire: 'किराए पर लें', km: 'किमी', min: 'मिनट', unknown: 'अज्ञात श्रमिक',
    viewProfile: 'प्रोफाइल देखें', whatsapp: 'व्हाट्सएप', call: 'कॉल',
  },
};

// ═══════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════
const localizeNum = (num: number, lang: string): string => {
  const digits: Record<string, string[]> = {
    bn: ['০','১','২','৩','৪','৫','৬','৭','৮','৯'],
    ar: ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'],
    hi: ['०','१','२','३','४','५','६','७','८','९'],
  };
  const map = digits[lang];
  if (!map) return num.toString();
  return num.toString().replace(/\d/g, d => map[parseInt(d)]);
};

const getCurrency = (lang: string): string => {
  const map: Record<string, string> = { en: 'QAR', bn: 'রিয়াল', ar: 'ريال', hi: 'रियाल' };
  return map[lang] || 'QAR';
};

// ═══════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════
export default memo(function MarkerPopup({ labor, href, lang, onHire }: Props) {
  const tr = useMemo(() => T[lang] || T.en, [lang]);
  const profile = labor?.profiles;
  const isOnline = labor?.is_online ?? false;
  
  // ✅ WhatsApp link
  const whatsappUrl = useMemo(() => {
    const phone = labor?.phone || '';
    const message = profile?.name 
      ? `Hi ${profile.name}, I found you on Noffor. Are you available?`
      : 'Hi, I found you on Noffor. Are you available?';
    return `https://wa.me/${phone.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`;
  }, [labor?.phone, profile?.name]);

  return (
    <div className="space-y-3" style={{ contain: 'layout style paint' }}>
      {/* Worker Info Row */}
      <div className="flex items-center gap-3 px-1">
        {/* Avatar */}
        <div className="relative shrink-0">
          {profile?.photo_url ? (
            <img 
              src={profile.photo_url} 
              alt={profile?.name || tr.unknown} 
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              loading="lazy"
              decoding="async"
              width={48}
              height={48}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {profile?.name?.[0] || <User size={18} />}
            </div>
          )}
          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">
            {profile?.name || tr.unknown}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            {profile?.category && (
              <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">
                <Briefcase size={10} />
                <span className="truncate max-w-[80px]">{profile.category}</span>
              </span>
            )}
            {profile?.rating != null && profile.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                <Star size={10} fill="#f59e0b" />
                {localizeNum(profile.rating, lang)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1 flex-wrap">
            {labor?.distance !== undefined && (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <MapPin size={10} className="text-blue-500" />
                {localizeNum(labor.distance, lang)} {tr.km}
              </span>
            )}
            {labor?.eta !== undefined && (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <Clock size={10} className="text-green-500" />
                {localizeNum(labor.eta, lang)} {tr.min}
              </span>
            )}
            {labor?.expected_salary != null && labor.expected_salary > 0 && (
              <span className="flex items-center gap-1 text-orange-600 whitespace-nowrap font-medium">
                💰 {localizeNum(labor.expected_salary, lang)} {getCurrency(lang)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Action Buttons - WhatsApp + View Profile + Hire */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        {/* View Profile */}
        <a 
          href={href}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-all active:scale-95 no-underline"
          style={{ touchAction: 'manipulation' }}
        >
          <ExternalLink size={13} />
          {tr.viewProfile}
        </a>

        {/* WhatsApp */}
        {labor?.phone && (
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-all active:scale-95 no-underline"
            style={{ touchAction: 'manipulation' }}
          >
            <MessageCircle size={13} />
            {tr.whatsapp}
          </a>
        )}

        {/* Hire Now */}
        {onHire && (
          <button 
            onClick={onHire}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 shadow-sm"
            style={{ touchAction: 'manipulation' }}
          >
            {tr.hire}
          </button>
        )}
      </div>
    </div>
  );
});