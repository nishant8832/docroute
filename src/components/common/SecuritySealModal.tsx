import React from 'react';
import { Delivery } from '../../types';
import { 
  ShieldCheck, 
  X, 
  QrCode, 
  Download, 
  CheckCircle, 
  FileText, 
  AlertTriangle,
  Lock
} from 'lucide-react';

interface SecuritySealModalProps {
  delivery: Delivery;
  onClose: () => void;
}

export const SecuritySealModal: React.FC<SecuritySealModalProps> = ({ delivery, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Digital Chain-of-Custody Certificate</h3>
              <p className="text-xs text-slate-400">Cryptographically Sealed Consignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Card Content */}
        <div className="my-5 p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Security Seal Code</span>
              <div className="font-mono text-sm font-bold text-emerald-400">{delivery.envelopeSealCode}</div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              TAMPER SAFE
            </span>
          </div>

          {/* Barcode & QR Simulation */}
          <div className="bg-white p-3 rounded-lg flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-1 h-12 w-full justify-center">
              {[4,2,6,1,3,5,2,4,7,3,2,6,1,4,3,2,5,3,6,1,4,2,5,3,2].map((w, i) => (
                <div key={i} className={`bg-black h-10`} style={{ width: `${w * 1.5}px` }} />
              ))}
            </div>
            <div className="font-mono text-[10px] text-slate-800 tracking-wider font-semibold">
              *{delivery.envelopeSealCode}*
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Sender Party</span>
              <p className="font-semibold text-slate-200 mt-0.5">{delivery.senderName}</p>
              <p className="text-[10px] text-slate-500">{delivery.fromCity}</p>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Recipient Party</span>
              <p className="font-semibold text-slate-200 mt-0.5">{delivery.recipientName}</p>
              <p className="text-[10px] text-slate-500">{delivery.toCity}</p>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span>Declared Insurance Value:</span>
              <span className="text-white font-medium">₹{delivery.declaredValue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Carrier Handover Route:</span>
              <span className="text-white font-medium">{delivery.transportDetail || 'Verified Commuter Route'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span>Physical Envelope Type:</span>
              <span className="text-white font-medium">{delivery.weightCategory}</span>
            </div>
          </div>

        </div>

        {/* Security rules */}
        <div className="flex items-start space-x-2 text-[11px] text-slate-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mb-4">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            This physical seal cannot be peeled without leaving an indelible VOID imprint. Both parties must inspect the seal code prior to signing the OTP handover.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Waybill Label</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
