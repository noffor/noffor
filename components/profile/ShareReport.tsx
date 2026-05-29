"use client";
import { Share2, Flag, Heart } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function ShareReport({ name, lang = 'en' }: { name: string; lang?: string }) {
  const t = (key: string) => getText(lang as LangCode, key);
  
  const share = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      // Mobile share API
      await navigator.share({ title: name, url });
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied!');
      } catch {
        // Final fallback
        prompt('Copy this link:', url);
      }
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={share} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
        <Share2 size={14} /> {t('share') || 'Share'}
      </button>
      <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
        <Flag size={14} /> {t('report') || 'Report'}
      </button>
      <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
        <Heart size={14} /> {t('save') || 'Save'}
      </button>
    </div>
  );
}