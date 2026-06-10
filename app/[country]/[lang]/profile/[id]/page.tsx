// app/[country]/[lang]/profile/[id]/page.tsx
// 🚀 SUPER SONIC • 406 Error Fixed • Multi-language Name • Production Ready
"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo, startTransition } from 'react';
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
import StickyBar from '@/components/profile/StickyBar';
import { supabase } from '@/lib/supabase';
import { getText, LangCode, translateNumber, getCurrencySymbol, translateName, translateCategory } from '@/lib/language';
import { Phone, MessageCircle, Briefcase, Heart, Share2, ChevronUp, Star, MapPin, Clock, Award, Shield, Loader2, AlertCircle, X, Users, Eye } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// UUID Validator
// ═══════════════════════════════════════════════════════════
function isValidUUID(str: string): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// ═══════════════════════════════════════════════════════════
// ScrollToTop (Memoized)
// ═══════════════════════════════════════════════════════════
const ScrollToTop = React.memo(() => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggle, { passive: true });
    return () => window.removeEventListener('scroll', toggle);
  }, []);
  
  if (!visible) return null;
  
  return (
    <button 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
      className="fixed bottom-24 right-4 bg-orange-600 text-white p-3 rounded-full shadow-lg z-40 hover:bg-orange-700 transition-all active:scale-95 lg:bottom-8"
      aria-label="Scroll to top"
    >
      <ChevronUp size={20} />
    </button>
  );
});
ScrollToTop.displayName = 'ScrollToTop';

// ═══════════════════════════════════════════════════════════
// OptimizedImage (Memoized + WebP ready)
// ═══════════════════════════════════════════════════════════
const OptimizedImage = React.memo(({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    setImgSrc(src);
    setLoaded(false);
    setError(false);
  }, [src]);
  
  return (
    <div className="relative overflow-hidden">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
      )}
      <img 
        src={error ? '/default-avatar.png' : imgSrc} 
        alt={alt} 
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading="lazy" 
        decoding="async" 
        onLoad={() => setLoaded(true)} 
        onError={() => { setError(true); setLoaded(true); }} 
      />
    </div>
  );
});
OptimizedImage.displayName = 'OptimizedImage';

