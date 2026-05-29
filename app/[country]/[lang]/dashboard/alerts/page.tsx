// app/[country]/[lang]/dashboard/alerts/page.tsx
"use client";
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Bell, BellOff } from 'lucide-react';

export default function AlertsPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en';
  const alerts = [
    { text: 'Profile viewed 5 times today', time: '2h ago', type: 'view' },
    { text: 'Ahmed left a 5-star review', time: '1d ago', type: 'review' },
    { text: 'Featured profile expires in 2 days', time: '2d ago', type: 'alert' },
    { text: '3 people contacted via WhatsApp', time: '3d ago', type: 'contact' },
  ];
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-lg mx-auto px-3 py-3">
        <div className="flex justify-between mb-3"><h2 className="font-bold text-lg"><Bell size={20} className="inline mr-2" />Alerts</h2></div>
        <div className="bg-white rounded-xl p-4 border space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded-lg flex items-start gap-2">
              <span className={`w-2 h-2 mt-1.5 rounded-full ${a.type === 'view' ? 'bg-orange-500' : a.type === 'review' ? 'bg-yellow-500' : a.type === 'contact' ? 'bg-green-500' : 'bg-red-500'}`} />
              <div><p className="text-sm text-gray-700">{a.text}</p><p className="text-xs text-gray-400">{a.time}</p></div>
            </div>
          ))}
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}