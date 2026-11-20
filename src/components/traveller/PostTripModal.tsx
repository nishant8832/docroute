import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Train, 
  Plane, 
  Car, 
  Bus, 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface PostTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostTripModal: React.FC<PostTripModalProps> = ({ isOpen, onClose }) => {
  const { cities, postTravelPlan } = useApp();

  const [fromCity, setFromCity] = useState<string>('New Delhi');
  const [toCity, setToCity] = useState<string>('Lucknow');
  const [departureDate, setDepartureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState<string>('06:00');
  const [expectedArrivalTime, setExpectedArrivalTime] = useState<string>('12:25');
  const [transportMode, setTransportMode] = useState<'Train' | 'Flight' | 'Bus' | 'Car'>('Train');
  const [transportDetail, setTransportDetail] = useState<string>('Vande Bharat Express (22436)');
  const [capacityTotal, setCapacityTotal] = useState<number>(3);
  const [baseFare, setBaseFare] = useState<number>(450);
  const [notes, setNotes] = useState<string>('Executive class seat. Safe hand luggage space for sealed official documents.');
  const [stops, setStops] = useState<string>('Kanpur Central');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromCity === toCity) {
      setErrorMsg('Departure city and destination must be different.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await postTravelPlan({
        fromCity,
        toCity,
        departureDate,
        departureTime,
        expectedArrivalTime,
        transportMode,
        transportDetail,
        capacityTotal,
        baseFare,
        stops,
        notes
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to post travel plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const transportOptions: { id: 'Train' | 'Flight' | 'Bus' | 'Car'; label: string; icon: React.ReactNode; defaultDetail: string }[] = [
    { id: 'Train', label: 'Train', icon: <Train className="w-4 h-4" />, defaultDetail: 'Vande Bharat / Shatabdi Express' },
    { id: 'Flight', label: 'Flight', icon: <Plane className="w-4 h-4" />, defaultDetail: 'IndiGo / Air India Non-Stop' },
    { id: 'Bus', label: 'Bus', icon: <Bus className="w-4 h-4" />, defaultDetail: 'Intercity Volvo Multi-Axle' },
    { id: 'Car', label: 'Car / Cab', icon: <Car className="w-4 h-4" />, defaultDetail: 'Personal Sedan / Expressway Carpool' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Post Upcoming Travel Route</h2>
              <p className="text-xs text-slate-400">Earn up to ₹1,500+ carrying official document pouches</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
              Select Mode of Transportation
            </label>
            <div className="grid grid-cols-4 gap-2">
              {transportOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTransportMode(opt.id);
                    setTransportDetail(opt.defaultDetail);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 text-xs transition ${
                    transportMode === opt.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Route Cities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Departure City</label>
              <select
                value={fromCity}
                onChange={e => setFromCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {cities.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Destination City</label>
              <select
                value={toCity}
                onChange={e => setToCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {cities.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Transport Carrier Detail */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Carrier Details (Train / Flight / Vehicle No.)
            </label>
            <input
              type="text"
              value={transportDetail}
              onChange={e => setTransportDetail(e.target.value)}
              placeholder="e.g. Vande Bharat Express (22436) • Coach C2"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Timing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Travel Date</label>
              <input
                type="date"
                value={departureDate}
                onChange={e => setDepartureDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Departure Time</label>
              <input
                type="time"
                value={departureTime}
                onChange={e => setDepartureTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Arrival</label>
              <input
                type="time"
                value={expectedArrivalTime}
                onChange={e => setExpectedArrivalTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Capacity & Desired Base Fare */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Available Document Slots
              </label>
              <select
                value={capacityTotal}
                onChange={e => setCapacityTotal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>1 Document Pouch</option>
                <option value={2}>2 Document Pouches</option>
                <option value={3}>3 Document Pouches (Recommended)</option>
                <option value={4}>4 Document Pouches</option>
                <option value={5}>5 Document Pouches (Max)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Base Earning per Delivery (₹)
              </label>
              <input
                type="number"
                value={baseFare}
                onChange={e => setBaseFare(Number(e.target.value))}
                min={200}
                max={2000}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Intermediate Stops */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Intermediate Waypoints / Stops (Optional)
            </label>
            <input
              type="text"
              value={stops}
              onChange={e => setStops(e.target.value)}
              placeholder="e.g. Kanpur Central, Aligarh (comma-separated)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes for Senders & Pickup Points
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Meet at Platform 16 entry or passenger lobby"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
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
              {isSubmitting ? 'Publishing Route...' : 'Publish Travel Route'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
