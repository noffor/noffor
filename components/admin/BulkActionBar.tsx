"use client";

import { useState } from 'react';
import { CheckCircle, Ban, Trash2, X, Mail } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onAction: (action: string) => void;
  onClear: () => void;
}

export default function BulkActionBar({ selectedCount, onAction, onClear }: BulkActionBarProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  if (selectedCount === 0) return null;

  const handleConfirm = (action: string) => {
    if (confirmAction === action) {
      onAction(action);
      setConfirmAction(null);
    } else {
      setConfirmAction(action);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4">
      <span className="text-sm text-white font-medium">{selectedCount} selected</span>
      <div className="w-px h-6 bg-gray-700" />
      <div className="flex gap-1">
        <button onClick={() => handleConfirm('verify')} className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${confirmAction==='verify'?'bg-green-600 text-white':'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          <CheckCircle size={12} />{confirmAction==='verify'?'Confirm?':'Verify'}
        </button>
        <button onClick={() => handleConfirm('ban')} className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${confirmAction==='ban'?'bg-red-600 text-white':'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          <Ban size={12} />{confirmAction==='ban'?'Confirm?':'Ban'}
        </button>
        <button onClick={() => handleConfirm('notify')} className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${confirmAction==='notify'?'bg-blue-600 text-white':'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          <Mail size={12} />{confirmAction==='notify'?'Confirm?':'Notify'}
        </button>
      </div>
      <div className="w-px h-6 bg-gray-700" />
      <button onClick={onClear} className="text-gray-400 hover:text-white"><X size={16} /></button>
    </div>
  );
}