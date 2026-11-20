import React, { useState } from 'react';
import { Delivery } from '../../types';
import { RouteVisualizer } from '../common/RouteVisualizer';
import { 
  Package, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  KeyRound, 
  Copy, 
  Check, 
  Phone, 
  ChevronRight,
  ExternalLink,
  Train,
  Plane,
  Car,
  QrCode
} from 'lucide-react';

interface DeliveryTrackerCardProps {
  delivery: Delivery;
  onOpenDetails: (delivery: Delivery) => void;
  onOpenOtpModal: (delivery: Delivery, type: 'pickup' | 'dropoff') => void;
  onOpenSealModal: (delivery: Delivery) => void;
}

export const DeliveryTrackerCard: React.FC<DeliveryTrackerCardProps> = ({
  delivery,
  onOpenDetails,
  onOpenOtpModal,
  onOpenSealModal
}) => {
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOtp(type);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  const isDelivered = delivery.status === 'delivered';
  const isInTransit = delivery.status === 'in_transit';
  const isPickupPending = delivery.status === 'matched';

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition-all duration-200 space-y-4">
      
      {/* Top row: ID, Category & Urgency */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
            {delivery.id}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {delivery.category}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {delivery.urgency}
          </span>
          <button
            onClick={() => onOpenSealModal(delivery)}
            className="text-[11px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1 transition"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Seal Safe</span>
          </button>
        </div>
      </div>

      {/* Title & Route */}
      <div>
        <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition line-clamp-1">
          {delivery.title}
        </h3>
        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
          <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span>{delivery.fromCity}</span>
          <span className="text-slate-600 font-bold">➔</span>
          <span>{delivery.toCity}</span>
          <span className="text-slate-600">•</span>
          <span>{delivery.distanceKm} km</span>
        </div>
      </div>

      {/* Route Visualizer Compact Progress Bar */}
      <RouteVisualizer delivery={delivery} compact={true} />

      {/* Assigned Traveller Card or Pending Matching */}
      <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
        {delivery.travellerName ? (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              {delivery.transportMode === 'Flight' ? (
                <Plane className="w-4 h-4 text-sky-400" />
              ) : delivery.transportMode === 'Car' ? (
                <Car className="w-4 h-4 text-amber-400" />
              ) : (
                <Train className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-semibold text-slate-200">{delivery.travellerName}</span>
                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 rounded">
                  Verified Carrier
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {delivery.transportDetail || `${delivery.transportMode} Courier`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-amber-400">
            <Clock className="w-4 h-4 animate-spin" />
            <span>Finding matching verified traveller...</span>
          </div>
        )}

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Consignment Fee</span>
          <div className="text-sm font-bold text-white">₹{delivery.fare}</div>
        </div>
      </div>

      {/* OTP Handover Security Box */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Pickup OTP Box */}
        <div className={`p-2.5 rounded-xl border ${
          delivery.pickupVerifiedAt
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
            : 'bg-blue-950/30 border-blue-800/40 text-blue-300'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-semibold">Pickup OTP</span>
            {delivery.pickupVerifiedAt ? (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">Verified ✓</span>
            ) : (
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded">Give to Carrier</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-base font-bold tracking-widest text-white">
              {delivery.pickupOtp}
            </span>
            <button
              onClick={() => handleCopy(delivery.pickupOtp, 'pickup')}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
              title="Copy Pickup OTP"
            >
              {copiedOtp === 'pickup' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dropoff OTP Box */}
        <div className={`p-2.5 rounded-xl border ${
          delivery.dropoffVerifiedAt
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
            : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-semibold">Receiver Handover OTP</span>
            {delivery.dropoffVerifiedAt ? (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">Completed ✓</span>
            ) : (
              <span className="text-[9px] text-slate-500">For Recipient</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-base font-bold tracking-widest text-white">
              {delivery.dropoffOtp}
            </span>
            <button
              onClick={() => handleCopy(delivery.dropoffOtp, 'dropoff')}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
              title="Copy Recipient OTP"
            >
              {copiedOtp === 'dropoff' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <button
          onClick={() => onOpenSealModal(delivery)}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 transition font-medium"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>View Tamper Seal</span>
        </button>

        <div className="flex items-center space-x-2">
          {isPickupPending && (
            <button
              onClick={() => onOpenOtpModal(delivery, 'pickup')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center space-x-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Verify Pickup</span>
            </button>
          )}

          {isInTransit && (
            <button
              onClick={() => onOpenOtpModal(delivery, 'dropoff')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Handover</span>
            </button>
          )}

          <button
            onClick={() => onOpenDetails(delivery)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700/80 transition flex items-center space-x-1"
          >
            <span>Live Route</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
