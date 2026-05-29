"use client";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import CategoryBanner from '@/components/category/CategoryBanner';
import CategoryFilters from '@/components/category/CategoryFilters';
import ProfileCard from '@/components/category/ProfileCard';
import { supabase } from '@/lib/supabase';
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

const ITEMS_PER_PAGE = 5;

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const country = (params as any).country || 'qa';
  const lang = (params as any).lang || 'en';
  const slug = (params as any).slug || 'driver';
  const filter = searchParams.get('filter') || 'all';
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;

  const categoryName = categoryNames[slug]?.['en'] || slug;

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadProfiles = useCallback(async (pageNum: number, append: boolean) => {
    const from = pageNum * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('category', categoryName)
      .eq('country', country)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (filter === 'featured') query = query.eq('is_featured', true);
    if (filter === 'online') query = query.eq('is_online', true);
    
    const { data, count } = await query;
    const total = count || 0;
    setTotalCount(total);
    setHasMore(from + ITEMS_PER_PAGE < total);
    return data || [];
  }, [country, categoryName, filter]);

  // Initial Load
  useEffect(() => {
    setLoading(true);
    loadProfiles(0, false).then(data => {
      setProfiles(data);
      setPage(0);
      setLoading(false);
    });
  }, [loadProfiles]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('cat-page-' + slug + '-' + Date.now())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, async (payload) => {
        if (payload.new.role === 'labor' && payload.new.category === categoryName && payload.new.country === country) {
          setProfiles(prev => [payload.new, ...prev]);
          setTotalCount(prev => prev + 1);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [slug, country, categoryName]);

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

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-7xl mx-auto px-3 lg:px-4 py-3">
        <CategoryBanner slug={categoryName} lang={lang} country={country} />
        <CategoryFilters country={country} lang={lang} slug={slug} active={filter} />
        
        {/* Total Count */}
        <p className="text-xs text-gray-500 mb-2">{totalCount} workers found</p>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse">
                <div className="w-full h-40 bg-gray-200" />
                <div className="p-2 space-y-1.5"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* PC Grid */}
            <div className="hidden lg:grid grid-cols-5 gap-3">
              {profiles.map(p => (
                <ProfileCard key={p.id} profile={p} href={`${rest}/profile/${p.id}`} lang={lang} />
              ))}
            </div>
            {/* Mobile Grid */}
            <div className="grid grid-cols-2 gap-2 lg:hidden">
              {profiles.map(p => (
                <ProfileCard key={p.id} profile={p} href={`${rest}/profile/${p.id}`} lang={lang} />
              ))}
            </div>
          </>
        )}

        {/* Infinity Scroll Trigger */}
        {hasMore && (
          <div ref={loaderRef} className="py-4 text-center">
            {loadingMore && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-500">Loading...</span>
              </div>
            )}
          </div>
        )}

        {!hasMore && profiles.length > 0 && (
          <p className="text-center text-xs text-gray-400 py-4">All {totalCount} workers loaded</p>
        )}
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}