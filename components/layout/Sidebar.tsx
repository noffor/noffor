// components/layout/Sidebar.tsx
"use client";
import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { categories } from '@/lib/config';

interface SidebarProps {
  country: string;
  lang: string;
  onMoreClick?: () => void;
}

const getCatName = (cat: any, lang: string): string => {
  if (lang === 'en') return cat.nameEn || cat.name || '';
  const key = 'name' + lang.charAt(0).toUpperCase() + lang.slice(1);
  return (cat as any)[key] || cat.nameEn || cat.name || '';
};

const mainCategoriesCache = categories.filter(c => (c as any).isMain === true);

// 📌 বাম সাইডবার — ক্যাটাগরি লিস্ট
export const LeftSidebar = React.memo(({ country, lang }: Omit<SidebarProps, 'onMoreClick'>) => {
  const cats = useMemo(() => mainCategoriesCache.slice(0, 8), []); // প্রথম ৮টা

  return (
    <div className="w-56 shrink-0">
      <div className="bg-white rounded-xl border p-3 sticky top-20">
        <h3 className="text-sm font-bold text-gray-800 mb-3">
          {lang === 'bn' ? 'ক্যাটাগরি' : lang === 'ar' ? 'الفئات' : 'Categories'}
        </h3>
        <div className="space-y-1">
          {cats.map(cat => (
            <Link
              key={cat.slug}
              href={`/${country}/${lang}/category/${cat.slug}`}
              prefetch={false}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all group"
            >
              <div className="w-6 h-6 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={cat.icon || `/categories/${cat.slug}.png`}
                  alt={getCatName(cat, lang)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/categories/default.png'; }}
                />
              </div>
              <span className="truncate">{getCatName(cat, lang)}</span>
              <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('openAllCategories'))}
          className="w-full mt-2 text-xs text-orange-600 font-medium hover:text-orange-700 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-orange-50 transition"
        >
          {lang === 'bn' ? 'আরও দেখুন' : 'View All'} <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
});
LeftSidebar.displayName = 'LSB';

// 📌 ডান সাইডবার — স্ট্যাট/ইনফো (বর্তমানে খালি, পরে ইউজ করা যাবে)
export const RightSidebar = React.memo(({ country, lang }: Omit<SidebarProps, 'onMoreClick'>) => {
  return (
    <div className="w-64 shrink-0 hidden xl:block">
      <div className="bg-white rounded-xl border p-3 sticky top-20">
        <h3 className="text-sm font-bold text-gray-800 mb-3">
          {lang === 'bn' ? 'তথ্য' : 'Info'}
        </h3>
        <p className="text-xs text-gray-400">
          {lang === 'bn' ? 'শীঘ্রই আসছে...' : 'Coming soon...'}
        </p>
      </div>
    </div>
  );
});
RightSidebar.displayName = 'RSB';

// পুরনো Sidebar (যদি অন্য কোথাও ইউজ হয়)
const Sidebar = React.memo(({ country, lang, onMoreClick }: SidebarProps) => {
  const cats = useMemo(() => mainCategoriesCache, []);

  return (
    <div className="w-56 shrink-0">
      <div className="bg-white rounded-xl border p-3 sticky top-20">
        <h3 className="text-sm font-bold text-gray-800 mb-3">
          {lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
        </h3>
        <div className="space-y-1">
          {cats.map(cat => (
            <Link
              key={cat.slug}
              href={`/${country}/${lang}/category/${cat.slug}`}
              prefetch={false}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all"
            >
              <div className="w-6 h-6 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={cat.icon || `/categories/${cat.slug}.png`}
                  alt={getCatName(cat, lang)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/categories/default.png'; }}
                />
              </div>
              <span className="truncate">{getCatName(cat, lang)}</span>
            </Link>
          ))}
        </div>
        {onMoreClick && (
          <button
            onClick={onMoreClick}
            className="w-full mt-2 text-xs text-orange-600 font-medium hover:text-orange-700 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-orange-50 transition"
          >
            {lang === 'bn' ? 'আরও দেখুন' : 'View All'} <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
});
Sidebar.displayName = 'Sidebar';

export default Sidebar;