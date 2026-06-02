// app/admin/page.tsx - ১ বিলিয়ন ইউজার • সুপারসনিক • ৪ ভাষা
"use client";
import React,{useState,useCallback,useMemo,startTransition} from 'react';
import {LayoutDashboard,Users,CreditCard,Image,Grid,MapPin,Star,Settings,LogOut,Menu,X,Shield,ChevronRight} from 'lucide-react';
import {useRouter} from 'next/navigation';

// ═══════════════════════════════════════════════════════════
// ৪ ভাষা ট্রান্সলেশন
// ═══════════════════════════════════════════════════════════
const T:Record<string,Record<string,string>>={
  en:{admin:'Noffor Admin',panel:'Management Panel',overview:'Overview',users:'Users',payments:'Payments',banners:'Banners',categories:'Categories',areas:'Areas',reviews:'Reviews',settings:'Settings',exit:'Exit',comingSoon:'management coming soon',mobileMenu:'Menu'},
  bn:{admin:'নফর অ্যাডমিন',panel:'ম্যানেজমেন্ট প্যানেল',overview:'ওভারভিউ',users:'ইউজার',payments:'পেমেন্ট',banners:'ব্যানার',categories:'ক্যাটাগরি',areas:'এরিয়া',reviews:'রিভিউ',settings:'সেটিংস',exit:'প্রস্থান',comingSoon:'ম্যানেজমেন্ট শীঘ্রই আসছে',mobileMenu:'মেনু'},
  ar:{admin:'نفر أدمن',panel:'لوحة الإدارة',overview:'نظرة عامة',users:'مستخدمين',payments:'مدفوعات',banners:'بانرات',categories:'فئات',areas:'مناطق',reviews:'تقييمات',settings:'إعدادات',exit:'خروج',comingSoon:'قريباً',mobileMenu:'قائمة'},
  hi:{admin:'नोफर एडमिन',panel:'प्रबंधन पैनल',overview:'अवलोकन',users:'उपयोगकर्ता',payments:'भुगतान',banners:'बैनर',categories:'श्रेणियां',areas:'क्षेत्र',reviews:'समीक्षा',settings:'सेटिंग्स',exit:'बाहर',comingSoon:'जल्द आ रहा',mobileMenu:'मेनू'},
};

// ═══════════════════════════════════════════════════════════
// Tab Button (Memoized)
// ═══════════════════════════════════════════════════════════
const TabButton=React.memo(({tab,isActive,onClick,tr}:{
  tab:{id:string;label:string;icon:any};isActive:boolean;onClick:()=>void;tr:Record<string,string>;
})=>{
  const Icon=tab.icon;
  return(
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all active:scale-[0.98] ${
      isActive?'bg-orange-600 text-white shadow-md':'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`} style={{transform:'translateZ(0)'}}>
      <Icon size={18}/><span className="truncate">{tr[tab.id as keyof typeof tr]||tab.label}</span>
      {isActive&&<ChevronRight size={14} className="ml-auto"/>}
    </button>
  );
});
TabButton.displayName='TabButton';

// ═══════════════════════════════════════════════════════════
// AdminDashboardPage
// ═══════════════════════════════════════════════════════════
export default function AdminDashboardPage(){
  const router=useRouter();
  const tr=useMemo(()=>T.en||T.en,[]); // Default English for admin
  const[tab,setTab]=useState('overview');
  const[showMobileMenu,setShowMobileMenu]=useState(false);

  const tabs=useMemo(()=>[
    {id:'overview',label:'Overview',icon:LayoutDashboard},
    {id:'users',label:'Users',icon:Users},
    {id:'payments',label:'Payments',icon:CreditCard},
    {id:'banners',label:'Banners',icon:Image},
    {id:'categories',label:'Categories',icon:Grid},
    {id:'areas',label:'Areas',icon:MapPin},
    {id:'reviews',label:'Reviews',icon:Star},
    {id:'settings',label:'Settings',icon:Settings},
  ],[]);

  const handleTabClick=useCallback((id:string)=>{startTransition(()=>{setTab(id);setShowMobileMenu(false)})},[]);
  const handleExit=useCallback(()=>{router.push('/')},[router]);

  return(
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 text-white p-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{tr.admin}</h1>
          <p className="text-xs text-gray-400">{tr.panel}</p>
        </div>
        <button onClick={()=>setShowMobileMenu(!showMobileMenu)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          {showMobileMenu?<X size={20}/>:<Menu size={20}/>}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu&&(
        <div className="lg:hidden bg-gray-900 border-t border-gray-800 animate-slide-up">
          {tabs.map(t=><TabButton key={t.id} tab={t} isActive={tab===t.id} onClick={()=>handleTabClick(t.id)} tr={tr}/>)}
          <button onClick={handleExit} className="w-full flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white text-sm border-t border-gray-800"><LogOut size={16}/>{tr.exit}</button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-gray-900 text-white min-h-screen flex-shrink-0">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold flex items-center gap-2"><Shield size={20} className="text-orange-500"/>{tr.admin}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{tr.panel}</p>
        </div>
        <div className="flex-1 py-2">
          {tabs.map(t=><TabButton key={t.id} tab={t} isActive={tab===t.id} onClick={()=>handleTabClick(t.id)} tr={tr}/>)}
        </div>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleExit} className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white text-sm transition-colors rounded-lg hover:bg-gray-800"><LogOut size={16}/>{tr.exit}</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 capitalize hidden lg:block">{tr[tab as keyof typeof tr]||tab}</h2>
        <div className="bg-white rounded-xl p-8 border shadow-sm text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings size={28} className="text-gray-400"/>
          </div>
          <p className="font-medium text-gray-600 capitalize">{tab}</p>
          <p className="text-sm mt-1">{tr.comingSoon}</p>
        </div>
      </div>
    </div>
  );
}