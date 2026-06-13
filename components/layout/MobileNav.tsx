"use client";
import { useRouter, usePathname } from 'next/navigation';
import { Home, Plus, Map, DollarSign, User } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';
import { memo, useCallback } from 'react';

const NavButton = memo(({ onClick, isActive, icon: Icon, label, activeColor = 'text-orange-600' }: {
  onClick: () => void; isActive: boolean; icon: any; label: string; activeColor?: string;
}) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-0.5 px-2 py-0.5 min-w-[44px] h-full transition-transform active:scale-95 will-change-transform">
    <Icon size={20} className={isActive ? activeColor : 'text-gray-400'} />
    <span className={`text-[10px] tracking-tight ${isActive ? `${activeColor} font-bold` : 'text-gray-500 font-normal'}`}>{label}</span>
  </button>
));
NavButton.displayName = 'NavButton';

export default function MobileNav({ country, lang }: { country: string; lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const t = (key: string) => getText(lang as LangCode, key);
  const rest = `/${country}/${lang}`;

  // ✅ Prefetch all routes on hover
  const goHome = useCallback(() => router.push(`${rest}`), [rest, router]);
  const goBid = useCallback(() => router.push(`${rest}/bid`), [rest, router]);
  const goCreate = useCallback(() => router.push(`${rest}/create`), [rest, router]);
  const goMap = useCallback(() => router.push(`${rest}/map`), [rest, router]);
  const goDashboard = useCallback(() => router.push(`${rest}/dashboard`), [rest, router]);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex items-center justify-around h-[50px] relative px-2">
        
        <NavButton onClick={goHome} isActive={pathname === `${rest}`} icon={Home} label={t('home')} />
        
        <NavButton onClick={goBid} isActive={pathname.includes('bid')} icon={DollarSign} label={t('bid')} activeColor="text-green-600" />

        <div className="relative flex items-center justify-center w-[56px] h-full">
          <button onClick={goCreate} className="absolute bottom-[4px] bg-orange-600 text-white rounded-[16px] border-[3px] border-white w-[46px] h-[46px] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-all active:scale-90">
            <Plus size={24} strokeWidth={3} className="text-white" />
          </button>
        </div>
        
        <NavButton onClick={goMap} isActive={pathname.includes('map')} icon={Map} label={t('map')} />
        
        <NavButton onClick={goDashboard} isActive={pathname.includes('dashboard')} icon={User} label={t('dashboard')} activeColor="text-blue-600" />

      </div>
    </div>
  );
}