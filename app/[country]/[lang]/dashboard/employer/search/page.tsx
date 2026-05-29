// app/[country]/[lang]/dashboard/employer/search/page.tsx
"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Search, Star } from 'lucide-react';

export default function EmployerSearchPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en'; const router = useRouter();
  const [q, setQ] = useState('');
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-lg mx-auto px-3 py-3">
        <h2 className="font-bold text-lg mb-3"><Search size={20} className="inline mr-2" />Find Labor</h2>
        <div className="bg-white rounded-xl p-4 border space-y-3">
          <div className="flex gap-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Search</button>
          </div>
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}