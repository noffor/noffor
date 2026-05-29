import { categories } from '@/lib/config';
import { getText, LangCode } from '@/lib/language';

// ক্যাটাগরির মাল্টি-ল্যাং নাম
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

export default function CategoryGrid({ country, lang }: { country: string; lang: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;

  return (
    <div>
      <h2 className="font-bold text-gray-800 text-sm lg:text-lg mb-2 px-1">{t('categories')}</h2>
      <div className="grid grid-cols-4 gap-2">
        {categories.map(cat => (
          <a key={cat.slug} href={`${rest}/category/${cat.slug}`} className="bg-gray-50 hover:bg-orange-50 rounded-xl p-2 text-center no-underline border border-transparent hover:border-orange-200 transition-all active:scale-95">
            <img src={cat.icon} alt={cat.name} className="w-10 h-10 mx-auto mb-1" loading="lazy" />
            <p className="text-[10px] font-medium text-gray-700 truncate">
              {categoryNames[cat.slug]?.[lang] || cat.name}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}