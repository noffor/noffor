"use client";
import { useState } from 'react';
import { Check, XCircle, Trash2 } from 'lucide-react';

export default function PaymentTable({ payments }: { payments: any[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {['all','pending','confirmed','rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${filter === s ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">User</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Amount</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">{p.user}</td>
                <td className="px-4 py-3 font-medium text-orange-600">{p.amount} QAR</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${p.status === 'confirmed' ? 'bg-green-100 text-green-600' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>{p.status}</span></td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  {p.status === 'pending' && <><button className="p-1.5 rounded bg-green-50 text-green-600"><Check size={14} /></button><button className="p-1.5 rounded bg-red-50 text-red-600"><XCircle size={14} /></button></>}
                  <button className="p-1.5 rounded bg-gray-50 text-gray-600"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}