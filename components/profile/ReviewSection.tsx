// components/profile/ReviewSection.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_photo: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Props {
  profileId: string;
  lang: string;
}

export default function ReviewSection({ profileId, lang }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastReviewRef = useRef<HTMLDivElement | null>(null);
  
  const REVIEWS_PER_PAGE = 10;

  const t = (key: string) => {
    const texts: any = {
      en: { reviews: 'Reviews', noReviews: 'No reviews yet', loadMore: 'Load more' },
      bn: { reviews: 'রিভিউ', noReviews: 'কোনো রিভিউ নেই', loadMore: 'আরও দেখুন' },
      ar: { reviews: 'التقييمات', noReviews: 'لا توجد تقييمات', loadMore: 'تحميل المزيد' },
      hi: { reviews: 'समीक्षाएं', noReviews: 'कोई समीक्षा नहीं', loadMore: 'और लोड करें' },
    };
    return texts[lang]?.[key] || texts.en[key];
  };

  // Load initial reviews
  useEffect(() => {
    loadReviews(true);
  }, [profileId]);

  // Infinite scroll setup
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadReviews(false);
        }
      },
      { threshold: 0.5 }
    );

    if (lastReviewRef.current) {
      observerRef.current.observe(lastReviewRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, reviews.length]);

  const loadReviews = async (reset: boolean = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    const currentPage = reset ? 1 : page;
    const from = (currentPage - 1) * REVIEWS_PER_PAGE;
    const to = from + REVIEWS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      if (reset) {
        setReviews(data);
        setPage(2);
      } else {
        setReviews(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      }
      setHasMore(data.length === REVIEWS_PER_PAGE);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Star size={32} className="mx-auto mb-2 opacity-30" />
        <p>{t('noReviews')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <div
          key={review.id}
          ref={index === reviews.length - 1 ? lastReviewRef : null}
          className="border-b pb-4 last:border-0"
        >
          <div className="flex items-center gap-3 mb-2">
            <img
              src={review.reviewer_photo || '/default-avatar.png'}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-800">{review.reviewer_name}</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-2">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm ml-12">{review.comment}</p>
        </div>
      ))}
      
      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      )}
      
      {!hasMore && reviews.length > REVIEWS_PER_PAGE && (
        <p className="text-center text-xs text-gray-400 pt-2">~ end of reviews ~</p>
      )}
    </div>
  );
}