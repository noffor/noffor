// components/home/UnifiedList.tsx
"use client";
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { Star, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  type: 'labor' | 'employer';
  country: string;
  lang: string;
}

const ITEMS_PER_PAGE = 6;
const MAX_ITEMS = 18; // 🔥 কমিয়ে 18 করা হয়েছে

// ✅ মেমোয়াজড কার্ড কম্পোনেন্ট (পুনরায় রেন্ডার বন্ধ)
const ItemCard = memo(({ item, type, country, lang, isLabor }: any) => {
  const [imgError, setImgError] = useState(false);
  
  return (
    <a
      href={`/${country}/${lang}/profile/${item.id}`}
      className="bg-white rounded-xl border overflow-hidden no-underline hover:shadow-lg transition-all active:scale-[0.98] group"
    >
      <div className="relative">
        <img 
          src={imgError ? '/default-avatar.png' : (item.photo_url || '/default-avatar.png')} 
          alt={item.name || 'User'} 
          className="w-full h-24 lg:h-40 object-cover" 
          loading="lazy"
          onError={() => setImgError(true)}
        />
        {item.is_online && isLabor && (
          <span className="absolute top-1 left-1 bg-green-500 text-white text-[7px] lg:text-xs px-1.5 py-0.5 rounded-full">
            {lang === 'bn' ? 'অনলাইন' : lang === 'ar' ? 'متصل' : 'Online'}
          </span>
        )}
        <span className={`absolute top-1 right-1 text-[7px] lg:text-xs px-1.5 py-0.5 rounded-full ${
          isLabor ? 'bg-orange-500' : 'bg-blue-500'
        } text-white`}>
          {isLabor ? (lang === 'bn' ? 'শ্রমিক' : lang === 'ar' ? 'عامل' : 'Worker') : (lang === 'bn' ? 'চাকরি' : lang === 'ar' ? 'وظيفة' : 'Job')}
        </span>
      </div>
      
      <div className="p-1.5 lg:p-2">
        <h4 className="font-medium text-gray-800 text-[10px] lg:text-sm truncate group-hover:text-orange-600">
          {item.name || (isLabor ? 'শ্রমিক' : 'কোম্পানি')}
        </h4>
        
        <p className="text-[9px] lg:text-xs text-gray-500 truncate">
          {isLabor 
            ? item.category 
            : item.bio?.split('\n')[0]?.replace('Job: ', '')?.slice(0, 25) || item.category || 'জব'}
        </p>
        
        <div className="flex items-center gap-0.5 mt-0.5">
          <Star size={10} className="text-yellow-500" fill="#EAB308" />
          <span className="text-[9px] lg:text-xs font-medium">
            {item.rating || (lang === 'bn' ? 'নতুন' : lang === 'ar' ? 'جديد' : 'New')}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[8px] lg:text-[10px] font-bold text-orange-600 truncate max-w-[60px]">
            💰 {item.expected_salary?.toString().slice(0, 10) || (lang === 'bn' ? 'আলোচ্য' : lang === 'ar' ? 'تفاوض' : 'Nego')}
          </span>
          {item.city && (
            <span className="text-[8px] lg:text-[10px] text-gray-500 truncate flex items-center gap-0.5">
              <MapPin size={8} className="inline" /> {item.city}
            </span>
          )}
        </div>
      </div>
    </a>
  );
});
ItemCard.displayName = 'ItemCard';

