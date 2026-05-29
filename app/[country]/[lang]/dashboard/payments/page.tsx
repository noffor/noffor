// app/[country]/[lang]/dashboard/payments/page.tsx
"use client";
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en';
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-lg mx-auto px-3 py-3">
        <h2 className="font-bold text-lg mb-3"><CreditCard size={20} className="inline mr-2" />Payments</h2>
        <div className="bg-white rounded-xl p-4 border">
          <div className="bg-orange-50 rounded-xl p-4 text-center mb-3 border border-orange-200">
            <p className="font-bold">Feature Profile - 2 QAR / 24h</p>
            <button onClick={() => alert('QR Payment')} className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm">Pay with QR</button>
          </div>
          <h4 className="font-bold text-sm mb-2">History</h4>
          {[{ id:1, amount:2, status:'Confirmed', date:'2026-05-24' },{ id:2, amount:2, status:'Confirmed', date:'2026-05-20' }].map(p => (
            <div key={p.id} className="flex justify-between p-2 bg-gray-50 rounded-lg mb-2">
              <span className="text-sm">{p.amount} QAR • {p.date}</span>
              <span className="text-xs text-green-600 font-medium">{p.status}</span>
            </div>
          ))}
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}