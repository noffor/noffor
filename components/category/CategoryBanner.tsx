"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function CategoryBanner({ slug, lang = 'en', country = 'qa' }: { slug: string; lang?: string; country?: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, online: 0 });

  const categoryName = categoryNames[slug]?.[lang] || slug;

  useEffect(() => {
    loadBanners();
    
    // ✅ Realtime - পোস্ট করার সাথে সাথে ব্যানারে
    const channel = supabase
      .channel('cat-banner-' + slug + '-' + Date.now())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, async (payload) => {
        if (payload.new.role === 'labor' && payload.new.category === slug && payload.new.country === country) {
          setBanners(prev => [payload.new, ...prev].slice(0, 20));
          setStats(prev => ({ 
            total: prev.total + 1, 
            online: payload.new.is_online ? prev.online + 1 : prev.online 
          }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [slug, country]);

  const loadBanners = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'labor')
      .eq('category', slug)
      .eq('country', country)
      .order('created_at', { ascending: false })
      .limit(20);

    setBanners(data || []);
    
    const { count: total } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'labor')
      .eq('category', slug)
      .eq('country', country);
    
    const { count: online } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'labor')
      .eq('category', slug)
      .eq('country', country)
      .eq('is_online', true);

    setStats({ total: total || 0, online: online || 0 });
    setLoading(false);
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="relative w-full h-40 lg:h-56 rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse mb-4" />
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-40 lg:h-56 rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
        <div className="text-center text-white px-4">
          <p className="text-xl lg:text-3xl font-bold">{categoryName}</p>
          <p className="text-sm opacity-80 mt-2">{t('noResults')}</p>
          <a href={`/${country}/${lang}/create`} className="inline-block mt-3 px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-medium">
            {t('createProfile')}
          </a>
        </div>
      </div>
    );
  }

  const banner = banners[current];

  return (
    <div className="relative w-full h-40 lg:h-56 rounded-xl overflow-hidden group mb-4">
      <img
        src={banner.photo_url || '/banners/default.jpg'}
        alt={banner.name || categoryName}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      
      {banners.length > 1 && (
        <>
          <button onClick={() => setCurrent(p => (p - 1 + banners.length) % banners.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrent(p => (p + 1) % banners.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <a href={`/${country}/${lang}/profile/${banner.id}`} className="absolute bottom-4 left-4 right-4 text-white no-underline block">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500">{categoryName}</span>
          {banner.is_online && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
        </div>
        <h2 className="text-base lg:text-2xl font-bold truncate">{banner.name}</h2>
        <p className="text-xs lg:text-sm opacity-90 mt-1 truncate">
          {banner.experience || ''} • {banner.expected_salary || ''}
        </p>
      </a>

      <div className="absolute top-3 left-3 flex gap-2">
        <span className="bg-black/40 text-white text-xs px-2 py-1 rounded-full">{stats.total} {categoryName}s</span>
        <span className="bg-green-500/40 text-white text-xs px-2 py-1 rounded-full">{stats.online} {t('online')}</span>
      </div>

      <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
        {current + 1} / {banners.length}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/50'}`} />
          ))}
        </div>
      )}
    </div>
  );
}