"use client";
import { useRouter } from 'next/navigation';
import { getText, LangCode } from '@/lib/language';

export default function CategoryFilters({ country, lang, slug, active }: { country: string; lang: string; slug: string; active: string }) {
  const router = useRouter();
  
  const filterLabels: Record<string, Record<string, string>> = {
    all: { en: 'All', ar: 'الكل', bn: 'সব', hi: 'सब' },
    new: { en: 'New', ar: 'جديد', bn: 'নতুন', hi: 'नया' },
    experienced: { en: 'Experienced', ar: 'خبير', bn: 'অভিজ্ঞ', hi: 'अनुभवी' },
    featured: { en: 'Featured', ar: 'مميز', bn: 'ফিচার্ড', hi: 'फीचर्ड' },
  };

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      {Object.keys(filterLabels).map(key => (
        <button key={key} onClick={() => router.push(`/${country}/${lang}/category/${slug}?filter=${key}`)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${active === key ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
          {filterLabels[key]?.[lang] || filterLabels[key]?.en}
        </button>
      ))}
    </div>
  );
}