import React from 'react';
import { Delivery } from '../../types';
import { 
  Train, 
  Plane, 
  Car, 
  Package, 
  MapPin, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface RouteVisualizerProps {
  delivery: Delivery;
  compact?: boolean;
}

export const RouteVisualizer: React.FC<RouteVisualizerProps> = ({ delivery, compact = false }) => {
  const {
    fromCity,
    toCity,
    status,
    transportMode,
    transportDetail,
    currentLocation,
    checkpoints = [],
    envelopeSealCode
  } = delivery;

  const progress = Math.min(100, Math.max(0, currentLocation?.progressPercent || (status === 'delivered' ? 100 : 15)));

  const getTransportIcon = () => {
    switch (transportMode) {
      case 'Flight':
        return <Plane className="w-4 h-4 text-sky-400 transform -rotate-45" />;
      case 'Car':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'Train':
      default:
        return <Train className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'delivered':
        return { label: 'Delivered Safely', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'in_transit':
        return { label: 'In Transit', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse' };
      case 'matched':
        return { label: 'Traveller Assigned', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'requested':
      default:
        return { label: 'Searching Travellers', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
  };

  const badge = getStatusBadge();

  if (compact) {
    return (
      <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
            <span>{fromCity}</span>
            <span className="text-slate-500">→</span>
            <span>{toCity}</span>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-teal-300 transition-all duration-700 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate">{currentLocation?.checkpointName || 'Processing'}</span>
          <span className="font-mono text-slate-300">{progress}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      
      {/* Header telemetry info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>{fromCity}</span>
              <span className="text-brand-400">➔</span>
              <span>{toCity}</span>
            </h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
            <span>{transportDetail || `${transportMode || 'Express'} Transit`}</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">Distance: {delivery.distanceKm} km</span>
          </p>
        </div>

        {/* Tamper Seal & ETA Tag */}
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Estimated Delivery</div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center justify-end space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentLocation?.estimatedArrival || 'Scheduled today'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Animated Corridor Track */}
      <div className="py-2">
        <div className="relative pt-6 pb-4">
          
          {/* Base track line */}
          <div className="absolute top-9 left-6 right-6 h-1.5 bg-slate-800 rounded-full" />
          
          {/* Active progress track */}
          <div 
            className="absolute top-9 left-6 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-400 to-teal-400 rounded-full transition-all duration-700"
            style={{ width: `calc(${progress}% * 0.88)` }}
          />

          {/* Vehicle Position Marker */}
          <div 
            className="absolute top-5 transition-all duration-700 transform -translate-x-1/2 z-10"
            style={{ left: `calc(1.5rem + ${progress}% * 0.88)` }}
          >
            <div className="relative group">
              <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-emerald-400 shadow-lg shadow-emerald-500/40 flex items-center justify-center animate-bounce-subtle">
                {getTransportIcon()}
              </div>
              <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap">
                {progress}%
              </div>
            </div>
          </div>

          {/* Origin and Destination Endpoint Markers */}
          <div className="relative flex justify-between items-center z-0 px-2">
            {/* Origin Node */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-blue-600/30 border-2 border-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-slate-200 mt-1">{fromCity}</span>
              <span className="text-[10px] text-slate-500">Origin</span>
            </div>

            {/* Waypoint Midway */}
            <div className="flex flex-col items-center hidden sm:flex">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                progress >= 50 
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}>
                ●
              </div>
              <span className="text-[11px] text-slate-400 mt-1">Midway Transit</span>
              <span className="text-[9px] text-slate-600">Corridor Checkpoint</span>
            </div>

            {/* Destination Node */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-md ${
                progress >= 100 
                  ? 'bg-emerald-600/30 border-emerald-400 text-emerald-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}>
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-200 mt-1">{toCity}</span>
              <span className="text-[10px] text-slate-500">Destination</span>
            </div>
          </div>

        </div>

        {/* Current status banner */}
        <div className="mt-4 bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <p className="text-xs font-semibold text-slate-200">
                {currentLocation?.checkpointName || 'Checking in with carrier telemetry...'}
              </p>
              <p className="text-[11px] text-slate-400">
                Seal ID: <span className="font-mono text-brand-300">{envelopeSealCode}</span> • Tamper Seal Active
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-medium">100% Custody Safe</span>
          </div>
        </div>

      </div>

      {/* Checkpoint Milestones Accordion / List */}
      <div className="space-y-2 pt-2 border-t border-slate-800/60">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-brand-400" />
          <span>Custody Timeline & Transit Milestones</span>
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {checkpoints.map((cp, idx) => (
            <div 
              key={idx}
              className="flex items-start space-x-3 text-xs bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60"
            >
              <div className="mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{cp.title}</span>
                  <span className="text-[10px] text-slate-500">
                    {cp.timestamp ? new Date(cp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{cp.note}</p>
                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-600" />
                  <span>{cp.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
