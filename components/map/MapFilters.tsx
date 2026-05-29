"use client";
import { useRouter } from 'next/navigation';
import { getText, LangCode } from '@/lib/language';

const categoryNames: Record<string, Record<string, string>> = {
  Driver: { en: 'Driver', ar: 'سائق', bn: 'ড্রাইভার', hi: 'ड्राइवर' },
  Electrician: { en: 'Electrician', ar: 'كهربائي', bn: 'ইলেকট্রিশিয়ান', hi: 'इलेक्ट्रीशियन' },
  Plumber: { en: 'Plumber', ar: 'سباك', bn: 'প্লাম্বার', hi: 'प्लंबर' },
  Mason: { en: 'Mason', ar: 'بناء', bn: 'রাজমিস্ত্রি', hi: 'राजमिस्त्री' },
};

export default function MapFilters({ country, lang, category, distance }: { country: string; lang: string; category: string; distance: string }) {
  const router = useRouter();
  const t = (key: string) => getText(lang as LangCode, key);

  return (
    <div className="flex gap-2 mb-3 overflow-x-auto">
      <select value={category} onChange={e => router.push(`/${country}/${lang}/map?cat=${e.target.value}&dist=${distance}`)} className="px-2 py-1.5 bg-white border rounded-lg text-xs">
        <option value="all">{t('categories') || 'All Categories'}</option>
        {Object.entries(categoryNames).map(([key, val]) => (
          <option key={key} value={key}>{val[lang] || val.en}</option>
        ))}
      </select>
      <select value={distance} onChange={e => router.push(`/${country}/${lang}/map?cat=${category}&dist=${e.target.value}`)} className="px-2 py-1.5 bg-white border rounded-lg text-xs">
        <option value="all">{t('allDistance') || 'All Distance'}</option>
        <option value="5">5 km</option>
        <option value="10">10 km</option>
        <option value="20">20 km</option>
      </select>
    </div>
  );
}