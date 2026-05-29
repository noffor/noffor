"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { BarChart3, Edit, Eye, CreditCard, Heart, Bell, Settings, Info, Send, Star, ToggleLeft, ToggleRight, Phone, Briefcase, Lock, Globe, Shield, Mail, MapPin, History, User, Trash2, LogOut } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function DashboardPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en'; const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview'); const [online, setOnline] = useState(true);
  const t = (key: string) => getText(lang as LangCode, key);
  
  const p = { name: 'Mohammed Rahim', category: 'Driver', rating: 4.5, reviews: 234, views: 1250, contacts: 45, offers: 12, salary: '2500 QAR', exp: '5 years', city: 'Doha', area: 'Industrial Area', visa: 'Transferable', photo: '/default-avatar.png' };

  const tabLabels: Record<string, Record<string, string>> = {
    overview: { en: 'Overview', ar: 'نظرة عامة', bn: 'ওভারভিউ', hi: 'अवलोकन' },
    edit: { en: 'Edit', ar: 'تعديل', bn: 'এডিট', hi: 'संपादन' },
    stats: { en: 'Stats', ar: 'إحصائيات', bn: 'স্ট্যাটস', hi: 'आंकड़े' },
    payments: { en: 'Payments', ar: 'مدفوعات', bn: 'পেমেন্ট', hi: 'भुगतान' },
    saved: { en: 'Saved', ar: 'محفوظ', bn: 'সেভ', hi: 'सहेजा' },
    alerts: { en: 'Alerts', ar: 'تنبيهات', bn: 'এলার্ট', hi: 'अलर्ट' },
    settings: { en: 'Settings', ar: 'إعدادات', bn: 'সেটিংস', hi: 'सेटिंग्स' },
    about: { en: 'About', ar: 'حول', bn: 'সম্পর্কে', hi: 'बारे में' },
    contact: { en: 'Contact', ar: 'اتصال', bn: 'যোগাযোগ', hi: 'संपर्क' },
  };

  const tabs = [
    { id: 'overview', icon: BarChart3 }, { id: 'edit', icon: Edit },
    { id: 'stats', icon: Eye }, { id: 'payments', icon: CreditCard },
    { id: 'saved', icon: Heart }, { id: 'alerts', icon: Bell },
    { id: 'settings', icon: Settings }, { id: 'about', icon: Info },
    { id: 'contact', icon: Send },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-4xl mx-auto px-3 py-3">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border p-4 text-center mb-3">
          <img src={p.photo} className="w-20 h-20 rounded-full mx-auto object-cover" />
          <h2 className="font-bold text-lg mt-2">{p.name}</h2>
          <p className="text-sm text-gray-500">{p.category}</p>
          <div className="flex items-center justify-center gap-1 mt-1"><Star size={14} className="text-yellow-500" fill="#EAB308" /><span className="text-sm font-medium">{p.rating}</span></div>
          <button onClick={() => setOnline(!online)} className="mt-2 flex items-center justify-center gap-2 text-sm mx-auto">
            {online ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} className="text-gray-400" />}
            <span className={online ? 'text-green-600' : 'text-gray-500'}>{online ? t('online') : t('offline')}</span>
          </button>
        </div>

        {/* Tabs - ৪-লাইন গ্রিড */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {tabs.map(tabItem => (
            <button
              key={tabItem.id}
              onClick={() => setActiveTab(tabItem.id)}
              className={`rounded-xl p-3 text-center cursor-pointer hover:shadow-md border active:scale-95 transition-all ${
                activeTab === tabItem.id 
                  ? 'bg-orange-600 text-white border-orange-600' 
                  : 'bg-white text-gray-600 border-gray-100 hover:bg-orange-50'
              }`}
            >
              <tabItem.icon size={22} className="mx-auto mb-1" />
              <p className="text-[10px] font-medium truncate">{tabLabels[tabItem.id]?.[lang] || tabItem.id}</p>
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-2">
            {[{ icon: Eye, label: t('views'), val: p.views },{ icon: Phone, label: t('contacts'), val: p.contacts },{ icon: Briefcase, label: t('offers'), val: p.offers }].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-3 text-center border"><s.icon size={20} className="text-orange-500 mx-auto mb-1" /><p className="text-xl font-bold">{s.val}</p><p className="text-[10px] text-gray-400">{s.label}</p></div>
            ))}
          </div>
        )}

        {/* Edit */}
        {activeTab === 'edit' && (
          <div className="bg-white rounded-xl p-4 border space-y-3">
            <h3 className="font-bold text-sm">{tabLabels.edit?.[lang] || 'Edit'}</h3>
            {['Name','Category','Salary','Experience','City','Area'].map(f => (
              <input key={f} placeholder={f} className="w-full px-3 py-2 border rounded-lg text-sm" />
            ))}
            <button className="w-full py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">Save</button>
          </div>
        )}

        {/* Stats */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-xl p-4 border space-y-3">
            <h3 className="font-bold text-sm">{tabLabels.stats?.[lang] || 'Stats'}</h3>
            {[{ label: 'Views', val: p.views },{ label: 'Contacts', val: p.contacts },{ label: 'Offers', val: p.offers },{ label: 'Rating', val: p.rating },{ label: 'Reviews', val: p.reviews }].map((s, i) => (
              <div key={i} className="flex justify-between py-2 border-b last:border-0"><span className="text-sm text-gray-500">{s.label}</span><span className="font-bold">{s.val}</span></div>
            ))}
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl p-4 border">
            <h3 className="font-bold text-sm mb-3">{tabLabels.payments?.[lang] || 'Payments'}</h3>
            {[{ id:1, amount:2, status:'Done', date:'2026-05-24' },{ id:2, amount:2, status:'Done', date:'2026-05-20' }].map(px => (
              <div key={px.id} className="flex justify-between p-2 bg-gray-50 rounded-lg mb-2"><span className="text-sm">{px.amount} QAR • {px.date}</span><span className="text-xs text-green-600">{px.status}</span></div>
            ))}
            <button className="w-full mt-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">Buy Featured - 2 QAR</button>
          </div>
        )}

        {/* Saved */}
        {activeTab === 'saved' && (
          <div className="bg-white rounded-xl p-4 border text-center py-8">
            <Heart size={40} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">{t('noResults')}</p>
          </div>
        )}

        {/* Alerts */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-xl p-4 border space-y-2">
            <h3 className="font-bold text-sm mb-3">{tabLabels.alerts?.[lang] || 'Alerts'}</h3>
            {[{ text: 'Profile viewed 5 times today', time: '2h ago' },{ text: 'New review from Ahmed', time: '1d ago' }].map((n, i) => (
              <div key={i} className="p-2 bg-gray-50 rounded-lg"><p className="text-sm text-gray-700">{n.text}</p><p className="text-xs text-gray-400">{n.time}</p></div>
            ))}
          </div>
        )}

        {/* Settings - ৪-লাইন গ্রিড */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl p-4 border">
            <h3 className="font-bold text-sm mb-3">{tabLabels.settings?.[lang] || 'Settings'}</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Lock, label: lang === 'bn' ? 'পাসওয়ার্ড' : 'Password', color: 'bg-yellow-50 text-yellow-600', action: () => alert('Password') },
                { icon: Bell, label: lang === 'bn' ? 'এলার্ট' : 'Alerts', color: 'bg-blue-50 text-blue-600', toggle: true },
                { icon: Globe, label: lang === 'bn' ? 'ভাষা' : 'Language', color: 'bg-green-50 text-green-600', val: lang?.toUpperCase() },
                { icon: Shield, label: lang === 'bn' ? 'প্রাইভেসি' : 'Privacy', color: 'bg-purple-50 text-purple-600' },
                { icon: Eye, label: lang === 'bn' ? 'দৃশ্যমান' : 'Visible', color: 'bg-orange-50 text-orange-600', toggle: online },
                { icon: Mail, label: lang === 'bn' ? 'ইমেইল' : 'Email', color: 'bg-pink-50 text-pink-600', val: 'OK' },
                { icon: Phone, label: lang === 'bn' ? 'ফোন' : 'Phone', color: 'bg-indigo-50 text-indigo-600', val: 'OK' },
                { icon: MapPin, label: lang === 'bn' ? 'লোকেশন' : 'Location', color: 'bg-teal-50 text-teal-600', toggle: true },
                { icon: CreditCard, label: lang === 'bn' ? 'বিলিং' : 'Billing', color: 'bg-cyan-50 text-cyan-600', action: () => setActiveTab('payments') },
                { icon: History, label: lang === 'bn' ? 'অ্যাক্টিভিটি' : 'Activity', color: 'bg-gray-100 text-gray-600' },
                { icon: User, label: lang === 'bn' ? 'প্রোফাইল' : 'Profile', color: 'bg-lime-50 text-lime-600', action: () => setActiveTab('edit') },
                { icon: Trash2, label: lang === 'bn' ? 'ডিলিট' : 'Delete', color: 'bg-red-50 text-red-600', action: () => alert('Delete?') },
                { icon: LogOut, label: lang === 'bn' ? 'লগআউট' : 'Logout', color: 'bg-gray-200 text-gray-700', action: () => router.push(`/${country}/${lang}`) },
                { icon: Info, label: lang === 'bn' ? 'সম্পর্কে' : 'About', color: 'bg-rose-50 text-rose-600', action: () => setActiveTab('about') },
                { icon: Send, label: lang === 'bn' ? 'যোগাযোগ' : 'Contact', color: 'bg-amber-50 text-amber-600', action: () => setActiveTab('contact') },
              ].map((item, i) => (
                <div key={i} onClick={item.action} className={`${item.color} rounded-xl p-2 text-center cursor-pointer hover:shadow-md border active:scale-95 transition-all`}>
                  <item.icon size={18} className="mx-auto mb-1" />
                  <p className="text-[9px] font-medium truncate">{item.label}</p>
                  {item.toggle !== undefined && (
                    <div className={`mt-1 mx-auto w-6 h-3 rounded-full relative ${item.toggle ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 w-2 h-2 bg-white rounded-full ${item.toggle ? 'left-3.5' : 'left-0.5'}`} />
                    </div>
                  )}
                  {item.val && <p className="text-[8px] font-medium mt-0.5 opacity-70">{item.val}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-xl p-4 border">
            <h3 className="font-bold text-sm mb-2">{tabLabels.about?.[lang] || 'About'}</h3>
            <p className="text-sm text-gray-600">Noffor is Qatar's #1 labor platform connecting workers with employers.</p>
            <p className="text-sm text-gray-500 mt-2">Version: 1.0.0</p>
          </div>
        )}

        {/* Contact */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-xl p-4 border space-y-3">
            <h3 className="font-bold text-sm">{tabLabels.contact?.[lang] || 'Contact'}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2"><Phone size={14} /> +974 1234 5678</p>
              <p className="flex items-center gap-2"><Mail size={14} /> support@noffor.com</p>
              <p className="flex items-center gap-2"><MapPin size={14} /> Doha, Qatar</p>
            </div>
            <textarea placeholder="Message..." rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
            <button className="w-full py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">Send</button>
          </div>
        )}
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}