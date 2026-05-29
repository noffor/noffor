"use client";
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, Plus, Map, DollarSign } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';
import { memo } from 'react';

// 🚀 সুপারসনিক অপটিমাইজেশন: অহেতুক রি-রেন্ডার ও মেমোরি লিক বন্ধ করতে বাটনগুলোকে মেমোইজড (Memoized) করা হলো
const NavButton = memo(({ onClick, isActive, icon: Icon, label, activeColor = 'text-orange-600' }: {
  onClick: () => void;
  isActive: boolean;
  icon: any;
  label: string;
  activeColor?: string;
}) => (
  <button 
    onClick={onClick} 
    className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[44px] h-full transition-transform active:scale-95 will-change-transform"
  >
    <Icon size={20} className={isActive ? activeColor : 'text-gray-400'} />
    <span className={`text-[10px] tracking-tight ${isActive ? `${activeColor} font-bold` : 'text-gray-500 font-normal'}`}>
      {label}
    </span>
  </button>
));
NavButton.displayName = 'NavButton';

export default function MobileNav({ country, lang }: { country: string; lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe transform-gpu will-change-transform">
      {/* 🎯 কন্টেইনার পজিশনিং একদম ছবির মতো ফিক্সড */}
      <div className="flex items-center justify-around h-[56px] relative px-2">
        
        <NavButton onClick={() => router.push(`${rest}`)} isActive={pathname === `${rest}`} icon={Home} label={t('home')} />
        
        <NavButton onClick={() => router.push(`${rest}/search`)} isActive={pathname.includes('search')} icon={Search} label={t('navSearch')} />

        {/* 🎯 মাঝখানের প্লাস (+) বাটন: ছবির মতো পারফেক্টলি নিচে নামিয়ে অ্যাডজাস্ট করা */}
        <div className="relative flex items-center justify-center w-[60px] h-full">
          <button 
            onClick={() => router.push(`${rest}/create`)} 
            className="absolute bottom-[6px] bg-orange-600 text-white rounded-[18px] border-[4px] border-white w-[52px] h-[52px] flex items-center justify-center shadow-[0_6px_12px_rgba(0,0,0,0.12)] transition-all active:scale-90 transform-gpu will-change-transform z-50"
            aria-label={t('create')}
          >
            <Plus size={28} strokeWidth={3} className="text-white" />
          </button>
        </div>

        <NavButton onClick={() => router.push(`${rest}/bid`)} isActive={pathname.includes('bid')} icon={DollarSign} label="BID" activeColor="text-green-600" />
        
        <NavButton onClick={() => router.push(`${rest}/map`)} isActive={pathname.includes('map')} icon={Map} label={t('map')} />

      </div>
    </div>
  );
}