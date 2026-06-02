// components/home/CategoryGrid.tsx
import React, { useMemo, useCallback } from 'react';
import { categories } from '@/lib/config';
import { getText, LangCode } from '@/lib/language';

const categoryNames: Record<string, Record<string, string>> = {
  driver: { en: 'Driver', ar: 'سائق', bn: 'ড্রাইভার', hi: 'ड्राइवर' },
  electrician: { en: 'Electrician', ar: 'كهربائي', bn: 'ইলেকট্রিশিয়ান', hi: 'इलेक्ट्रीशियन' },
  plumber: { en: 'Plumber', ar: 'سباك', bn: 'প্লাম্বার', hi: 'प्लंबर' },
  mason: { en: 'Mason', ar: 'بناء', bn: 'রাজমিস্ত্রি', hi: 'राजमिस्त्री' },
  'ac-technician': { en: 'AC Technician', ar: 'فني تكييف', bn: 'এসি টেকনিশিয়ান', hi: 'एसी तकनीशियन' },
  painter: { en: 'Painter', ar: 'دهان', bn: 'পেইন্টার', hi: 'पेंटर' },
  carpenter: { en: 'Carpenter', ar: 'نجار', bn: 'কার্পেন্টার', hi: 'बढ़ई' },
  welder: { en: 'Welder', ar: 'لحام', bn: 'ওয়েল্ডার', hi: 'वेल्डर' },
  cleaner: { en: 'Cleaner', ar: 'منظف', bn: 'ক্লিনার', hi: 'क्लीनर' },
  cook: { en: 'Cook', ar: 'طباخ', bn: 'রাঁধুনি', hi: 'रसोइया' },
  helper: { en: 'Helper', ar: 'مساعد', bn: 'হেল্পার', hi: 'हेल्पर' },
  gardener: { en: 'Gardener', ar: 'بستاني', bn: 'মালী', hi: 'माली' },
} as const;

const optimizeIconUrl = (url: string, size: number = 80): string => {
  if (!url) return '';
  if (url.includes('supabase.co/storage')) return `${url}?width=${size}&quality=80&format=webp`;
  if (url.includes('cloudinary.com')) return url.replace('/upload/', `/upload/w_${size},q_80,f_webp/`);
  return url;
};

const CategoryCard = React.memo(({ cat, lang, rest }: { 
  cat: { slug: string; name: string; icon: string }; 
  lang: string; 
  rest: string;
}) => {
  const displayName = categoryNames[cat.slug]?.[lang] || cat.name;
  const optimizedIcon = useMemo(() => optimizeIconUrl(cat.icon, 100), [cat.icon]);

  return (
    <a 
      href={`${rest}/category/${cat.slug}`} 
      className="category-card"
    >
      {/* 🔥 বক্স ছোট — ছবি বড় */}
      <div className="category-icon-box">
        <img 
          src={optimizedIcon || '/icons/default.webp'} 
          alt={displayName} 
          className="category-icon"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icons/default.webp';
          }}
        />
      </div>
      <span className="category-title">{displayName}</span>
    </a>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default function CategoryGrid({ country, lang }: { country: string; lang: string }) {
  const t = useCallback((key: string) => getText(lang as LangCode, key), [lang]);
  const rest = useMemo(() => `/${country}/${lang}`, [country, lang]);
  const memoizedCategories = useMemo(() => categories, []);

  return (
    <div>
      <h2 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg mb-2 px-1 select-none">
        {t('categories')}
      </h2>
      <div className="grid grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2 lg:gap-3">
        {memoizedCategories.map(cat => (
          <CategoryCard key={cat.slug} cat={cat} lang={lang} rest={rest} />
        ))}
      </div>
    </div>
  );
}