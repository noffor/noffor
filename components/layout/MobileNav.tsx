"use client";
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, Plus, Map, DollarSign, User } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';
import { memo } from 'react';

const NavButton = memo(({ onClick, isActive, icon: Icon, label, activeColor = 'text-orange-600' }: {
  onClick: () => void;
  isActive: boolean;
  icon: any;
  label: string;
  activeColor?: string;
}) => (
  <button 
    onClick={onClick} 
    className="flex flex-col items-center justify-center gap-0.5 px-0.5 py-1 min-w-[40px] h-full transition-transform active:scale-95 will-change-transform"
  >
    <Icon size={18} className={isActive ? activeColor : 'text-gray-400'} />
    <span className={`text-[9px] tracking-tight leading-tight ${isActive ? `${activeColor} font-bold` : 'text-gray-500 font-normal'}`}>
      {label}
    </span>
  </button>
));
NavButton.displayName = 'NavButton';

export default function MobileNav({ country, lang }: { country: string; lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const rest = `/${country}/${lang}`;

  const t = (key: string) => {
    const texts: Record<string, string> = {
      home: getText(lang as LangCode, 'home'),
      navSearch: getText(lang as LangCode, 'navSearch'),
      bid: getText(lang as LangCode, 'bid') || 
        (lang === 'bn' ? 'বিড' : lang === 'ar' ? 'مزايدة' : lang === 'hi' ? 'बिड' : 'Bid'),
      map: getText(lang as LangCode, 'map'),
      dashboard: getText(lang as LangCode, 'dashboard') || 
        (lang === 'bn' ? 'ড্যাশ' : lang === 'ar' ? 'لوحة' : lang === 'hi' ? 'डैश' : 'Dash'),
      create: getText(lang as LangCode, 'create'),
    };
    return texts[key] || key;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe transform-gpu will-change-transform">
      {/* 🎯 h-[52px] এবং justify-around ঠিক রাখা হলো */}
      <div className="flex items-center justify-around h-[52px] relative px-0.5">
        
        <NavButton onClick={() => router.push(`${rest}`)} isActive={pathname === `${rest}`} icon={Home} label={t('home')} />
        
        <NavButton onClick={() => router.push(`${rest}/search`)} isActive={pathname.includes('search')} icon={Search} label={t('navSearch')} />

        {/* 🎯 প্লাস (+) বাটন মিডিল ফিক্স: সাইজ ৪২px-ই থাকবে, কিন্তু flex-শ্রিঙ্ক বন্ধ করে পারফেক্ট গোল করা হলো */}
        <div className="flex items-center justify-center min-w-[44px] h-full">
          <button 
            onClick={() => router.push(`${rest}/create`)} 
            className="bg-orange-600 text-white rounded-[14px] border-[3px] border-white w-[42px] h-[42px] flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.15)] transition-all active:scale-90 transform-gpu will-change-transform z-50 shrink-0"
            aria-label={t('create')}
            style={{ boxSizing: 'border-box' }}
          >
            <Plus size={22} strokeWidth={3} className="text-white" />
          </button>
        </div>

        <NavButton onClick={() => router.push(`${rest}/bid`)} isActive={pathname.includes('bid')} icon={DollarSign} label={t('bid')} activeColor="text-green-600" />
        
        <NavButton onClick={() => router.push(`${rest}/map`)} isActive={pathname.includes('map')} icon={Map} label={t('map')} />
        
        <NavButton onClick={() => router.push(`${rest}/dashboard`)} isActive={pathname.includes('dashboard')} icon={User} label={t('dashboard')} activeColor="text-blue-600" />

      </div>
    </div>
  );
}