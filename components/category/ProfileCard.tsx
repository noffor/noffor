import { Star } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

const categoryNames: Record<string, Record<string, string>> = {
  Driver: { en: 'Driver', ar: 'سائق', bn: 'ড্রাইভার', hi: 'ड्राइवर' },
  Electrician: { en: 'Electrician', ar: 'كهربائي', bn: 'ইলেকট্রিশিয়ান', hi: 'इलेक्ट्रीशियन' },
  Plumber: { en: 'Plumber', ar: 'سباك', bn: 'প্লাম্বার', hi: 'प्लंबर' },
  Mason: { en: 'Mason', ar: 'بناء', bn: 'রাজমিস্ত্রি', hi: 'राजमिस्त्री' },
  'AC Technician': { en: 'AC Technician', ar: 'فني تكييف', bn: 'এসি টেকনিশিয়ান', hi: 'एसी तकनीशियन' },
  Painter: { en: 'Painter', ar: 'دهان', bn: 'পেইন্টার', hi: 'पेंटर' },
  Carpenter: { en: 'Carpenter', ar: 'نجار', bn: 'কার্পেন্টার', hi: 'बढ़ई' },
  Welder: { en: 'Welder', ar: 'لحام', bn: 'ওয়েল্ডার', hi: 'वेल्डर' },
  Cleaner: { en: 'Cleaner', ar: 'منظف', bn: 'ক্লিনার', hi: 'क्लीनर' },
  Cook: { en: 'Cook', ar: 'طباخ', bn: 'রাঁধুনি', hi: 'रसोइया' },
  Helper: { en: 'Helper', ar: 'مساعد', bn: 'হেল্পার', hi: 'हेल्पर' },
  Gardener: { en: 'Gardener', ar: 'بستاني', bn: 'মালী', hi: 'माली' },
};

export default function ProfileCard({ profile, href, lang = 'en' }: { profile: any; href: string; lang?: string }) {
  const t = (key: string) => getText(lang as LangCode, key);

  return (
    <a href={href} className="bg-white rounded-xl border overflow-hidden no-underline hover:shadow-lg transition-all active:scale-[0.98] block">
      <div className="relative">
        <img src={profile.photo_url || '/default-avatar.png'} alt={profile.name} className="w-full h-40 object-cover" loading="lazy" />
        {profile.is_online && <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">{t('online')}</span>}
        {profile.is_featured && <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">{t('featured')}</span>}
      </div>
      <div className="p-3">
        <h4 className="font-medium text-gray-800 text-sm truncate">{profile.name}</h4>
        <p className="text-xs text-gray-500">{categoryNames[profile.category]?.[lang] || profile.category}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star size={14} className="text-yellow-500" fill="#EAB308" />
          <span className="text-xs font-medium">{profile.rating}</span>
        </div>
        <p className="text-sm font-bold text-orange-600 mt-1">{profile.expected_salary || 'Negotiable'}</p>
      </div>
    </a>
  );
}