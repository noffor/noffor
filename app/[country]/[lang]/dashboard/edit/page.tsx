"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';

export default function EditProfilePage() {
  const params = useParams(); const country = (params as any).country || 'qa'; const lang = (params as any).lang || 'en';
  const [name, setName] = useState('Mohammed Rahim');
  const [category, setCategory] = useState('Driver');
  const [salary, setSalary] = useState('2500');
  const [exp, setExp] = useState('5 years');
  const [city, setCity] = useState('Doha');
  const [area, setArea] = useState('Industrial Area');

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header country={country} lang={lang} />
      <div className="max-w-lg mx-auto px-3 py-3">
        <h2 className="font-bold text-lg mb-3">Edit Profile</h2>
        <div className="bg-white rounded-xl p-4 border space-y-3">
          {[['Name', name, setName],['Category', category, setCategory],['Salary (QAR)', salary, setSalary],['Experience', exp, setExp],['City', city, setCity],['Area', area, setArea]].map(([l, v, set], i) => (
            <div key={i}><label className="text-xs text-gray-500">{l as string}</label><input value={v as string} onChange={e => (set as any)(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
          ))}
          <button onClick={() => alert('Saved!')} className="w-full py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">Save Changes</button>
        </div>
      </div>
      <MobileNav country={country} lang={lang} />
    </div>
  );
}