"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    if (email === 'admin@noffor.com' && password === 'admin123') {
      router.push('/admin/dashboard');
    } else {
      alert('Wrong credentials!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock size={28} className="text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Noffor Management</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 border">
            <Mail size={16} className="text-gray-400" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="flex-1 bg-transparent outline-none px-2 text-sm" />
          </div>
          <div className="flex items-center bg-gray-50 rounded-xl px-3 py-2 border">
            <Lock size={16} className="text-gray-400" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" onKeyDown={e => e.key === 'Enter' && login()} className="flex-1 bg-transparent outline-none px-2 text-sm" />
          </div>
          <button onClick={login} className="w-full py-3 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 transition-colors">
            Login
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">admin@noffor.com / admin123</p>
      </div>
    </div>
  );
}