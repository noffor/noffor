"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DollarSign, RotateCcw, AlertTriangle, CheckCircle, X, Percent } from 'lucide-react';

interface RefundPanelProps {
  bookingId: string;
  amount: number;
  workerName: string;
  employerName: string;
  onClose: () => void;
  onRefunded: () => void;
}

export default function RefundPanel({ bookingId, amount, workerName, employerName, onClose, onRefunded }: RefundPanelProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundPercent, setRefundPercent] = useState(50);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const refundAmount = refundType === 'full' ? amount : Math.round(amount * refundPercent / 100);
  const commissionLoss = Math.round(refundAmount * 0.15);

  const handleRefund = async () => {
    setProcessing(true);
    await supabase.from('bookings').update({
      status: 'refunded',
      refund_amount: refundAmount,
      refund_reason: reason,
      refunded_at: new Date().toISOString(),
      refunded_by: (await supabase.auth.getUser()).data.user?.id,
    }).eq('id', bookingId);

    await supabase.from('transactions').insert({
      booking_id: bookingId,
      type: 'refund',
      amount: -refundAmount,
      description: `Refund: ${reason}`,
    });

    setProcessing(false);
    setDone(true);
    setTimeout(() => { onRefunded(); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RotateCcw size={18} className="text-yellow-400" />
            <h3 className="text-white font-bold">Process Refund</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        {done ? (
          <div className="text-center py-6">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
            <p className="text-white font-bold">Refund Processed!</p>
            <p className="text-gray-400 text-sm mt-1">{refundAmount} QAR refunded</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-3 text-sm">
              <p className="text-gray-300">Booking: <span className="text-white">{workerName} ↔ {employerName}</span></p>
              <p className="text-gray-400 text-xs mt-1">Amount: {amount} QAR</p>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Refund Type</label>
              <div className="flex gap-2">
                <button onClick={() => setRefundType('full')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${refundType==='full'?'bg-orange-600 text-white':'bg-gray-800 text-gray-400'}`}>Full Refund</button>
                <button onClick={() => setRefundType('partial')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${refundType==='partial'?'bg-orange-600 text-white':'bg-gray-800 text-gray-400'}`}>Partial Refund</button>
              </div>
            </div>

            {refundType === 'partial' && (
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Refund Percentage: {refundPercent}%</label>
                <input type="range" min="10" max="90" value={refundPercent} onChange={e => setRefundPercent(+e.target.value)} className="w-full accent-orange-500" />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Reason</label>
              <select value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-orange-500">
                <option value="">Select reason...</option>
                <option value="Worker no-show">Worker no-show</option>
                <option value="Poor service quality">Poor service quality</option>
                <option value="Wrong category">Wrong category</option>
                <option value="Customer request">Customer request</option>
                <option value="Duplicate booking">Duplicate booking</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="bg-gray-800 rounded-lg p-3 flex justify-between text-sm">
              <span className="text-gray-400">Refund Amount:</span>
              <span className="text-white font-bold">{refundAmount} QAR</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-center gap-2 text-xs text-red-400">
              <AlertTriangle size={12} />Commission loss: {commissionLoss} QAR
            </div>

            <button onClick={handleRefund} disabled={processing || !reason} className="w-full py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50 transition-all">
              {processing ? 'Processing...' : `Refund ${refundAmount} QAR`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}