import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  X, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  FileCheck, 
  UserCheck,
  Sparkles
} from 'lucide-react';

interface KycVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KycVerificationModal: React.FC<KycVerificationModalProps> = ({ isOpen, onClose }) => {
  const { submitKyc, currentUser } = useApp();

  const [idType, setIdType] = useState<string>('Aadhaar Card');
  const [idNumber, setIdNumber] = useState<string>('XXXX-XXXX-9142');
  const [documentUrl, setDocumentUrl] = useState<string>('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitKyc({
        idType,
        idNumber,
        documentFrontUrl: documentUrl,
        selfieUrl: currentUser?.avatar
      });
      setSubmittedSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmittedSuccess(false);
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Traveller Trust & KYC Verification</h2>
              <p className="text-xs text-slate-400">Government ID & biometric facial verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">KYC Documents Submitted!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Our automated compliance engine has initiated verification with 98.7% confidence. You can track status under the Admin / Verification desk.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Why Complete Verification?</span>
              </div>
              <p className="text-slate-400">
                Verified travellers unlock instant booking priority, 2x higher payout rates, and the official DocRoute Verified Courier Trust Badge.
              </p>
            </div>

            {/* ID Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Government ID Type
              </label>
              <select
                value={idType}
                onChange={e => setIdType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Aadhaar Card">Aadhaar Card (UIDAI Verified)</option>
                <option value="Passport">Passport (Indian / International)</option>
                <option value="Driving License">Driving License (State Transport)</option>
                <option value="Voter ID">Voter Identity Card (ECI)</option>
              </select>
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ID Document Number / Masked Identifier
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                placeholder="e.g. 5489-XXXX-1029 or DL-142022..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            {/* Simulated Document Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Upload Front Document Photo (Simulated)
              </label>
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer bg-slate-950 transition">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-300 font-medium">Click to upload document scan</span>
                <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, PDF up to 5MB</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>All identity data is encrypted with 256-bit TLS and processed according to DPDP standards.</span>
            </div>

            {/* Footer Submit */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying with AI Engine...' : 'Submit Verification'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
