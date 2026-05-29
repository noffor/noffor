// app/[country]/[lang]/dashboard/employer/post/page.tsx
"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import { Plus, Briefcase } from 'lucide-react';

export default function PostJobPage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en';
  const [title, setTitle] = useState(''); const [cat, setCat] = useState(''); const [salary, setSalary] = useState('');
  const [company, setCompany] = useState(''); const [phone, setPhone] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-lg mx-auto px-3 py-3">
        <h2 className="font-bold text-lg mb-3"><Briefcase size={20} className="inline mr-2" />Post a Job</h2>
        <div className="bg-white rounded-xl p-4 border space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Job Title" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <input value={cat} onChange={e => setCat(e.target.value)} placeholder="Category" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <input value={salary} onChange={e => setSalary(e.target.value)} placeholder="Salary (QAR)" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company Name" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Contact Phone" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <button onClick={() => alert('Job Posted!')} className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"><Plus size={14} /> Post Job</button>
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}