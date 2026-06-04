"use client";

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import BookingTable from '@/components/admin/BookingTable';
import { CalendarCheck } from 'lucide-react';

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><CalendarCheck size={24} className="text-blue-400" />Bookings</h1>
            <p className="text-gray-400 text-sm mt-1">Manage all bookings, refunds, and disputes</p>
          </div>
          <BookingTable />
        </main>
      </div>
    </div>
  );
}