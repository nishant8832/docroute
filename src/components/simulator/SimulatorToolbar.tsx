import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PlayCircle, 
  FastForward, 
  CheckCircle2, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown, 
  Sparkles,
  Zap
} from 'lucide-react';

export const SimulatorToolbar: React.FC = () => {
  const { deliveries, simulateStep, refreshAll } = useApp();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('DOC-88219');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Target delivery for fast-forward
  const targetDelivery = deliveries.find(d => d.id === selectedDeliveryId) || deliveries[0];

  const handleSimulate = async (step: 'pickup' | 'midway' | 'deliver') => {
    if (!targetDelivery) return;
    setIsSimulating(true);
    try {
      await simulateStep(targetDelivery.id, step);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <aside aria-label="Demo simulation controls" className="fixed bottom-4 left-4 z-40 max-w-md w-[calc(100vw-2rem)] sm:w-auto bg-slate-900/95 backdrop-blur-md border border-brand-500/30 rounded-2xl shadow-2xl shadow-brand-500/10 overflow-hidden text-xs">
      
      {/* Bar Header */}
      <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-slate-900 px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-brand-400 animate-pulse" />
          <span className="font-bold text-white tracking-wide">Live Route Simulator & Demo Tools</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-slate-400 hover:text-white rounded"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-3.5 space-y-3">
          
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">Target Consignment:</span>
            <select
              value={selectedDeliveryId}
              onChange={e => setSelectedDeliveryId(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
            >
              {deliveries.map(d => (
                <option key={d.id} value={d.id}>{d.id} ({d.fromCity} ➔ {d.toCity})</option>
              ))}
            </select>
          </div>

          {targetDelivery && (
            <div className="text-[11px] text-slate-400 bg-slate-950/70 p-2 rounded-lg border border-slate-800 flex justify-between">
              <span>Status: <strong className="text-white uppercase">{targetDelivery.status}</strong></span>
              <span>Pickup OTP: <strong className="text-blue-400 font-mono">{targetDelivery.pickupOtp}</strong></span>
              <span>Dropoff OTP: <strong className="text-emerald-400 font-mono">{targetDelivery.dropoffOtp}</strong></span>
            </div>
          )}

          {/* Fast-Forward Simulation Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSimulate('pickup')}
              disabled={isSimulating}
              className="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded-lg font-semibold transition disabled:opacity-50 text-[11px]"
              title="Fast-forward Pickup OTP verification"
            >
              1. Pickup OTP
            </button>
            <button
              onClick={() => handleSimulate('midway')}
              disabled={isSimulating}
              className="px-2.5 py-1.5 bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-500/30 rounded-lg font-semibold transition disabled:opacity-50 text-[11px]"
              title="Fast-forward GPS telemetry midway"
            >
              2. In Transit
            </button>
            <button
              onClick={() => handleSimulate('deliver')}
              disabled={isSimulating}
              className="px-2.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 rounded-lg font-semibold transition disabled:opacity-50 text-[11px]"
              title="Complete delivery & release payout"
            >
              3. Delivered!
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-500">
            <span>Simulates real-world transit telemetry in seconds</span>
            <button
              onClick={() => refreshAll()}
              className="text-slate-400 hover:text-white flex items-center space-x-0.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync</span>
            </button>
          </div>

        </div>
      )}

    </aside>
  );
};
