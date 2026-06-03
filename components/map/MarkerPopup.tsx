// components/map/MarkerPopup.tsx
// 🚀 1 Billion Users | No Lag | No Crash | 4 Languages | SuperSonic
'use client';

import React, { useMemo, memo } from 'react';
import { Star, MessageCircle, Phone, User, MapPin, Award } from 'lucide-react';
import { getText, LangCode, translateName, translateCategory, translateNumber, getCurrencySymbol } from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// Static Translations (Memory Optimized)
// ═══════════════════════════════════════════════════════════
const T = {
  en: { viewProfile: 'View Profile', new: 'New', online: 'Online', offline: 'Offline', verified: 'Verified', contact: 'Contact', salary: 'Salary', experience: 'Experience', distance: 'Distance', eta: 'ETA' },
  bn: { viewProfile: 'প্রোফাইল দেখুন', new: 'নতুন', online: 'অনলাইন', offline: 'অফলাইন', verified: 'যাচাইকৃত', contact: 'যোগাযোগ', salary: 'বেতন', experience: 'অভিজ্ঞতা', distance: 'দূরত্ব', eta: 'সময়' },
  ar: { viewProfile: 'عرض الملف', new: 'جديد', online: 'متصل', offline: 'غير متصل', verified: 'موثق', contact: 'اتصال', salary: 'الراتب', experience: 'الخبرة', distance: 'المسافة', eta: 'الوقت' },
  hi: { viewProfile: 'प्रोफाइल देखें', new: 'नया', online: 'ऑनलाइन', offline: 'ऑफलाइन', verified: 'सत्यापित', contact: 'संपर्क', salary: 'वेतन', experience: 'अनुभव', distance: 'दूरी', eta: 'समय' },
} as const;

// Image URL Optimizer (WebP + Cache)
const getOptimizedImage = (url: string): string => {
  if (!url) return '/default-avatar.webp';
  if (url.includes('supabase.co')) return `${url}?width=60&height=60&quality=75&format=webp`;
  return url;
};

interface Props {
  labor: any;
  href: string;
  lang?: string;
}

// ═══════════════════════════════════════════════════════════
// MarkerPopup - Memoized for Performance
// ═══════════════════════════════════════════════════════════
const MarkerPopup = memo(({ labor, href, lang = 'en' }: Props) => {
  const tr = useMemo(() => T[lang as keyof typeof T] || T.en, [lang]);
  const t = useMemo(() => (key: string) => getText(lang as LangCode, key), [lang]);

  // Memoized Translations
  const displayName = useMemo(() => translateName(labor.name, lang), [labor.name, lang]);
  const displayCategory = useMemo(() => translateCategory(labor.category, lang), [labor.category, lang]);
  const displaySalary = useMemo(() => {
    const salary = labor.expected_salary || labor.salary || 0;
    return `${translateNumber(salary, lang)} ${getCurrencySymbol(lang)}`;
  }, [labor.expected_salary, labor.salary, lang]);
  
  const displayRating = useMemo(() => {
    const rating = labor.rating || 0;
    return rating > 0 ? translateNumber(rating.toFixed(1), lang) : tr.new;
  }, [labor.rating, lang, tr]);
  
  const displayDistance = useMemo(() => {
    const dist = labor.distance || 0;
    return dist ? `${translateNumber(dist.toFixed(1), lang)} ${t('kmAway')}` : '';
  }, [labor.distance, lang, t]);
  
  const displayEta = useMemo(() => {
    const eta = labor.eta || 0;
    return eta ? `${translateNumber(Math.round(eta), lang)} ${t('mins')}` : '';
  }, [labor.eta, lang, t]);

  const imageSrc = useMemo(() => getOptimizedImage(labor.photo_url), [labor.photo_url]);

  return (
    <div className="min-w-[200px] max-w-[260px]" style={{ transform: 'translateZ(0)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-shrink-0">
          <img
            src={imageSrc}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            loading="lazy"
            decoding="async"
            width={40}
            height={40}
            onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.webp'; }}
          />
          {labor.is_online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm truncate flex items-center gap-1">
            {displayName}
            {labor.is_verified && <Award size={12} className="text-blue-500 flex-shrink-0" />}
          </p>
          <p className="text-xs text-gray-500 truncate">{displayCategory}</p>
        </div>
      </div>

      {/* Rating + Location */}
      <div className="flex items-center gap-3 mb-2 text-xs">
        <div className="flex items-center gap-1">
          <Star size={12} className="text-yellow-500" fill="#EAB308" />
          <span className="font-medium">{displayRating}</span>
        </div>
        {labor.city && (
          <span className="text-gray-400 flex items-center gap-0.5 truncate">
            <MapPin size={10} />
            {labor.city}
          </span>
        )}
      </div>

      {/* Salary + Distance + ETA */}
      <div className="space-y-1 mb-2 text-xs">
        <p className="text-sm font-bold text-orange-600">💰 {displaySalary}</p>
        {displayDistance && <p className="text-gray-500 flex items-center gap-1">📍 {displayDistance}</p>}
        {displayEta && <p className="text-green-600 flex items-center gap-1">⏱️ {displayEta}</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1.5 mt-2">
        {labor.phone && (
          <>
            <a
              href={`https://wa.me/${labor.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              <MessageCircle size={12} /> WhatsApp
            </a>
            <a
              href={`tel:${labor.phone}`}
              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              <Phone size={12} /> Call
            </a>
          </>
        )}
        <a
          href={href}
          className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1 transition-all active:scale-95"
        >
          <User size={12} /> {tr.viewProfile}
        </a>
      </div>
    </div>
  );
});

MarkerPopup.displayName = 'MarkerPopup';
export default MarkerPopup;