"use client";

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import FraudAlert from '@/components/admin/FraudAlert';
import { Shield } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield size={24} className="text-red-400" />Security</h1>
            <p className="text-gray-400 text-sm mt-1">Fraud detection and platform security</p>
          </div>
          <FraudAlert />
        </main>
      </div>
    </div>
  );
}