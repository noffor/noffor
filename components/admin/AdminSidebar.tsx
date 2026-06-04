// components/admin/AdminSidebar.tsx - আপনার ডিজাইন • ১ বিলিয়ন ইউজার • ফুল ফিচার
"use client";
import React,{useState,useMemo} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {
  LayoutDashboard,Users,MapPin,CreditCard,BarChart3,
  Settings,Bell,Shield,Gavel,Activity,ChevronLeft,
  ChevronRight,Globe,Zap,LogOut,Menu,ShoppingCart,FileText
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// AdminSidebar (Memoized • 1B Ready)
// ═══════════════════════════════════════════════════════════
interface Props {
  onLogout?: () => void;
  country?: string;
  lang?: string;
}

export default function AdminSidebar({onLogout, country = 'qa', lang = 'en'}: Props){
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // ✅ FIXED: Dynamic menu items with country and lang
  const MENU_ITEMS = useMemo(() => [
    {icon:LayoutDashboard,label:'Dashboard',href:`/${country}/${lang}/admin/dashboard`,color:'text-blue-400'},
    {icon:Users,label:'Users',href:`/${country}/${lang}/admin/dashboard/users`,color:'text-green-400'},
    {icon:MapPin,label:'Live Map',href:`/${country}/${lang}/admin/dashboard/map`,color:'text-red-400'},
    {icon:FileText,label:'Bids',href:`/${country}/${lang}/admin/dashboard/bids`,color:'text-yellow-400'},
    {icon:ShoppingCart,label:'Bookings',href:`/${country}/${lang}/admin/dashboard/bookings`,color:'text-pink-400'},
    {icon:CreditCard,label:'Payments',href:`/${country}/${lang}/admin/dashboard/payments`,color:'text-purple-400'},
    {icon:BarChart3,label:'Analytics',href:`/${country}/${lang}/admin/dashboard/analytics`,color:'text-cyan-400'},
    {icon:Bell,label:'Notifications',href:`/${country}/${lang}/admin/dashboard/notifications`,color:'text-orange-400'},
    {icon:Shield,label:'Security',href:`/${country}/${lang}/admin/dashboard/security`,color:'text-rose-400'},
    {icon:Activity,label:'Activity Log',href:`/${country}/${lang}/admin/dashboard/activity`,color:'text-emerald-400'},
    {icon:Settings,label:'Settings',href:`/${country}/${lang}/admin/dashboard/settings`,color:'text-gray-400'},
  ], [country, lang]);

  const isActive = useMemo(() => (href: string) => pathname === href, [pathname]);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 text-white p-2 rounded-lg shadow-lg" 
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu size={20}/>
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setCollapsed(true)}/>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-gray-950 border-r border-gray-800 z-40 transition-all duration-300 ${
        collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-800">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-white"/>
          </div>
          {!collapsed && <span className="font-bold text-white text-lg truncate">Admin Panel</span>}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="hidden lg:block ml-auto text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
          </button>
        </div>

        {/* Menu */}
        <nav className="p-2 space-y-1 mt-2 overflow-y-auto" style={{height:'calc(100% - 130px)'}}>
          {MENU_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-gray-800 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
                style={{transform:'translateZ(0)'}}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} className={`${item.color} flex-shrink-0`}/>
                {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500"/>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button 
            onClick={onLogout || (() => window.location.href = `/${country}/${lang}`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
          >
            <LogOut size={20}/>
            {!collapsed && <span className="text-sm">Exit Admin</span>}
          </button>
        </div>
      </aside>
    </>
  );
}