// ═══════════════════════════════════════════════════════════
// Stats Card (Memoized)
// ═══════════════════════════════════════════════════════════
const StatsCard = React.memo(({ icon, value, label, gradient }: { 
  icon: string; 
  value: string | number; 
  label: string; 
  gradient: string 
}) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-xl p-3 text-center`}>
    <div className="text-xl mb-1">{icon}</div>
    <p className="text-sm font-bold">{value}</p>
    <p className="text-[10px] text-gray-500">{label}</p>
  </div>
));
StatsCard.displayName = 'StatsCard';

// ═══════════════════════════════════════════════════════════
// Similar Worker Card (Memoized) - ✅ Uses translateName with profile
// ═══════════════════════════════════════════════════════════
const SimilarWorkerCard = React.memo(({ worker, lang, country, router }: { 
  worker: any; 
  lang: string; 
  country: string; 
  router: any 
}) => {
  const currency = getCurrencySymbol(lang);
  
  return (
    <div 
      onClick={() => router.push(`/${country}/${lang}/profile/${worker.id}`)} 
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all active:scale-[0.98] border border-gray-100"
    >
      <OptimizedImage 
        src={worker.photo_url || '/default-avatar.png'} 
        alt={translateName(worker.name, lang, worker)} 
        className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm" 
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {translateName(worker.name, lang, worker)} {/* ✅ Profile object pass করা হয়েছে */}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {translateCategory(worker.category, lang)}
        </p>
        <p className="text-xs font-medium text-orange-600">
          {translateNumber(worker.expected_salary?.replace(/[^0-9]/g, '') || '0', lang)} {currency}
        </p>
      </div>
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white ${worker.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
    </div>
  );
});
SimilarWorkerCard.displayName = 'SimilarWorkerCard';

// ═══════════════════════════════════════════════════════════
// 🌍 দেশের কোড ম্যাপ
// ═══════════════════════════════════════════════════════════
const countryCodes: Record<string, string> = {
  qa: '974', bd: '880', sa: '966', ae: '971',
  kw: '965', om: '968', bh: '973', in: '91',
  np: '977', pk: '92', lk: '94', eg: '20',
  jo: '962', lb: '961', sy: '963', iq: '964',
  ye: '967', ps: '970', my: '60', id: '62',
  us: '1', gb: '44', tr: '90', ph: '63',
  th: '66', vn: '84', cn: '86', jp: '81', kr: '82',
};

// ═══════════════════════════════════════════════════════════
// ProfilePageContent (Main)
// ═══════════════════════════════════════════════════════════
function ProfilePageContent() {
  const params = useParams();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  const id = (params as any).id || '';
  const router = useRouter();
  const t = useCallback((key: string) => getText(lang as LangCode, key), [lang]);
  
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
  
  const aliveRef = useRef(true);

  // ✅ Validate profile ID
  const validId = useMemo(() => isValidUUID(id), [id]);

  // ✅ Load current user
  useEffect(() => {
    aliveRef.current = true;
    try {
      const stored = localStorage.getItem('noffor_user');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUserId(user.id || user.phone);
      }
    } catch {}
    return () => { aliveRef.current = false };
  }, []);

  // ✅ Check saved status - only if valid UUID
  useEffect(() => {
    if (!currentUserId || !id || !validId) return;
    if (!isValidUUID(currentUserId)) return;
    
    let cancelled = false;
    
    supabase.from('saved_profiles').select('id')
      .eq('user_id', currentUserId)
      .eq('saved_profile_id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled && aliveRef.current && !error) {
          setIsSaved(!!data);
        }
        if (error && !cancelled) {
          console.warn('Saved check error:', error.message);
        }
      });
    
    return () => { cancelled = true };
  }, [currentUserId, id, validId]);

  // ✅ Load profile - only if valid ID
  useEffect(() => {
    if (!id || !validId) {
      startTransition(() => { setError(true); setLoading(false); });
      return;
    }
    
    let cancelled = false;
    
    const loadProfile = async () => {
      startTransition(() => { setLoading(true); setError(false); });
      
      try {
        // Increment view count (fire-and-forget)
        supabase.rpc('increment_profile_view', { profile_id: id }).then(() => {}).catch(() => {});
        
        // ✅ FIXED: Select all fields including multi-language names
        const { data, error: e } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (e || !data) {
          if (!cancelled && aliveRef.current) {
            startTransition(() => { setError(true); setLoading(false); });
          }
          return;
        }
        
        if (!cancelled && aliveRef.current) {
          startTransition(() => {
            setProfile(data);
            setLoading(false);
          });
          
          // Check if own profile
          if (currentUserId) {
            setIsOwnProfile(data.id === currentUserId || data.phone === currentUserId);
          }
        }
      } catch (err) {
        if (!cancelled && aliveRef.current) {
          startTransition(() => { setError(true); setLoading(false); });
        }
      }
    };
    
    loadProfile();
    return () => { cancelled = true };
  }, [id, currentUserId, validId]);

  // ✅ Load similar workers
  useEffect(() => {
    if (!profile?.category) return;
    
    let cancelled = false;
    
    supabase.from('profiles')
      .select('id, name, category, photo_url, expected_salary, rating, is_online, name_bn, name_ar, name_hi')
      .eq('category', profile.category)
      .eq('country', country)
      .neq('id', profile.id)
      .eq('is_public', true)
      .limit(5)
      .then(({ data }) => {
        if (!cancelled && aliveRef.current && data) {
          setSimilarWorkers(data);
        }
      });
    
    return () => { cancelled = true };
  }, [profile, country]);

  // ✅ Toggle save
  const toggleSave = useCallback(async () => {
    if (!currentUserId || !validId) {
      router.push(`/${country}/${lang}/login`);
      return;
    }
    if (!isValidUUID(currentUserId)) return;
    
    setSaving(true);
    
    try {
      if (isSaved) {
        await supabase.from('saved_profiles')
          .delete()
          .eq('user_id', currentUserId)
          .eq('saved_profile_id', id);
        startTransition(() => setIsSaved(false));
      } else {
        await supabase.from('saved_profiles')
          .insert({ user_id: currentUserId, saved_profile_id: id, country });
        startTransition(() => setIsSaved(true));
      }
    } catch (err) {
      console.error('Save toggle error:', err);
    } finally {
      setSaving(false);
    }
  }, [currentUserId, isSaved, id, country, lang, router, validId]);

  // ✅ Share profile
  const shareProfile = useCallback(async () => {
    const url = window.location.href;
    const title = translateName(profile?.name, lang, profile);
    const text = `Check out ${title}'s profile on Noffor`;
    
    // Try native share
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {}
    }
    
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      alert(t('linkCopied') || 'Link copied!');
      return;
    } catch {}
    
    // Final fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert(t('linkCopied') || 'Link copied!');
  }, [profile, lang, t]);

  // ═══════════════════════════════════════════════════════════
  // 📱 ফোন ফরম্যাটার (অটোমেটিক দেশের কোড)
  // ═══════════════════════════════════════════════════════════
  const formatPhone = useCallback((phone: string): string => {
    if (!phone) return '';
    let c = phone.replace(/[^0-9+]/g, '');
    
    if (c.startsWith('+')) {
      if (c.startsWith('+0')) return '+' + c.substring(2);
      return c;
    }
    
    const code = countryCodes[country] || '974';
    if (c.startsWith('0')) c = c.substring(1);
    return code + c;
  }, [country]);

  // Memoized values
  const images = useMemo(() => 
    [profile?.photo_url, ...(profile?.photos || [])].filter(Boolean), 
    [profile]
  );
  
  const phoneNumber = profile?.phone || '';
  const whatsappUrl = useMemo(() => 
    phoneNumber ? `https://wa.me/${formatPhone(phoneNumber)}` : '#', 
    [phoneNumber, formatPhone]
  );
  const callUrl = useMemo(() => 
    phoneNumber ? `tel:${formatPhone(phoneNumber)}` : '#', 
    [phoneNumber, formatPhone]
  );

  // ✅ Display name with translation
  const displayName = useMemo(() => 
    translateName(profile?.name || '', lang, profile), 
    [profile, lang]
  );

  // ═══════════════════════════════════════════════════════════
  // Invalid ID State
  // ═══════════════════════════════════════════════════════════
  if (!validId && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header country={country} lang={lang} />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              {t('invalidProfile') || 'Invalid Profile'}
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              The profile ID is not valid.
            </p>
            <button 
              onClick={() => router.push(`/${country}/${lang}`)} 
              className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all"
            >
              {t('goHome') || 'Go Home'}
            </button>
          </div>
        </div>
        <MobileNav country={country} lang={lang} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // Loading State
  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header country={country} lang={lang} />
        <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin text-orange-500" />
          <p className="text-sm text-gray-400">{t('loading') || 'Loading profile...'}</p>
        </div>
        <MobileNav country={country} lang={lang} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // Error State
  // ═══════════════════════════════════════════════════════════
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header country={country} lang={lang} />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              {t('profileNotFound') || 'Profile Not Found'}
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              {t('profileNotFoundDesc') || 'This profile has been removed or does not exist'}
            </p>
            <button 
              onClick={() => router.push(`/${country}/${lang}`)} 
              className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-700 active:scale-[0.98] transition-all"
            >
              {t('goHome') || 'Go Home'}
            </button>
          </div>
        </div>
        <MobileNav country={country} lang={lang} />
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // Profile Render
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      <Header country={country} lang={lang} />
      
      <div className="max-w-3xl mx-auto px-3 lg:px-4 py-3 pb-28 lg:pb-4">
        
        {/* Image Slider */}
        <ImageSlider images={images} />
        
        {/* Profile Header */}
        <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm" style={{ contain: 'layout style paint' }}>
          {/* Online Status + Actions */}
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
              <button 
                onClick={toggleSave} 
                disabled={saving} 
                className="text-gray-500 hover:text-red-500 transition p-2 active:scale-90 disabled:opacity-50"
                aria-label={isSaved ? 'Remove from saved' : 'Save profile'}
              >
                <Heart size={20} fill={isSaved ? '#ef4444' : 'none'} className={isSaved ? 'text-red-500' : ''} />
              </button>
              <button 
                onClick={shareProfile} 
                className="text-gray-500 hover:text-green-500 transition p-2 active:scale-90"
                aria-label="Share profile"
              >
                <Share2 size={18} />
              </button>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                {profile.profile_language || 'EN'}
              </span>
            </div>
          </div>
          
          {/* ✅ Name with multi-language + Verified Badge */}
          <div className="mt-3">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
              <span>{displayName}</span>
              {profile.is_verified && (
                <Award size={18} className="text-blue-500 shrink-0" />
              )}
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              {translateCategory(profile.category, lang)}
            </p>
          </div>
          
          {/* Salary + Rating + Location */}
          <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
            <p className="text-2xl font-bold text-orange-600">
              {translateNumber(
                profile.expected_salary?.toString().replace(/[^0-9]/g, '').trim() || '0', 
                lang
              )} {getCurrencySymbol(lang)}
              <span className="text-sm font-normal text-gray-400 ml-1">/ {t('month')}</span>
            </p>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1.5 rounded-full">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-sm">{translateNumber(profile.rating || 0, lang)}</span>
                <span className="text-xs text-gray-400">({translateNumber(profile.total_reviews || 0, lang)})</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-full">
                <MapPin size={12} className="text-blue-500" />
                <span className="text-xs text-gray-600 font-medium">{profile.city || t('notSpecified')}</span>
              </div>
            </div>
          </div>
          
          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-600 border-t pt-3 mt-3 leading-relaxed">
              {profile.bio}
            </p>
          )}
          
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 pt-3 mt-3 border-t">
            <StatsCard 
              icon="👁️" 
              value={translateNumber(stats.views, lang)} 
              label={t('views')} 
              gradient="from-blue-50 to-blue-100" 
            />
            <StatsCard 
              icon="📅" 
              value={`${translateNumber(profile.experience || 0, lang)}+`} 
              label={t('experience')} 
              gradient="from-green-50 to-green-100" 
            />
            <StatsCard 
              icon="⚡" 
              value={`${translateNumber(stats.responseRate, lang)}%`} 
              label={t('response')} 
              gradient="from-orange-50 to-orange-100" 
            />
            <StatsCard 
              icon="⭐" 
              value={translateNumber(profile.rating || 0, lang)} 
              label={t('rating')} 
              gradient="from-purple-50 to-purple-100" 
            />
          </div>
        </div>
        
        {/* Bio Grid - Biodata */}
        <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Shield size={16} className="text-green-500" />
            {t('biodata')}
          </h3>
          <BioGrid profile={profile} lang={lang} />
        </div>
        
        {/* Skills */}
        <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">⚡ {t('skills')}</h3>
          <SkillsTag skills={profile.skills || []} lang={lang} />
        </div>
        
        {/* Work Photos */}
        {profile.photos && profile.photos.length > 0 && (
          <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">📸 {t('workPhotos')}</h3>
            <WorkPhotos photos={profile.photos} lang={lang} />
          </div>
        )}
        
        {/* Live Activity */}
        <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-orange-500 animate-pulse" />
            {t('liveActivity')}
          </h3>
          <LiveActivity profileId={profile.id} lang={lang} />
        </div>
        
        {/* Reviews */}
        <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">⭐ {t('reviews')}</h3>
          <ReviewSection profileId={profile.id} lang={lang} />
        </div>
        
        {/* Similar Workers */}
        {similarWorkers.length > 0 && !isOwnProfile && (
          <div className="mt-4 bg-white rounded-xl p-4 border shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Users size={16} className="text-blue-500" />
              {t('similarWorkers')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {similarWorkers.map(worker => (
                <SimilarWorkerCard 
                  key={worker.id} 
                  worker={worker} 
                  lang={lang} 
                  country={country} 
                  router={router} 
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Share & Report */}
        <div className="mt-4">
          <ShareReport name={displayName} lang={lang} />
        </div>
      </div>

      {/* Mobile StickyBar */}
      {!isOwnProfile && phoneNumber && (
        <StickyBar 
          phone={phoneNumber} 
          lang={lang} 
          country={country}
          onJobOffer={() => setShowBooking(true)} 
        />
      )}

      {/* PC Floating Buttons */}
      {!isOwnProfile && (
        <div className="fixed bottom-6 right-6 hidden lg:flex lg:flex-col gap-3 z-50">
          {phoneNumber && (
            <>
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-green-500 hover:bg-green-600 text-white p-3.5 rounded-full shadow-lg transition-all hover:scale-110 active:scale-90"
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle size={24} />
              </a>
              <a 
                href={callUrl} 
                className="bg-blue-500 hover:bg-blue-600 text-white p-3.5 rounded-full shadow-lg transition-all hover:scale-110 active:scale-90"
                aria-label="Call"
              >
                <Phone size={24} />
              </a>
            </>
          )}
          <button 
            onClick={() => setShowBooking(true)} 
            className="bg-orange-500 hover:bg-orange-600 text-white p-3.5 rounded-full shadow-lg transition-all hover:scale-110 active:scale-90"
            aria-label="Send Job Offer"
          >
            <Briefcase size={24} />
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && profile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          onClick={() => setShowBooking(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto overscroll-contain shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10 rounded-t-2xl">
              <h3 className="font-bold text-lg">
                {t('sendJobOffer')} {displayName}
              </h3>
              <button 
                onClick={() => setShowBooking(false)} 
                className="p-1.5 hover:bg-gray-100 rounded-full transition"
                aria-label="Close"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              <BookingForm 
                worker={profile} 
                isOpen={showBooking} 
                onClose={() => setShowBooking(false)} 
                country={country} 
                lang={lang} 
              />
            </div>
          </div>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Export with Error Boundary
// ═══════════════════════════════════════════════════════════
export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfilePageContent />
    </ErrorBoundary>
  );
}