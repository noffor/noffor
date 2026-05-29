"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { BarChart3, Briefcase, Plus, Heart, Search, Bell, Settings, Eye } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function EmployerDashboardPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en'; const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const t = (key: string) => getText(lang as LangCode, key);
  
  const company = { name: 'Al Jaber Co.', type: 'Construction', city: 'Doha', logo: '/default-avatar.png', activeJobs: 3, totalHired: 45, views: 890 };
  
  const tabLabels: Record<string, Record<string, string>> = {
    overview: { en: 'Overview', ar: 'نظرة عامة', bn: 'ওভারভিউ', hi: 'अवलोकन' },
    jobs: { en: 'Jobs', ar: 'وظائف', bn: 'জব', hi: 'नौकरियां' },
    post: { en: 'Post Job', ar: 'نشر وظيفة', bn: 'জব পোস্ট', hi: 'जॉब पोस्ट' },
    saved: { en: 'Saved', ar: 'محفوظ', bn: 'সেভ', hi: 'सहेजा' },
    search: { en: 'Find', ar: 'بحث', bn: 'খুঁজুন', hi: 'खोज' },
    alerts: { en: 'Alerts', ar: 'تنبيهات', bn: 'এলার্ট', hi: 'अलर्ट' },
    settings: { en: 'Settings', ar: 'إعدادات', bn: 'সেটিংস', hi: 'सेटिंग्स' },
  };

  const tabs = [
    { id: 'overview', icon: BarChart3 }, { id: 'jobs', icon: Briefcase },
    { id: 'post', icon: Plus }, { id: 'saved', icon: Heart },
    { id: 'search', icon: Search }, { id: 'alerts', icon: Bell },
    { id: 'settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-4xl mx-auto px-3 py-3">
        <div className="bg-white rounded-xl border p-4 text-center mb-3">
          <img src={company.logo} className="w-20 h-20 rounded-full mx-auto object-cover" />
          <h2 className="font-bold text-lg mt-2">{company.name}</h2>
          <p className="text-sm text-gray-500">{company.type} • {company.city}</p>
        </div>
        <div className="flex gap-1 mb-3 overflow-x-auto">
          {tabs.map(tabItem => (
            <button key={tabItem.id} onClick={() => setActiveTab(tabItem.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeTab === tabItem.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <tabItem.icon size={14} /> {tabLabels[tabItem.id]?.[lang] || tabItem.id}
            </button>
          ))}
        </div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-2">
            {[{ icon: Briefcase, label: tabLabels.jobs?.[lang] || 'Jobs', val: company.activeJobs },{ icon: Plus, label: t('hired'), val: company.totalHired },{ icon: Eye, label: t('views'), val: company.views }].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-3 text-center border"><s.icon size={20} className="text-blue-500 mx-auto mb-1" /><p className="text-xl font-bold">{s.val}</p><p className="text-[10px] text-gray-400">{s.label}</p></div>
            ))}
          </div>
        )}
        {activeTab !== 'overview' && <div className="bg-white rounded-xl p-4 border text-center"><p className="text-gray-500">Coming soon</p></div>}
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}