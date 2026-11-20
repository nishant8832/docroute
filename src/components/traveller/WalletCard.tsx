import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export const WalletCard: React.FC = () => {
  const { walletData, withdrawFunds, currentUser } = useApp();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(walletData?.balance || 500);
  const [upiId, setUpiId] = useState('traveller@oksbi');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<{ success: boolean; message: string } | null>(null);

  const balance = walletData?.balance || currentUser?.walletBalance || 0;
  const escrowPending = walletData?.escrowPending || 0;
  const lifetime = walletData?.totalEarnings || currentUser?.earningsTotal || 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWithdrawing(true);
    setWithdrawResult(null);

    try {
      const res = await withdrawFunds(withdrawAmount, upiId);
      setWithdrawResult(res);
      if (res.success) {
        setTimeout(() => {
          setWithdrawModalOpen(false);
          setWithdrawResult(null);
        }, 1500);
      }
    } catch {
      setWithdrawResult({ success: false, message: 'Transfer failed' });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Traveller Payout Wallet</h3>
            <p className="text-[11px] text-slate-400">Direct instant escrow release</p>
          </div>
        </div>
        <button
          onClick={() => {
            setWithdrawAmount(balance);
            setWithdrawModalOpen(true);
          }}
          disabled={balance <= 0}
          className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-md transition"
        >
          <span>Withdraw</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Balances Display */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Available for Payout</span>
          <div className="text-xl font-extrabold text-white mt-0.5">₹{balance.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-400 flex items-center space-x-0.5 mt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready for UPI transfer</span>
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">In Escrow (In-Transit)</span>
          <div className="text-xl font-extrabold text-amber-400 mt-0.5">₹{escrowPending.toLocaleString()}</div>
          <span className="text-[10px] text-slate-500 flex items-center space-x-0.5 mt-0.5">
            <Clock className="w-3 h-3" />
            <span>Releases on Dropoff OTP</span>
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Lifetime Couriered Earnings:</span>
        <span className="font-bold text-white">₹{lifetime.toLocaleString()}</span>
      </div>

      {/* Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <h4 className="font-bold text-white text-sm">Instant UPI Payout Transfer</h4>
            <form onSubmit={handleWithdraw} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  max={balance}
                  min={100}
                  onChange={e => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">UPI VPA Handle</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="name@okaxis"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              {withdrawResult && (
                <div className={`p-2 rounded-lg text-xs ${withdrawResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {withdrawResult.message}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing || withdrawAmount <= 0 || withdrawAmount > balance}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  {isWithdrawing ? 'Processing...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
