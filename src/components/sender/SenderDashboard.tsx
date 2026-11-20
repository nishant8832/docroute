import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryTrackerCard } from './DeliveryTrackerCard';
import { Delivery } from '../../types';
import { 
  Send, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles,
  PackageCheck
} from 'lucide-react';

interface SenderDashboardProps {
  onOpenNewDelivery: () => void;
  onOpenDetails: (delivery: Delivery) => void;
  onOpenOtpModal: (delivery: Delivery, type: 'pickup' | 'dropoff') => void;
  onOpenSealModal: (delivery: Delivery) => void;
}

export const SenderDashboard: React.FC<SenderDashboardProps> = ({
  onOpenNewDelivery,
  onOpenDetails,
  onOpenOtpModal,
  onOpenSealModal
}) => {
  const { deliveries, currentUser } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter deliveries for current sender
  const userDeliveries = deliveries.filter(d => 
    !currentUser || currentUser.role === 'admin' || d.senderId === currentUser.id
  );

  const activeDeliveries = userDeliveries.filter(d => ['requested', 'matched', 'in_transit'].includes(d.status));
  const completedDeliveries = userDeliveries.filter(d => d.status === 'delivered');

  const filteredDeliveries = userDeliveries.filter(d => {
    if (filter === 'active') return ['requested', 'matched', 'in_transit'].includes(d.status);
    if (filter === 'delivered') return d.status === 'delivered';
    return true;
  }).filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) ||
           d.fromCity.toLowerCase().includes(q) ||
           d.toCity.toLowerCase().includes(q) ||
           d.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome & Quick Stats */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 border border-blue-900/50 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart P2P Hand-Carry Routing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {currentUser?.name || 'Sender'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Connect directly with verified passengers already travelling on your exact route via Vande Bharat, flights, or intercity expressways. Cut traditional courier delays from 48 hours down to same-day delivery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onOpenNewDelivery}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-brand-500 hover:from-blue-500 hover:to-brand-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Send New Document</span>
            </button>
          </div>
        </div>

        {/* Floating background graphic */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>In-Transit Active</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{activeDeliveries.length}</div>
          <p className="text-[11px] text-slate-500">Live GPS tracking enabled</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Successfully Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{completedDeliveries.length}</div>
          <p className="text-[11px] text-slate-500">OTP verified handovers</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Transit Speed</span>
            <TrendingUp className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-white">4.8 <span className="text-sm font-normal text-slate-400">hrs</span></div>
          <p className="text-[11px] text-emerald-400">7x faster than courier</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tamper Protection</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">100%</div>
          <p className="text-[11px] text-slate-500">Zero custody incidents</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search city, consignment ID..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Shipments' },
            { id: 'active', label: `Active (${activeDeliveries.length})` },
            { id: 'delivered', label: `Completed (${completedDeliveries.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries List Grid */}
      {filteredDeliveries.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <PackageCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No delivery consignments found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first peer-to-peer delivery request to send legal, academic, or business documents with verified travellers.
            </p>
          </div>
          <button
            onClick={onOpenNewDelivery}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            Create Delivery Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDeliveries.map(d => (
            <DeliveryTrackerCard
              key={d.id}
              delivery={d}
              onOpenDetails={onOpenDetails}
              onOpenOtpModal={onOpenOtpModal}
              onOpenSealModal={onOpenSealModal}
            />
          ))}
        </div>
      )}

    </div>
  );
};
