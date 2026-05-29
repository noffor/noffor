"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Lock, Bell, Globe, Shield, Eye, Mail, Phone, MapPin, CreditCard, History, User, Info, Send, Trash2, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en';
  const [notif, setNotif] = useState(true);

  const items = [
    { icon: Lock, label: 'Password', color: 'bg-yellow-50 text-yellow-600', action: () => alert('Change Password') },
    { icon: Bell, label: 'Alerts', color: 'bg-blue-50 text-blue-600', toggle: notif, tAction: () => setNotif(!notif) },
    { icon: Globe, label: 'Language', color: 'bg-green-50 text-green-600', val: 'EN' },
    { icon: Shield, label: 'Privacy', color: 'bg-purple-50 text-purple-600', action: () => alert('Privacy') },
    { icon: Eye, label: 'Visible', color: 'bg-orange-50 text-orange-600', toggle: true },
    { icon: Mail, label: 'Email', color: 'bg-pink-50 text-pink-600', val: 'OK' },
    { icon: Phone, label: 'Phone', color: 'bg-indigo-50 text-indigo-600', val: 'OK' },
    { icon: MapPin, label: 'Location', color: 'bg-teal-50 text-teal-600', toggle: true },
    { icon: CreditCard, label: 'Billing', color: 'bg-cyan-50 text-cyan-600', action: () => {} },
    { icon: History, label: 'Activity', color: 'bg-gray-100 text-gray-600', action: () => {} },
    { icon: User, label: 'Profile', color: 'bg-lime-50 text-lime-600', action: () => {} },
    { icon: Info, label: 'About', color: 'bg-rose-50 text-rose-600', action: () => {} },
    { icon: Send, label: 'Contact', color: 'bg-amber-50 text-amber-600', action: () => {} },
    { icon: Trash2, label: 'Delete', color: 'bg-red-50 text-red-600', action: () => alert('Delete Account?') },
    { icon: LogOut, label: 'Logout', color: 'bg-gray-200 text-gray-700', action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-lg mx-auto px-3 py-3">
        <h2 className="font-bold text-lg mb-3">Settings</h2>
        <div className="bg-white rounded-xl p-4 border">
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {items.map((item, i) => (
              <div key={i} onClick={() => { if(item.action) item.action(); if(item.tAction) item.tAction(); }} className={`${item.color} rounded-xl p-1.5 text-center cursor-pointer hover:shadow-md border active:scale-95 transition-all`}>
                <item.icon size={15} className="mx-auto mb-0.5" />
                <p className="text-[8px] font-medium truncate">{item.label}</p>
                {item.toggle !== undefined && (
                  <div className={`mt-1 mx-auto w-6 h-3 rounded-full relative ${item.toggle ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-2 h-2 bg-white rounded-full ${item.toggle ? 'left-3.5' : 'left-0.5'}`} />
                  </div>
                )}
                {item.val && <p className="text-[7px] font-medium mt-0.5 opacity-70">{item.val}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}