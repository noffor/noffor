// components/layout/Sidebar.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা • ১২ মেইন + More
import React, { useMemo } from 'react';
import Link from 'next/link';
import { categories } from '@/lib/config';
import { getText, LangCode } from '@/lib/language';
import { Grid3X3, ArrowRight, ChevronRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// WebP ইমেজ অপ্টিমাইজার
// ═══════════════════════════════════════════════════════════
const getWebP = (url: string): string => {
  if (!url) return '';
  if (url.includes('supabase.co/storage')) return `${url}?width=40&quality=80&format=webp`;
  return url;
};

// ═══════════════════════════════════════════════════════════
// Helper: Get category name by language from config
// ═══════════════════════════════════════════════════════════
const getCatName = (cat: any, lang: string): string => {
  const key = `name${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
  return (cat as any)[key] || cat.nameEn || cat.name || cat.slug;
};

// ═══════════════════════════════════════════════════════════
// Category Item (Memoized)
// ═══════════════════════════════════════════════════════════
const CategoryItem = React.memo(({ cat, lang, rest }: { cat: any; lang: string; rest: string }) => {
  const displayName = useMemo(() => getCatName(cat, lang), [cat, lang]);
  const iconSrc = useMemo(() => getWebP(cat.icon || `/categories/${cat.slug}.png`), [cat.icon, cat.slug]);

  return (
    <Link
      href={`${rest}/category/${cat.slug}`}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 no-underline transition-all active:scale-[0.98] group"
      style={{ transform: 'translateZ(0)' }}
    >
      <img
        src={iconSrc}
        alt={displayName}
        className="w-5 h-5 object-contain flex-shrink-0 group-hover:scale-110 transition-transform rounded"
        loading="lazy"
        decoding="async"
        onError={(e) => { (e.target as HTMLImageElement).src = '/categories/default.png'; }}
      />
      <span className="truncate text-xs lg:text-sm">{displayName}</span>
    </Link>
  );
});
CategoryItem.displayName = 'CategoryItem';

// ═══════════════════════════════════════════════════════════
// Sidebar (Memoized) — ✅ ১২ মেইন ক্যাটাগরি + More বাটন
// ═══════════════════════════════════════════════════════════
const Sidebar = React.memo(({ country, lang, onMoreClick }: { 
  country: string; 
  lang: string; 
  onMoreClick?: () => void;  // ✅ Callback for "More" button
}) => {
  const t = useMemo(() => (key: string) => getText(lang as LangCode, key), [lang]);
  const rest = useMemo(() => `/${country}/${lang}`, [country, lang]);
  
  // ⭐ শুধু মেইন ১২ ক্যাটাগরি (isMain: true)
  const mainCats = useMemo(() => categories.filter(c => (c as any).isMain === true), []);
  
  // ⭐ বাকি ৩০ ক্যাটাগরির কাউন্ট
  const otherCount = useMemo(() => categories.filter(c => (c as any).isMain !== true).length, []);

  // ⭐ "More" লেবেল ৪ ভাষায়
  const moreLabel = useMemo(() => {
    switch (lang) {
      case 'bn': return `আরও ${otherCount}+`;
      case 'ar': return `المزيد ${otherCount}+`;
      case 'hi': return `और ${otherCount}+`;
      default: return `More ${otherCount}+`;
    }
  }, [lang, otherCount]);

  return (
    <div
      className="bg-white rounded-xl border shadow-sm overflow-hidden sticky top-20"
      style={{ contain: 'layout style paint', transform: 'translateZ(0)' }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b bg-gradient-to-r from-orange-50 to-white flex items-center gap-2">
        <Grid3X3 size={16} className="text-orange-500" />
        <h3 className="text-sm font-bold text-gray-700">{t('categories')}</h3>
        <span className="text-xs text-gray-400 ml-auto">{categories.length}</span>
      </div>

      {/* ✅ ১২ মেইন ক্যাটাগরি */}
      <div className="py-1">
        {mainCats.map(cat => (
          <CategoryItem key={cat.slug} cat={cat} lang={lang} rest={rest} />
        ))}
      </div>

      {/* ✅ Divider + More Button */}
      <div className="border-t border-gray-100">
        {onMoreClick ? (
          // PC: More বাটন ক্লিক করলে AllCategoriesPage ওপেন হবে
          <button
            onClick={onMoreClick}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-all active:scale-[0.98] group"
          >
            <span>{moreLabel}</span>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          // Fallback: সরাসরি /categories পেজে লিংক
          <Link
            href={`${rest}/categories`}
            className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 no-underline transition-all active:scale-[0.98] group"
          >
            <span>{moreLabel}</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;