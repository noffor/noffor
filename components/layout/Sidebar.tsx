import Link from 'next/link';
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
};

export default function Sidebar({ country, lang }: { country: string; lang: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;

  return (
    <div className="bg-white rounded-xl border p-2 sticky top-20">
      <h3 className="px-3 py-2 text-sm font-bold text-gray-700 border-b mb-1">{t('categories')}</h3>
      {categories.map(cat => (
        <Link key={cat.slug} href={`${rest}/category/${cat.slug}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 no-underline transition-colors">
          <img src={cat.icon} alt={cat.name} className="w-5 h-5" />
          {categoryNames[cat.slug]?.[lang] || cat.name}
        </Link>
      ))}
    </div>
  );
}