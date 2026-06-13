// components/home/CategoryGrid.tsx
// 🚀 42 CATEGORIES • PNG IMAGES • MOBILE + PC
import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getText, LangCode } from '@/lib/language';

// ═══════════════════════════════════════════════════════════
// 42 Categories — 12 Main + 30 Other
// ═══════════════════════════════════════════════════════════
const MAIN_CATEGORIES = [
  { slug: 'driver', nameEn: 'Driver', nameBn: 'ড্রাইভার', nameAr: 'سائق', nameHi: 'ड्राइवर' },
  { slug: 'electrician', nameEn: 'Electrician', nameBn: 'ইলেকট্রিশিয়ান', nameAr: 'كهربائي', nameHi: 'इलेक्ट्रीशियन' },
  { slug: 'plumber', nameEn: 'Plumber', nameBn: 'প্লাম্বার', nameAr: 'سباك', nameHi: 'प्लंबर' },
  { slug: 'mason', nameEn: 'Mason', nameBn: 'রাজমিস্ত্রি', nameAr: 'بناء', nameHi: 'राजमिस्त्री' },
  { slug: 'ac-technician', nameEn: 'AC Technician', nameBn: 'এসি টেকনিশিয়ান', nameAr: 'فني تكييف', nameHi: 'एसी तकनीशियन' },
  { slug: 'painter', nameEn: 'Painter', nameBn: 'পেইন্টার', nameAr: 'دهان', nameHi: 'पेंटर' },
  { slug: 'carpenter', nameEn: 'Carpenter', nameBn: 'কার্পেন্টার', nameAr: 'نجار', nameHi: 'बढ़ई' },
  { slug: 'welder', nameEn: 'Welder', nameBn: 'ওয়েল্ডার', nameAr: 'لحام', nameHi: 'वेल्डर' },
  { slug: 'cleaner', nameEn: 'Cleaner', nameBn: 'ক্লিনার', nameAr: 'منظف', nameHi: 'क्लीनर' },
  { slug: 'cook', nameEn: 'Cook', nameBn: 'রাঁধুনি', nameAr: 'طباخ', nameHi: 'रसोइया' },
  { slug: 'helper', nameEn: 'Helper', nameBn: 'হেল্পার', nameAr: 'مساعد', nameHi: 'हेल्पर' },
  { slug: 'gardener', nameEn: 'Gardener', nameBn: 'মালী', nameAr: 'بستاني', nameHi: 'माली' },
];

const getCatName = (cat: any, lang: string): string => {
  switch (lang) {
    case 'bn': return cat.nameBn;
    case 'ar': return cat.nameAr;
    case 'hi': return cat.nameHi;
    default: return cat.nameEn;
  }
};

// ═══════════════════════════════════════════════════════════
// CategoryCard — ✅ PNG Image
// ═══════════════════════════════════════════════════════════
const CategoryCard = React.memo(({ cat, lang, country }: { 
  cat: { slug: string; nameEn: string; nameBn: string; nameAr: string; nameHi: string }; 
  lang: string; 
  country: string;
}) => {
  const [imgError, setImgError] = useState(false);
  const imgSrc = imgError ? '/categories/default.png' : `/categories/${cat.slug}.png`;
  
  return (
    <Link
      href={`/${country}/${lang}/category/${cat.slug}`}
      className="bg-white rounded-xl p-2 text-center border hover:shadow-md hover:border-orange-200 transition-all active:scale-95 group"
    >
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1.5">
        <img
          src={imgSrc}
          alt={getCatName(cat, lang)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
      <p className="text-[10px] lg:text-xs font-medium text-gray-700 group-hover:text-orange-600 truncate">
        {getCatName(cat, lang)}
      </p>
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';

// ═══════════════════════════════════════════════════════════
// CategoryGrid — 12 Main Categories
// ═══════════════════════════════════════════════════════════
export default function CategoryGrid({ country, lang }: { country: string; lang: string }) {
  const t = useCallback((key: string) => getText(lang as LangCode, key), [lang]);
  const categories = useMemo(() => MAIN_CATEGORIES, []);

  return (
    <div>
      <h2 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg mb-2 px-1 select-none">
        {t('categories') || 'Categories'}
      </h2>
      <div className="grid grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2 lg:gap-3">
        {categories.map(cat => (
          <CategoryCard key={cat.slug} cat={cat} lang={lang} country={country} />
        ))}
      </div>
    </div>
  );
}