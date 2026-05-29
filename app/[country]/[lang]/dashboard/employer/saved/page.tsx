// app/[country]/[lang]/dashboard/employer/saved/page.tsx
"use client";
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Heart, Star } from 'lucide-react';

export default function EmployerSavedPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en'; const router = useRouter();
  const saved = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Mohammed Rahim', category: 'Driver', rating: 4.5, photo: '/default-avatar.png' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Jamal Uddin', category: 'Plumber', rating: 4.8, photo: '/default-avatar.png' },
  ];
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-lg mx-auto px-3 py-3">
        <h2 className="font-bold text-lg mb-3"><Heart size={20} className="inline mr-2" />Saved Labors</h2>
        <div className="bg-white rounded-xl p-4 border space-y-2">
          {saved.map(s => (
            <div key={s.id} onClick={() => router.push(`/${country}/${lang}/profile/${s.id}`)} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer">
              <img src={s.photo} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1"><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-gray-400">{s.category}</p></div>
              <div className="flex items-center gap-1"><Star size={12} className="text-yellow-500" fill="#EAB308" /><span className="text-xs">{s.rating}</span></div>
            </div>
          ))}
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}