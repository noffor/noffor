// components/rating/RatingModal.tsx
"use client";
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, X, Send } from 'lucide-react';

interface Props {
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  lang: string;
  onClose: () => void;
  onRated: () => void;
}

export default function RatingModal({ bookingId, fromUserId, toUserId, lang, onClose, onRated }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const t = useCallback((key: string) => {
    const texts: any = {
      en: { rateExperience: 'Rate Your Experience', review: 'Write a review...', submit: 'Submit Rating', thanks: 'Thank you!' },
      bn: { rateExperience: 'আপনার অভিজ্ঞতা রেট করুন', review: 'রিভিউ লিখুন...', submit: 'রেটিং জমা দিন', thanks: 'ধন্যবাদ!' },
      ar: { rateExperience: 'قيم تجربتك', review: 'اكتب مراجعة...', submit: 'إرسال التقييم', thanks: 'شكراً!' },
      hi: { rateExperience: 'अपना अनुभव रेट करें', review: 'समीक्षा लिखें...', submit: 'रेटिंग जमा करें', thanks: 'धन्यवाद!' },
    };
    return texts[lang]?.[key] || texts.en[key] || key;
  }, [lang]);

  const submitRating = async () => {
    if (rating === 0) return;
    setSubmitting(true);

    const { error } = await supabase.from('booking_ratings').insert({
      booking_id: bookingId,
      rating,
      review: review.trim(),
      from_user_id: fromUserId,
      to_user_id: toUserId
    });

    if (!error) {
      onRated();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">{t('rateExperience')}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-125"
            >
              <Star
                size={36}
                className={`transition-colors ${
                  (hoverRating || rating) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={e => setReview(e.target.value)}
          placeholder={t('review')}
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none"
        />

        <button
          onClick={submitRating}
          disabled={rating === 0 || submitting}
          className="w-full py-3 bg-yellow-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} /> {submitting ? '...' : t('submit')}
        </button>
      </div>
    </div>
  );
}