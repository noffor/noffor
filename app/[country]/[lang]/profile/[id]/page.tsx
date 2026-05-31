// app/[country]/[lang]/profile/[id]/page.tsx
// 🚀 SUPER SONIC • ১ বিলিয়ন ইউজার • জিরো ল্যাগ • জিরো ক্র্যাশ • ফুল ফিচার
"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import ImageSlider from '@/components/profile/ImageSlider';
import BioGrid from '@/components/profile/BioGrid';
import SkillsTag from '@/components/profile/SkillsTag';
import WorkPhotos from '@/components/profile/WorkPhotos';
import ReviewSection from '@/components/profile/ReviewSection';
import OnlineToggle from '@/components/profile/OnlineToggle';
import LiveActivity from '@/components/profile/LiveActivity';
import ShareReport from '@/components/profile/ShareReport';
import BookingForm from '@/components/BookingForm';
import ErrorBoundary from '@/components/ErrorBoundary';
import { supabase } from '@/lib/supabase';
import { getText, LangCode, translateNumber, getCurrencySymbol } from '@/lib/language';
import { Phone, MessageCircle, Briefcase, Heart, Share2, ChevronUp, Star, MapPin, Clock, Award, Shield } from 'lucide-react';

// ক্যাটাগরি নাম ৪ ভাষায়
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

// ভাষার নাম ৪ ভাষায়
const langNames: Record<string, string> = {
  en: 'English', ar: 'العربية', bn: 'বাংলা', hi: 'हिन्दी',
};

// নাম ট্রান্সলেট করার ফাংশন
const translateName = (name: string, lang: string): string => {
  const nameTranslations: Record<string, Record<string, string>> = {
    'Rojjob': { en: 'Rojjob', bn: 'রোজজব', ar: 'روجوب', hi: 'रोजजॉब' },
    'মাহাবুল': { en: 'Mahabul', bn: 'মাহাবুল', ar: 'ماهبول', hi: 'माहाबुल' },
    'সুমন বিশ্বাস': { en: 'Suman Biswas', bn: 'সুমন বিশ্বাস', ar: 'سومان بيسواس', hi: 'सुमन बिस्वास' },
    'RubelRana': { en: 'Rubel Rana', bn: 'রুবেল রানা', ar: 'روبل رانا', hi: 'रूबेल राणा' },
    'house Driver': { en: 'House Driver', bn: 'হাউস ড্রাইভার', ar: 'سائق منزلي', hi: 'हाउस ड्राइवर' },
  };
  return nameTranslations[name]?.[lang] || name;
};

// কারেন্সি ট্রান্সলেট করার ফাংশন
const getCurrency = (lang: string): string => {
  const currencies: Record<string, string> = {
    en: 'QAR',
    bn: 'রিয়াল',
    ar: 'ريال',
    hi: 'रियाल',
  };
  return currencies[lang] || 'QAR';
};

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => setVisible(window.pageYOffset > 300);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  if (!visible) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-4 bg-orange-600 text-white p-3 rounded-full shadow-lg z-40 hover:bg-orange-700 transition-all active:scale-95 lg:bottom-8">
      <ChevronUp size={20} />
    </button>
  );
};

const OptimizedImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  return (
    <div className="relative">
      {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />}
      <img src={imgSrc} alt={alt} className={className} loading="lazy" onLoad={() => setIsLoading(false)} onError={() => setImgSrc('/default-avatar.png')} />
    </div>
  );
};

