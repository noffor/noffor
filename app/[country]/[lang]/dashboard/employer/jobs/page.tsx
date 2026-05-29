"use client";
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Briefcase } from 'lucide-react';
import { getText, LangCode } from '@/lib/language';

export default function EmployerJobsPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en';
  const t = (key: string) => getText(lang as LangCode, key);
  const jobs = [
    { id:1, title:'Driver Needed', category:'Driver', salary:'2500 QAR', applicants:15, status:'Active', date:'2026-05-24' },
    { id:2, title:'Electrician Required', category:'Electrician', salary:'3000 QAR', applicants:8, status:'Active', date:'2026-05-22' },
  ];
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-lg mx-auto px-3 py-3">
        <h2 className="font-bold text-lg mb-3"><Briefcase size={20} className="inline mr-2" />{t('jobs') || 'Jobs'}</h2>
        <div className="bg-white rounded-xl p-4 border space-y-2">
          {jobs.map(j => (
            <div key={j.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between"><div><p className="font-bold text-sm">{j.title}</p><p className="text-xs text-gray-500">{j.category} • {j.salary}</p><p className="text-xs text-gray-400 mt-1">{j.applicants} applicants • {j.date}</p></div><span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-600">{j.status}</span></div>
              <div className="flex gap-1 mt-2"><button className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs">{t('viewAll')}</button><button className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs">Close</button></div>
            </div>
          ))}
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}