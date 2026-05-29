// components/home/UnifiedList.tsx
"use client";
import { useEffect, useState, useRef } from 'react';
import { Star, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  type: 'labor' | 'employer';
  country: string;
  lang: string;
}

const ITEMS_PER_PAGE = 12;

export default function UnifiedList({ type, country, lang }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getTitle = () => {
    if (type === 'labor') {
      return lang === 'bn' ? '👷 সদ্য যোগদানকারী শ্রমিক' : 
             lang === 'ar' ? 'عمال جدد' : 
             '👷 New Workers';
    } else {
      return lang === 'bn' ? '💼 সদ্য পোস্ট করা চাকরি' : 
             lang === 'ar' ? 'وظائف جديدة' : 
             '💼 New Jobs';
    }
  };

  const getEmptyMessage = () => {
    if (type === 'labor') {
      return lang === 'bn' ? 'কোন শ্রমিক পাওয়া যায়নি' : 
             lang === 'ar' ? 'لا يوجد عمال' : 
             'No workers found';
    } else {
      return lang === 'bn' ? 'কোন চাকরি পাওয়া যায়নি' : 
             lang === 'ar' ? 'لا توجد وظائف' : 
             'No jobs found';
    }
  };

  const loadItems = async (reset = false) => {
    const currentPage = reset ? 0 : page;
    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    console.log(`📡 Fetching ${type} for ${country}/${lang}...`); // ডিবাগ

    const { data, error, count } = await supabase
  .from('profiles')
  .select('*', { count: 'exact' })
  .eq('role', type)
  .eq('country', country)
  .order('created_at', { ascending: false })
  .range(from, to);

    if (error) {
      console.error('Error:', error);
      return [];
    }

    console.log(`✅ Fetched ${data?.length} ${type}s, total: ${count}`); // ডিবাগ

    const totalCount = count || 0;
    setHasMore((from + ITEMS_PER_PAGE) < totalCount);
    return data || [];
  };

  const initialLoad = async () => {
    setLoading(true);
    const data = await loadItems(true);
    setItems(data);
    setPage(1);
    setHasMore(data.length === ITEMS_PER_PAGE);
    setLoading(false);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const newData = await loadItems(false);
    if (newData.length > 0) {
      setItems(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
    }
    setLoadingMore(false);
  };

  useEffect(() => {
    initialLoad();
  }, [country, lang, type]); // 🔥 lang পরিবর্তন হলে রিলোড

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    if (loaderRef.current) observerRef.current.observe(loaderRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, loadingMore, items.length]);

  // লোডিং স্কেলটন
  if (loading && items.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800 text-sm lg:text-lg">{getTitle()}</h2>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse">
              <div className="w-full h-24 lg:h-40 bg-gray-200" />
              <div className="p-2 space-y-1.5">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div>
        <h2 className="font-bold text-gray-800 text-sm lg:text-lg mb-3">{getTitle()}</h2>
        <div className="text-center py-8 bg-white rounded-xl border">
          <p className="text-gray-500 text-sm">{getEmptyMessage()}</p>
          <a href={`/${country}/${lang}/create`} className="text-orange-600 text-sm mt-2 inline-block">
            {type === 'labor' ? '✨ প্রথম শ্রমিক প্রোফাইল তৈরি করুন' : '✨ প্রথম চাকরি পোস্ট করুন'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="font-bold text-gray-800 text-sm lg:text-lg">{getTitle()}</h2>
        <a href={`/${country}/${lang}/search?type=${type}`} className="text-xs lg:text-sm text-orange-600 no-underline hover:underline">
          {lang === 'bn' ? 'সব দেখুন →' : lang === 'ar' ? 'عرض الكل →' : 'View all →'}
        </a>
      </div>
      
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
        {items.map((item, idx) => (
          <a
            key={`${item.id}-${idx}`}
            href={`/${country}/${lang}/profile/${item.id}`}
            className="bg-white rounded-xl border overflow-hidden no-underline hover:shadow-lg transition-all active:scale-[0.98] group"
          >
            <div className="relative">
              <img 
                src={item.photo_url || '/default-avatar.png'} 
                alt={item.name || 'User'} 
                className="w-full h-24 lg:h-40 object-cover" 
                loading="lazy"
              />
              {item.is_online && (
                <span className="absolute top-1 left-1 bg-green-500 text-white text-[7px] lg:text-xs px-1.5 py-0.5 rounded-full">
                  {lang === 'bn' ? 'অনলাইন' : 'Online'}
                </span>
              )}
              <span className={`absolute top-1 right-1 text-[7px] lg:text-xs px-1.5 py-0.5 rounded-full ${
                type === 'labor' ? 'bg-orange-500' : 'bg-blue-500'
              } text-white`}>
                {type === 'labor' ? (lang === 'bn' ? 'শ্রমিক' : 'Worker') : (lang === 'bn' ? 'চাকরি' : 'Job')}
              </span>
            </div>
            
            <div className="p-1.5 lg:p-2">
              <h4 className="font-medium text-gray-800 text-[10px] lg:text-sm truncate group-hover:text-orange-600">
                {item.name || (type === 'labor' ? 'শ্রমিক' : 'কোম্পানি')}
              </h4>
              
              <p className="text-[9px] lg:text-xs text-gray-500 truncate">
                {type === 'labor' 
                  ? item.category 
                  : item.bio?.split('\n')[0]?.replace('Job: ', '')?.slice(0, 25) || item.category}
              </p>
              
              <div className="flex items-center gap-0.5 mt-0.5">
                <Star size={10} className="text-yellow-500" fill="#EAB308" />
                <span className="text-[9px] lg:text-xs font-medium">
                  {item.rating || (lang === 'bn' ? 'নতুন' : 'New')}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[8px] lg:text-[10px] font-bold text-orange-600 truncate max-w-[60px]">
                  💰 {item.expected_salary?.slice(0, 12) || (lang === 'bn' ? 'আলোচ্য' : 'Nego')}
                </span>
                {item.city && (
                  <span className="text-[8px] lg:text-[10px] text-gray-500 truncate flex items-center gap-0.5">
                    <MapPin size={8} className="inline" /> {item.city}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
      
      {hasMore && (
        <div ref={loaderRef} className="py-4 text-center">
          {loadingMore ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-500">
                {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
              </span>
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="text-center py-3">
          <p className="text-[9px] lg:text-xs text-gray-400">
            ✨ {items.length} টি {type === 'labor' ? 'শ্রমিক' : 'চাকরি'} লোড হয়েছে ✨
          </p>
        </div>
      )}
    </div>
  );
}