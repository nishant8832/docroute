import React, { useState } from 'react';
import { Delivery } from '../../types';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Copy, 
  Check, 
  Camera, 
  ArrowRight,
  Lock
} from 'lucide-react';

interface OtpVerificationModalProps {
  delivery: Delivery;
  type: 'pickup' | 'dropoff';
  onClose: () => void;
  onSuccess?: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  delivery,
  type,
  onClose,
  onSuccess
}) => {
  const { verifyPickupOtp, verifyDropoffOtp, activeRole } = useApp();
  const [otpInput, setOtpInput] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPickup = type === 'pickup';
  const expectedOtp = isPickup ? delivery.pickupOtp : delivery.dropoffOtp;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpInput.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (isPickup) {
        res = await verifyPickupOtp(delivery.id, otpInput);
      } else {
        res = await verifyDropoffOtp(delivery.id, otpInput, photoUrl || undefined);
      }

      if (res.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Verification failed. Please check network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Glow accent */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isPickup ? 'bg-blue-500' : 'bg-emerald-500'}`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isPickup ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isPickup ? 'Sender Pickup Verification' : 'Receiver Dropoff Handover'}
            </h3>
            <p className="text-xs text-slate-400">
              Consignment ID: <span className="font-mono text-slate-300">{delivery.id}</span>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 mb-5 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-brand-300 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>Digital Chain-of-Custody Security</span>
          </div>
          <p className="text-slate-400">
            {isPickup
              ? 'The sender holds the Pickup OTP. The traveller must enter this code upon receiving the physical package to begin transit.'
              : 'The designated recipient holds the Dropoff OTP. The traveller enters it at handover to confirm safe delivery and release escrow funds.'}
          </p>
          <div className="pt-1 text-[11px] font-mono text-emerald-400">
            Tamper Seal: {delivery.envelopeSealCode}
          </div>
        </div>

        {/* Sender Perspective View: Displaying the OTP to tell the traveller */}
        {activeRole === 'sender' && (
          <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/50 rounded-xl p-4 mb-5 text-center">
            <p className="text-xs text-slate-400 mb-1">
              {isPickup ? 'Your Pickup OTP (Provide to traveller in person):' : 'Recipient Dropoff OTP (For recipient to share):'}
            </p>
            <div className="flex items-center justify-center space-x-3">
              <span className="font-mono text-3xl font-extrabold tracking-widest text-blue-400">
                {expectedOtp}
              </span>
              <button
                onClick={() => handleCopy(expectedOtp)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
                title="Copy OTP"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Do not share this code until you physically inspect the traveller's ID badge.
            </p>
          </div>
        )}

        {/* Input Form for Verification */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Enter 6-Digit Verification Code
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="0 0 0 0 0 0"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold bg-slate-950 border border-slate-700 focus:border-brand-500 rounded-xl py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                autoFocus
              />
            </div>
          </div>

          {/* Quick Demo Helper Hint */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Demo Secret Code: <strong className="font-mono text-brand-300">{expectedOtp}</strong></span>
            <button
              type="button"
              onClick={() => setOtpInput(expectedOtp)}
              className="text-brand-400 hover:text-brand-300 underline font-medium"
            >
              Auto-Fill Code
            </button>
          </div>

          {/* Optional Proof of Delivery Photo for Dropoff */}
          {!isPickup && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                <Camera className="w-3.5 h-3.5 text-slate-400" />
                <span>Handover Photo Proof (Optional)</span>
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://... photo URL or receipt snapshot"
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || otpInput.length !== 6}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-5 py-2.5 rounded-xl text-white shadow-lg transition disabled:opacity-50 ${
                isPickup
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25'
              }`}
            >
              <span>{isSubmitting ? 'Verifying...' : (isPickup ? 'Confirm Pickup Handover' : 'Complete Delivery')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