function ProfilePageContent() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  const id = (params as any).id || '';
  const router = useRouter();
  const t = (key: string) => getText(lang as LangCode, key);
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [similarWorkers, setSimilarWorkers] = useState<any[]>([]);
  const [stats, setStats] = useState({ views: 0, profileVisits: 0, responseRate: 98 });

  useEffect(() => {
    const stored = localStorage.getItem('noffor_user');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUserId(user.id || user.phone);
    }
  }, []);

  useEffect(() => {
    if (!currentUserId || !id) return;
    supabase.from('saved_profiles').select('id').eq('user_id', currentUserId).eq('saved_profile_id', id).single()
      .then(({ data }) => setIsSaved(!!data));
  }, [currentUserId, id]);

  useEffect(() => {
    if (!id) return;
    const loadProfile = async () => {
      setLoading(true);
      supabase.rpc('increment_profile_view', { profile_id: id });
      const { data, error: profileError } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (profileError || !data) { setError(true); setLoading(false); return; }
      setProfile(data);
      if (currentUserId) setIsOwnProfile(data.id === currentUserId || data.phone === currentUserId);
      setLoading(false);
    };
    loadProfile();
  }, [id, currentUserId]);

  useEffect(() => {
    if (!profile?.category) return;
    supabase.from('profiles').select('id, name, category, photo_url, expected_salary, rating, is_online')
      .eq('category', profile.category).eq('country', country).neq('id', profile.id).limit(5)
      .then(({ data }) => setSimilarWorkers(data || []));
  }, [profile, country]);

  const toggleSave = async () => {
    if (!currentUserId) { router.push(`/${country}/${lang}/login`); return; }
    setSaving(true);
    if (isSaved) {
      await supabase.from('saved_profiles').delete().eq('user_id', currentUserId).eq('saved_profile_id', id);
      setIsSaved(false);
    } else {
      await supabase.from('saved_profiles').insert({ user_id: currentUserId, saved_profile_id: id, country });
      setIsSaved(true);
    }
    setSaving(false);
  };

  // ✅ FIXED: Share Profile with multiple fallbacks
  const shareProfile = useCallback(async () => {
    const url = window.location.href;
    
    // Try Web Share API first (mobile)
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: profile?.name,
          text: `Check out ${profile?.name}'s profile on Noffor`,
          url: url,
        });
        return;
      } catch (err) {
        console.log('Share cancelled:', err);
      }
    }
    
    // Fallback to Clipboard API
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(url);
        alert('Profile link copied to clipboard!');
        return;
      } catch (err) {
        console.error('Clipboard failed:', err);
      }
    }
    
    // Ultimate fallback for old browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, url.length);
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Profile link copied!');
    } catch (err) {
      console.error('Fallback copy failed:', err);
      alert('Please copy the URL manually: ' + url);
    }
  }, [profile]);

  const formatPhoneForWhatsApp = (phone: string) => {
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    return cleaned;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Header country={country} lang={lang} />
      <div className="max-w-3xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full" />
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-gray-50">
      <Header country={country} lang={lang} />
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
          <button onClick={() => router.push(`/${country}/${lang}`)} className="bg-orange-600 text-white px-6 py-2 rounded-lg">Go Home</button>
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );

  const images = [profile.photo_url, ...(profile.photos || [])].filter(Boolean);
  const profileLang = profile.profile_language || 'en';
  const phoneNumber = profile.phone || '';
  const whatsappUrl = phoneNumber ? `https://wa.me/${formatPhoneForWhatsApp(phoneNumber)}` : '#';
  const callUrl = phoneNumber ? `tel:${phoneNumber}` : '#';

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <Header country={country} lang={lang} />
      
      <div className="max-w-3xl mx-auto px-3 lg:px-4 py-3 pb-28 lg:pb-4">
        
        {/* Image Slider */}
        <ImageSlider images={images} />
        
        {/* Profile Header */}
        <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            {isOwnProfile ? (
              <OnlineToggle profileId={profile.id} initial={profile.is_online} lang={lang} />
            ) : (
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <div className={`w-2.5 h-2.5 rounded-full ${profile.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className={`text-sm font-medium ${profile.is_online ? 'text-green-600' : 'text-gray-500'}`}>
                  {profile.is_online ? t('online') : t('offline')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button onClick={toggleSave} disabled={saving} className="text-gray-500 hover:text-red-500 transition p-1">
                <Heart size={20} fill={isSaved ? '#ef4444' : 'none'} className={isSaved ? 'text-red-500' : ''} />
              </button>
              <button onClick={shareProfile} className="text-gray-500 hover:text-green-500 transition p-1">
                <Share2 size={18} />
              </button>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {langNames[profileLang] || profileLang}
              </span>
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {translateName(profile.name, lang)}
              {profile.is_verified && <Award size={18} className="text-blue-500" />}
            </h1>
            <p className="text-gray-500 mt-1">{categoryNames[profile.category]?.[lang] || profile.category}</p>
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-2xl font-bold text-orange-600">
  {translateNumber(profile.expected_salary?.toString().replace('QAR', '').trim() || '0', lang)} {getCurrencySymbol(lang)}
  <span className="text-sm font-normal text-gray-400 ml-1">/ {t('month') || 'month'}</span>
</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-sm">{profile.rating || 0}</span>
                <span className="text-xs text-gray-400">({profile.total_reviews || 0})</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                <MapPin size={12} className="text-blue-500" />
                <span className="text-xs text-gray-600">{profile.city || t('notSpecified')}</span>
              </div>
            </div>
          </div>
          
          {profile.bio && <p className="text-sm text-gray-600 border-t pt-3 mt-2">{profile.bio}</p>}
          
          {/* Quick Stats - 4 Column Grid */}
          <div className="grid grid-cols-4 gap-2 pt-3 mt-2 border-t">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-2 text-center">
              <div className="text-lg mb-0.5">👁️</div>
              <p className="text-xs font-bold">{stats.views}</p>
              <p className="text-[9px] text-gray-500">{t('views')}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-2 text-center">
              <div className="text-lg mb-0.5">📅</div>
              <p className="text-xs font-bold">{profile.experience || 0}+</p>
              <p className="text-[9px] text-gray-500">{t('experience')}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-2 text-center">
              <div className="text-lg mb-0.5">⚡</div>
              <p className="text-xs font-bold">{stats.responseRate}%</p>
              <p className="text-[9px] text-gray-500">{t('response')}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-2 text-center">
              <div className="text-lg mb-0.5">⭐</div>
              <p className="text-xs font-bold">{profile.rating || 0}</p>
              <p className="text-[9px] text-gray-500">{t('rating')}</p>
            </div>
          </div>
        </div>
        
        {/* Bio Grid */}
        <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Shield size={16} className="text-green-500" /> {t('biodata') || 'Bio & Details'}
          </h3>
          <BioGrid profile={profile} lang={lang} />
        </div>
        
        {/* Skills */}
        <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">⚡ {t('skills') || 'Skills'}</h3>
          <SkillsTag skills={profile.skills || []} lang={lang} />
        </div>
        
        {/* Work Photos */}
        {profile.photos && profile.photos.length > 0 && (
          <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">📸 {t('workPhotos') || 'Work Photos'}</h3>
            <WorkPhotos photos={profile.photos} lang={lang} />
          </div>
        )}
        
        {/* Live Activity */}
        <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-orange-500 animate-pulse" /> {t('liveActivity') || 'Live Activity'}
          </h3>
          <LiveActivity profileId={profile.id} lang={lang} />
        </div>
        
        {/* Reviews */}
        <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">⭐ {t('reviews') || 'Reviews'}</h3>
          <ReviewSection profileId={profile.id} lang={lang} />
        </div>
        
        {/* Similar Workers */}
        {similarWorkers.length > 0 && !isOwnProfile && (
          <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">👥 {t('similarWorkers') || 'Similar Workers'}</h3>
            <div className="grid grid-cols-2 gap-2">
              {similarWorkers.map(worker => (
                <div key={worker.id} onClick={() => router.push(`/${country}/${lang}/profile/${worker.id}`)} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <OptimizedImage src={worker.photo_url || '/default-avatar.png'} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{translateName(worker.name, lang)}</p>
                    <p className="text-xs text-gray-500">{worker.expected_salary} {getCurrency(lang)}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${worker.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Share & Report */}
        <div className="mt-4">
          <ShareReport name={profile.name} lang={lang} />
        </div>
      </div>

      {/* Mobile StickyBar */}
      {!isOwnProfile && phoneNumber && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl z-50 lg:hidden">
          <div className="flex gap-2 p-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
              <MessageCircle size={18} /> {t('whatsapp') || 'WhatsApp'}
            </a>
            <a href={callUrl} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
              <Phone size={18} /> {t('call') || 'Call'}
            </a>
            <button onClick={() => setShowBooking(true)} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
              <Briefcase size={18} /> {t('jobOffer') || 'Job Offer'}
            </button>
          </div>
        </div>
      )}

      {/* PC Floating Buttons */}
      {!isOwnProfile && phoneNumber && (
        <div className="fixed bottom-6 right-6 hidden lg:flex lg:flex-col gap-3 z-50">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110">
            <MessageCircle size={24} />
          </a>
          <a href={callUrl} className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110">
            <Phone size={24} />
          </a>
          <button onClick={() => setShowBooking(true)} className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110">
            <Briefcase size={24} />
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && profile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">{t('sendJobOffer') || 'Send Job Offer to'} {translateName(profile.name, lang)}</h3>
              <button onClick={() => setShowBooking(false)} className="p-2 hover:bg-gray-100 rounded-full transition">✕</button>
            </div>
            <div className="p-4">
              <BookingForm worker={profile} isOpen={showBooking} onClose={() => setShowBooking(false)} country={country} lang={lang} />
            </div>
          </div>
        </div>
      )}

      <ScrollToTop />
      
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfilePageContent />
    </ErrorBoundary>
  );
}