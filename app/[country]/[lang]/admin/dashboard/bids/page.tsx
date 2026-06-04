"use client";

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import BidMonitor from '@/components/admin/BidMonitor';
import { Gavel } from 'lucide-react';

export default function BidsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Gavel size={24} className="text-yellow-400" />Live Bids</h1>
            <p className="text-gray-400 text-sm mt-1">Monitor and manage all active bids in real-time</p>
          </div>
          <BidMonitor />
        </main>
      </div>
    </div>
  );
}