export default function UnifiedList({ type, country, lang }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLabor = type === 'labor';
  const abortControllerRef = useRef<AbortController | null>(null);

  const getTitle = useCallback(() => {
    if (isLabor) {
      return lang === 'bn' ? '👷 নতুন শ্রমিক' : lang === 'ar' ? 'عمال جدد' : '👷 New Workers';
    }
    return lang === 'bn' ? '💼 নতুন চাকরি' : lang === 'ar' ? 'وظائف جديدة' : '💼 New Jobs';
  }, [lang, isLabor]);

  const getEmptyMessage = useCallback(() => {
    if (isLabor) {
      return lang === 'bn' ? 'কোন শ্রমিক পাওয়া যায়নি' : lang === 'ar' ? 'لا يوجد عمال' : 'No workers found';
    }
    return lang === 'bn' ? 'কোন চাকরি পাওয়া যায়নি' : lang === 'ar' ? 'لا توجد وظائف' : 'No jobs found';
  }, [lang, isLabor]);

  // ✅ AbortController দিয়ে API কল কন্ট্রোল
  const loadItems = useCallback(async (reset = false) => {
    if (!country) return [];
    
    // আগের কল বাতিল করুন
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    const currentPage = reset ? 0 : page;
    const from = currentPage * ITEMS_PER_PAGE;
    
    if (from >= MAX_ITEMS) {
      setHasMore(false);
      return [];
    }
    
    const to = Math.min(from + ITEMS_PER_PAGE - 1, MAX_ITEMS - 1);

    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', type)
        .eq('country', country)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (controller.signal.aborted) return [];
      if (error) throw error;

      const totalCount = Math.min(count || 0, MAX_ITEMS);
      setHasMore((to + 1) < totalCount && (to + 1) < MAX_ITEMS);
      return data || [];
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error loading items:', err);
        setError(err.message);
      }
      return [];
    }
  }, [type, country, page]);

  // ✅ ইমিডিয়েট লোড
  const initialLoad = useCallback(async () => {
    if (initialLoaded) return;
    setLoading(true);
    setError(null);
    setPage(0);
    const data = await loadItems(true);
    setItems(data);
    setPage(1);
    setHasMore(data.length === ITEMS_PER_PAGE && data.length > 0);
    setLoading(false);
    setInitialLoaded(true);
  }, [loadItems, initialLoaded]);

  // ✅ লোড মোর (ডিবাউন্স সহ)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const newData = await loadItems(false);
    if (newData.length > 0 && !loading) {
      setItems(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
    }
    setLoadingMore(false);
  }, [loadingMore, hasMore, loadItems, loading]);

  // ✅ প্রাথমিক লোড - শুধু একবার
  useEffect(() => {
    initialLoad();
    
    // ক্লিনআপ
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [country, lang, type]); // 🔥 lang পরিবর্তন হলে রিলোড হবে

  // ✅ ইনফিনিট স্ক্রোল - ডিবাউন্স সহ
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    
    let timeoutId: NodeJS.Timeout;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore && items.length < MAX_ITEMS) {
          // ডিবাউন্স - 300ms অপেক্ষা
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            loadMore();
          }, 300);
        }
      },
      { threshold: 0.5, rootMargin: '100px' }
    );
    
    if (loaderRef.current) observerRef.current.observe(loaderRef.current);
    return () => {
      observerRef.current?.disconnect();
      clearTimeout(timeoutId);
    };
  }, [hasMore, loading, loadingMore, items.length, loadMore]);

  // এরর স্টেট
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 text-center border">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={() => { setInitialLoaded(false); initialLoad(); }} className="mt-2 text-orange-600 text-sm">
          {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Try again'}
        </button>
      </div>
    );
  }

  // লোডিং স্কেলটন
  if (loading && items.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="font-bold text-gray-800 text-sm lg:text-lg">{getTitle()}</h2>
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse">
              <div className="w-full h-24 lg:h-40 bg-gray-200" />
              <div className="p-2 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-2 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // খালি স্টেট
  if (items.length === 0 && !loading) {
    return (
      <div>
        <h2 className="font-bold text-gray-800 text-sm lg:text-lg mb-3">{getTitle()}</h2>
        <div className="text-center py-8 bg-white rounded-xl border">
          <p className="text-gray-500 text-sm">{getEmptyMessage()}</p>
          <a href={`/${country}/${lang}/create`} className="text-orange-600 text-sm mt-2 inline-block hover:underline">
            {isLabor ? '✨ প্রথম শ্রমিক প্রোফাইল তৈরি করুন' : '✨ প্রথম চাকরি পোস্ট করুন'}
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
          <ItemCard 
            key={`${item.id}-${idx}`}
            item={item}
            type={type}
            country={country}
            lang={lang}
            isLabor={isLabor}
          />
        ))}
      </div>
      
      {/* লোড মোর ইন্ডিকেটর */}
      {hasMore && items.length < MAX_ITEMS && (
        <div ref={loaderRef} className="py-3 text-center">
          {loadingMore ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-gray-500">
                {lang === 'bn' ? 'লোড হচ্ছে...' : lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </span>
            </div>
          ) : (
            <div className="h-6" />
          )}
        </div>
      )}
      
      {/* সম্পূর্ণ বার্তা */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-2">
          <p className="text-[9px] lg:text-[10px] text-gray-400">
            ✨ {items.length} টি {isLabor ? 'শ্রমিক' : 'চাকরি'} দেখানো হচ্ছে ✨
          </p>
        </div>
      )}
    </div>
  );
}