"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { Star, Briefcase, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getText, LangCode } from '@/lib/language';

const ITEMS_PER_PAGE = 5;

export default function FeaturedList({ country, lang, type = 'labor' }: { country: string; lang: string; type?: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const isJob = type === 'employer';
  const title = isJob 
    ? (lang === 'bn' ? 'সর্বশেষ চাকরি' : lang === 'ar' ? 'أحدث الوظائف' : 'Latest Jobs')
    : t('featured');

  const loadProfiles = useCallback(async (pageNum: number, append: boolean) => {
    const from = pageNum * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    const { data, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', type)
      .eq('country', country)
      .eq('profile_language', lang)
      .order('created_at', { ascending: false })
      .range(from, to);

    const total = count || 0;
    setHasMore(from + ITEMS_PER_PAGE < total);
    return data || [];
  }, [country, lang, type]);

  // Initial Load
  useEffect(() => {
    loadProfiles(0, false).then(data => {
      setProfiles(data);
      setPage(0);
      setLoading(false);
    });
  }, [loadProfiles]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('featured-' + type + '-' + Date.now())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, async (payload) => {
        if (payload.new.country === country && payload.new.role === type && payload.new.profile_language === lang) {
          setProfiles(prev => [payload.new, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [country, lang, type]);

  // Infinity Scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true);
        const nextPage = page + 1;
        loadProfiles(nextPage, true).then(newData => {
          setProfiles(prev => [...prev, ...newData]);
          setPage(nextPage);
          setLoadingMore(false);
        });
      }
    }, { threshold: 0.1, rootMargin: '200px' });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, loadProfiles]);

  // Loading Skeleton
  if (loading) {
    return (
      <div>
        <h2 className="font-bold text-gray-800 text-sm lg:text-lg mb-2 px-1">{title}</h2>
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse">
              <div className="w-full h-24 lg:h-40 bg-gray-200" />
              <div className="p-2 space-y-1.5"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (!profiles.length) {
    return (
      <div>
        <h2 className="font-bold text-gray-800 text-sm lg:text-lg mb-2 px-1">{title}</h2>
        <div className="text-center py-8 bg-white rounded-xl border">
          <p className="text-gray-500 text-sm">{t('noResults')}</p>
          <a href={`${rest}/create`} className="text-orange-600 text-sm mt-2 inline-block">{isJob ? t('postJob') : t('createProfile')}</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="font-bold text-gray-800 text-sm lg:text-lg">{title}</h2>
        <a href={`${rest}/search?type=${type}`} className="text-xs lg:text-sm text-orange-600 no-underline">{t('viewAll')}</a>
      </div>
      
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
        {profiles.map((item) => (
          <a key={item.id} href={`${rest}/profile/${item.id}`} className="bg-white rounded-xl border overflow-hidden no-underline hover:shadow-lg transition-all active:scale-[0.98]">
            <div className="relative">
              <img src={item.photo_url || '/default-avatar.png'} alt={item.name || 'User'} className="w-full h-24 lg:h-40 object-cover" loading="lazy" />
              {isJob ? (
                <span className="absolute top-1 left-1 bg-blue-500 text-white text-[7px] lg:text-xs px-1.5 py-0.5 rounded-full">
                  {lang === 'bn' ? 'চাকরি' : lang === 'ar' ? 'وظيفة' : 'Job'}
                </span>
              ) : (
                item.is_online && <span className="absolute top-1 left-1 bg-green-500 text-white text-[7px] lg:text-xs px-1.5 py-0.5 rounded-full">{t('online')}</span>
              )}
            </div>
            <div className="p-1.5 lg:p-2">
              <h4 className="font-medium text-gray-800 text-[10px] lg:text-sm truncate">{item.name || (isJob ? 'Company' : 'Worker')}</h4>
              <p className="text-[9px] lg:text-xs text-gray-500 truncate">
                {isJob ? item.bio?.split('\n')[0]?.replace('Job: ', '')?.slice(0, 25) || item.category : item.category}
              </p>
              {!isJob && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <Star size={10} className="text-yellow-500" fill="#EAB308" />
                  <span className="text-[9px] lg:text-xs font-medium">{item.rating || 'New'}</span>
                </div>
              )}
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[9px] lg:text-xs font-bold text-orange-600">{item.expected_salary || 'Nego'}</span>
                {item.city && <span className="text-[8px] text-gray-400 flex items-center gap-0.5"><MapPin size={8} />{item.city}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loaderRef} className="py-4 text-center">
          {loadingMore && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}