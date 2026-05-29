import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import ImageSlider from '@/components/profile/ImageSlider';
import BioGrid from '@/components/profile/BioGrid';
import SkillsTag from '@/components/profile/SkillsTag';
import WorkPhotos from '@/components/profile/WorkPhotos';
import ReviewSection from '@/components/profile/ReviewSection';
import OnlineToggle from '@/components/profile/OnlineToggle';
import StickyBar from '@/components/profile/StickyBar';
import LiveActivity from '@/components/profile/LiveActivity';
import ShareReport from '@/components/profile/ShareReport';
import { supabase } from '@/lib/supabase';
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

const langNames: Record<string, string> = {
  en: 'English', ar: 'العربية', bn: 'বাংলা', hi: 'हिन्दी',
};

export default async function ProfilePage({ params }: {
  params: Promise<{ country: string; lang: string; id: string }>;
}) {
  const { country, lang, id } = await params;
  const t = (key: string) => getText(lang as LangCode, key);
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header country={country} lang={lang} />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center"><h1 className="text-2xl font-bold">Profile Not Found</h1></div>
      </div>
    );
  }

  const images = [profile.photo_url, ...(profile.photos || [])].filter(Boolean);
  const profileLang = profile.profile_language || 'en';

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-3xl mx-auto px-3 lg:px-4 py-3">
        <ImageSlider images={images} />
        <div className="mt-4 bg-white rounded-xl p-4 border space-y-4">
          <div className="flex items-center justify-between">
            <OnlineToggle profileId={profile.id} initial={profile.is_online} lang={lang} />
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {langNames[profileLang] || profileLang}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">{profile.name}</h1>
          <p className="text-gray-600">{categoryNames[profile.category]?.[lang] || profile.category}</p>
          <p className="text-2xl font-bold text-orange-600">{profile.expected_salary}</p>
        </div>
        <div className="mt-4 bg-white rounded-xl p-4 border">
          <h3 className="font-bold text-gray-800 mb-3">{t('biodata')}</h3>
          <BioGrid profile={profile} lang={lang} />
        </div>
        <div className="mt-4 bg-white rounded-xl p-4 border">
          <h3 className="font-bold text-gray-800 mb-3">{t('skills')}</h3>
          <SkillsTag skills={profile.skills || []} lang={lang} />
        </div>
        {profile.photos?.length > 0 && (
          <div className="mt-4 bg-white rounded-xl p-4 border">
            <h3 className="font-bold text-gray-800 mb-3">{t('workPhotos')}</h3>
            <WorkPhotos photos={profile.photos} lang={lang} />
          </div>
        )}
        <div className="mt-4 bg-white rounded-xl p-4 border">
          <h3 className="font-bold text-gray-800 mb-3">{t('liveActivity')}</h3>
          <LiveActivity profileId={profile.id} lang={lang} />
        </div>
        <div className="mt-4 bg-white rounded-xl p-4 border">
          <h3 className="font-bold text-gray-800 mb-3">{t('reviews')}</h3>
          <ReviewSection profileId={profile.id} lang={lang} />
        </div>
        <div className="mt-4">
          <ShareReport name={profile.name} lang={lang} />
        </div>
      </div>
      <StickyBar phone={profile.phone} lang={lang} />
      
    </div>
  );
}