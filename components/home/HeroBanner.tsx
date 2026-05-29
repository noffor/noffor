"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function HeroBanner({ country, lang }: { country: string; lang: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, [country, lang]);

  const loadBanners = async () => {
    setLoading(true);
    const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('country', country)
  .order('created_at', { ascending: false })
  .limit(20);
    
    setBanners(data || []);
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
      <div className="relative w-full h-48 lg:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-48 lg:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <p className="text-lg lg:text-2xl font-bold">{t('featured')}</p>
          <p className="text-sm opacity-80 mt-2">{t('noResults')}</p>
          <a href={`/${country}/${lang}/create`} className="inline-block mt-3 px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-medium">
            {t('create')}
          </a>
        </div>
      </div>
    );
  }

  const banner = banners[current];
  const isEmployer = banner.role === 'employer';

  return (
    <div className="relative w-full h-48 lg:h-64 rounded-xl overflow-hidden group">
      <img
        src={banner.photo_url || '/banners/default.jpg'}
        alt={banner.name || 'Banner'}
        className="w-full h-full object-cover"
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
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isEmployer ? 'bg-blue-500' : 'bg-orange-500'}`}>
            {isEmployer ? (t('hiring') || 'HIRING') : t('featured')}
          </span>
          {banner.is_online && !isEmployer && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
        </div>
        <h2 className="text-base lg:text-2xl font-bold truncate">{banner.name || (isEmployer ? 'Company' : 'Worker')}</h2>
        <p className="text-xs lg:text-sm opacity-90 mt-1 truncate">
          {isEmployer 
            ? `${t('hiring') || 'Hiring'}: ${banner.category || ''} • ${banner.expected_salary || ''}`
            : `${banner.category || ''} • ${banner.expected_salary || ''}`
          }
        </p>
      </a>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full transition-all ${i === current ? 'bg-white w-4 lg:w-6' : 'bg-white/50'}`} />
          ))}
        </div>
      )}

      <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
        {current + 1} / {banners.length}
      </div>
    </div>
  );
}