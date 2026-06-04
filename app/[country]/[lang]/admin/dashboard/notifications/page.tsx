"use client";

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import NotificationSender from '@/components/admin/NotificationSender';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <AdminSidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Bell size={24} className="text-orange-400" />Notifications</h1>
            <p className="text-gray-400 text-sm mt-1">Send bulk push notifications to users</p>
          </div>
          <div className="max-w-2xl">
            <NotificationSender />
          </div>
        </main>
      </div>
    </div>
  );
}