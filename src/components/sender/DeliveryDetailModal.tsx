import React, { useState } from 'react';
import { Delivery } from '../../types';
import { RouteVisualizer } from '../common/RouteVisualizer';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  MapPin, 
  User, 
  Phone, 
  ShieldCheck, 
  KeyRound, 
  Copy, 
  Check, 
  FileText, 
  Download, 
  ExternalLink,
  Train,
  Plane,
  Car
} from 'lucide-react';

interface DeliveryDetailModalProps {
  delivery: Delivery | null;
  onClose: () => void;
  onOpenOtpModal: (delivery: Delivery, type: 'pickup' | 'dropoff') => void;
  onOpenSealModal: (delivery: Delivery) => void;
}

export const DeliveryDetailModal: React.FC<DeliveryDetailModalProps> = ({
  delivery,
  onClose,
  onOpenOtpModal,
  onOpenSealModal
}) => {
  const { simulateStep } = useApp();
  const [copied, setCopied] = useState<string | null>(null);

  if (!delivery) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-md border border-brand-500/20">
                {delivery.id}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DocRoute Encrypted Custody</span>
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{delivery.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Interactive Route Visualizer with live telemetry */}
          <RouteVisualizer delivery={delivery} compact={false} />

          {/* Consignment Specs & Parties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* Sender & Pickup info */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                Pickup Origin Party
              </span>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-white">{delivery.senderName}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Phone className="w-3.5 h-3.5" />
                <span>{delivery.senderPhone}</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{delivery.senderAddress}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-500">Pickup OTP:</span>
                <span className="font-mono text-sm font-bold text-blue-400">{delivery.pickupOtp}</span>
              </div>
            </div>

            {/* Recipient & Dropoff info */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Destination Recipient Party
              </span>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-white">{delivery.recipientName}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Phone className="w-3.5 h-3.5" />
                <span>{delivery.recipientPhone}</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{delivery.recipientAddress}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-500">Receiver OTP:</span>
                <span className="font-mono text-sm font-bold text-emerald-400">{delivery.dropoffOtp}</span>
              </div>
            </div>

          </div>

          {/* Assigned Verified Carrier */}
          {delivery.travellerName && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  {delivery.transportMode === 'Flight' ? (
                    <Plane className="w-5 h-5 text-sky-400" />
                  ) : delivery.transportMode === 'Car' ? (
                    <Car className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Train className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{delivery.travellerName}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-semibold">
                      KYC Verified
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {delivery.transportDetail} • Contact: {delivery.travellerPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenSealModal(delivery)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                >
                  Inspect Seal Code
                </button>
              </div>
            </div>
          )}

          {/* Proof of Delivery Photo if delivered */}
          {delivery.proofOfDeliveryUrl && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Verified Proof of Handover
              </h4>
              <img
                src={delivery.proofOfDeliveryUrl}
                alt="Delivery Proof"
                className="w-full max-h-48 object-cover rounded-lg border border-slate-800"
              />
              <p className="text-[11px] text-slate-400">
                Handover stamped and verified by recipient OTP signature on {new Date(delivery.dropoffVerifiedAt || delivery.createdAt).toLocaleString()}.
              </p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Waybill</span>
          </button>

          <div className="flex items-center space-x-2">
            {delivery.status === 'matched' && (
              <button
                onClick={() => onOpenOtpModal(delivery, 'pickup')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow transition"
              >
                Verify Pickup OTP
              </button>
            )}
            {delivery.status === 'in_transit' && (
              <button
                onClick={() => onOpenOtpModal(delivery, 'dropoff')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow transition"
              >
                Verify Handover OTP
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
