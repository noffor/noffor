import { getText, LangCode } from '@/lib/language';

const categoryNames: Record<string, Record<string, string>> = {
  Driver: { en: 'Driver', ar: 'سائق', bn: 'ড্রাইভার', hi: 'ड्राइवर' },
  Electrician: { en: 'Electrician', ar: 'كهربائي', bn: 'ইলেকট্রিশিয়ান', hi: 'इलेक्ट्रीशियन' },
  Plumber: { en: 'Plumber', ar: 'سباك', bn: 'প্লাম্বার', hi: 'प्लंबर' },
  Mason: { en: 'Mason', ar: 'بناء', bn: 'রাজমিস্ত্রি', hi: 'राजमिस्त्री' },
  'AC Technician': { en: 'AC Technician', ar: 'فني تكييف', bn: 'এসি টেকনিশিয়ান', hi: 'एसी तकनीशियन' },
  Painter: { en: 'Painter', ar: 'دهان', bn: 'পেইন্টার', hi: 'पेंटर' },
};

export default function SearchSuggestions({ country, lang }: { country: string; lang: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  const suggestions = ['Driver', 'Electrician', 'Plumber', 'Mason', 'AC Technician', 'Painter'];

  return (
    <div className="mt-4">
      <p className="text-xs text-gray-500 mb-2">{t('popularSearches') || 'Popular Searches'}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(s => (
          <a key={s} href={`/${country}/${lang}/search?q=${encodeURIComponent(s)}`} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs no-underline hover:bg-orange-50 hover:text-orange-600 transition-colors">
            {categoryNames[s]?.[lang] || s}
          </a>
        ))}
      </div>
    </div>
  );
}