"use client";
import { useState } from 'react';
import { Search, XCircle, Check, Shield, MessageCircle, Trash2 } from 'lucide-react';

export default function UserTable({ users }: { users: any[] }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search));

  return (
    <div>
      <div className="flex items-center bg-white rounded-lg px-3 py-2 border mb-3">
        <Search size={14} className="text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="bg-transparent outline-none px-2 text-sm flex-1" />
      </div>
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Phone</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3 font-medium">{u.name}<br /><span className="text-xs text-gray-400">{u.category}</span></td>
                <td className="px-4 py-3 text-xs">{u.phone}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{u.status}</span></td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <button className="p-1.5 rounded bg-red-50 text-red-600"><XCircle size={14} /></button>
                  <button className="p-1.5 rounded bg-blue-50 text-blue-600"><Shield size={14} /></button>
                  <button className="p-1.5 rounded bg-green-50 text-green-600"><MessageCircle size={14} /></button>
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