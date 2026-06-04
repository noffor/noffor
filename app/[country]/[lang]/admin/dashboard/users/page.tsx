"use client";

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import WorkerTable from '@/components/admin/WorkerTable';
import EmployerTable from '@/components/admin/EmployerTable';
import { Users } from 'lucide-react';

export default function UsersPage() {
  const [tab, setTab] = useState<'workers' | 'employers'>('workers');

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users size={24} className="text-blue-400" />Users</h1>
            <p className="text-gray-400 text-sm mt-1">Manage all workers and employers</p>
          </div>
          
          <div className="flex gap-1 bg-gray-900 rounded-lg p-1 w-fit">
            <button onClick={() => setTab('workers')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab==='workers'?'bg-orange-600 text-white':'text-gray-400 hover:text-white'}`}>
              Workers
            </button>
            <button onClick={() => setTab('employers')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${tab==='employers'?'bg-orange-600 text-white':'text-gray-400 hover:text-white'}`}>
              Employers
            </button>
          </div>

          {tab === 'workers' ? <WorkerTable /> : <EmployerTable />}
        </main>
      </div>
    </div>
  );
}