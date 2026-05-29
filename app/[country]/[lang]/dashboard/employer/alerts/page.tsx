// app/[country]/[lang]/dashboard/employer/alerts/page.tsx
"use client";
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Bell } from 'lucide-react';

export default function EmployerAlertsPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en';
  const alerts = [
    { text: '15 applicants for Driver position', time: '2h ago' },
    { text: 'New labor registered in your area', time: '1d ago' },
  ];
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-lg mx-auto px-3 py-3">
        <h2 className="font-bold text-lg mb-3"><Bell size={20} className="inline mr-2" />Alerts</h2>
        <div className="bg-white rounded-xl p-4 border space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded-lg"><p className="text-sm text-gray-700">{a.text}</p><p className="text-xs text-gray-400">{a.time}</p></div>
          ))}
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}