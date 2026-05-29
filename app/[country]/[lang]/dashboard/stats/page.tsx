"use client";
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Eye, Phone, Briefcase, Star, TrendingUp } from 'lucide-react';

export default function StatsPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en';
  
  const stats = [
    { label: 'Profile Views', value: '1,250', icon: Eye, color: 'text-orange-500' },
    { label: 'WhatsApp Clicks', value: '45', icon: Phone, color: 'text-green-500' },
    { label: 'Job Offers', value: '12', icon: Briefcase, color: 'text-blue-500' },
    { label: 'Rating', value: '4.5 / 5', icon: Star, color: 'text-yellow-500' },
    { label: 'Reviews', value: '234', icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-lg mx-auto px-3 py-3">
        <h2 className="font-bold text-lg mb-3">Statistics</h2>
        <div className="bg-white rounded-xl p-4 border space-y-3">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <s.icon size={18} className={s.color} />
                <span className="text-sm text-gray-600">{s.label}</span>
              </div>
              <span className="font-bold text-gray-800">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}