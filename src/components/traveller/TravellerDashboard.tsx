import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Delivery, TravelPlan } from '../../types';
import { WalletCard } from './WalletCard';
import { RouteVisualizer } from '../common/RouteVisualizer';
import { 
  Compass, 
  Train, 
  Plane, 
  Car, 
  MapPin, 
  ShieldCheck, 
  KeyRound, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  ArrowRight,
  TrendingUp,
  Package
} from 'lucide-react';

interface TravellerDashboardProps {
  onOpenNewTrip: () => void;
  onOpenKycModal: () => void;
  onOpenOtpModal: (delivery: Delivery, type: 'pickup' | 'dropoff') => void;
  onOpenSealModal: (delivery: Delivery) => void;
  onOpenDetails: (delivery: Delivery) => void;
}

export const TravellerDashboard: React.FC<TravellerDashboardProps> = ({
  onOpenNewTrip,
  onOpenKycModal,
  onOpenOtpModal,
  onOpenSealModal,
  onOpenDetails
}) => {
  const { currentUser, travels, deliveries, bookTraveller, addCheckpoint } = useApp();

  const [activeTab, setActiveTab] = useState<'active_tasks' | 'incoming_requests' | 'my_trips'>('active_tasks');
  const [checkpointInput, setCheckpointInput] = useState<{ [key: string]: string }>({});

  // Traveller's trips
  const myTrips = travels.filter(t => !currentUser || t.travellerId === currentUser.id);

  // Deliveries assigned to this traveller
  const assignedDeliveries = deliveries.filter(d => 
    !currentUser || d.travellerId === currentUser.id
  );

  const activeDeliveries = assignedDeliveries.filter(d => ['matched', 'in_transit'].includes(d.status));
  const completedDeliveries = assignedDeliveries.filter(d => d.status === 'delivered');

  // Available requests matching this traveller's corridors
  const incomingRequests = deliveries.filter(d => d.status === 'requested');

  const handleAcceptRequest = async (deliveryId: string) => {
    if (currentUser) {
      await bookTraveller(deliveryId, currentUser.id);
    }
  };

  const handleAddCheckpoint = async (deliveryId: string) => {
    const text = checkpointInput[deliveryId];
    if (!text) return;
    await addCheckpoint(deliveryId, {
      title: 'Carrier Telemetry Checkpoint',
      location: text,
      note: 'Updated by traveller via in-app transit logger'
    });
    setCheckpointInput(prev => ({ ...prev, [deliveryId]: '' }));
  };

  const isKycVerified = currentUser?.kycStatus === 'verified';
  const isKycPending = currentUser?.kycStatus === 'pending';

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Verification Status & Trust Score */}
      <div className={`p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 ${
        isKycVerified
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-emerald-800/40'
          : 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-amber-800/40'
      }`}>
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isKycVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">
                {currentUser?.name || 'Verified Commuter'}
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isKycVerified 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isKycVerified ? 'Verified Courier' : isKycPending ? 'KYC Under Review' : 'KYC Required'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Trust Score: <strong className="text-emerald-400">{currentUser?.trustScore || 95}%</strong> • {currentUser?.completedDeliveries || 0} Successful Hand-Carries
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!isKycVerified && (
            <button
              onClick={onOpenKycModal}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
            >
              {isKycPending ? 'Review KYC Details' : 'Verify Identity (Aadhaar)'}
            </button>
          )}

          <button
            onClick={onOpenNewTrip}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post Travel Route</span>
          </button>
        </div>
      </div>

      {/* Grid: Tasks & Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Main Content Tabs */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            {[
              { id: 'active_tasks', label: `Active Deliveries (${activeDeliveries.length})` },
              { id: 'incoming_requests', label: `Available Consignments (${incomingRequests.length})` },
              { id: 'my_trips', label: `My Travel Schedules (${myTrips.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: ACTIVE HANDOVER TASKS */}
          {activeTab === 'active_tasks' && (
            <div className="space-y-4">
              {activeDeliveries.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                  <Package className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-white">No deliveries in progress right now</p>
                  <p className="text-xs text-slate-400">
                    Check the "Available Consignments" tab to accept high-payout document delivery requests on your route!
                  </p>
                </div>
              ) : (
                activeDeliveries.map(d => {
                  const isPickupPending = d.status === 'matched';
                  const isInTransit = d.status === 'in_transit';

                  return (
                    <div
                      key={d.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded">
                              {d.id}
                            </span>
                            <span className="text-xs text-slate-400">{d.category}</span>
                          </div>
                          <h4 className="text-base font-bold text-white mt-1">{d.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Your Payout</span>
                          <div className="text-base font-extrabold text-emerald-400">₹{d.payoutTraveller}</div>
                        </div>
                      </div>

                      <RouteVisualizer delivery={d} compact={true} />

                      {/* STEP-BY-STEP EXECUTION WORKFLOW FOR TRAVELLER */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Custody Handover Execution</span>
                        </div>

                        {/* Step 1: Pickup OTP */}
                        {isPickupPending && (
                          <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-blue-300">
                                Step 1: Meet Sender ({d.senderName}) & Enter Pickup OTP
                              </span>
                              <span className="text-[10px] text-slate-400">Contact: {d.senderPhone}</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Pickup Rendezvous: {d.senderAddress}. Inspect seal: <span className="font-mono text-emerald-400">{d.envelopeSealCode}</span>
                            </p>
                            <button
                              onClick={() => onOpenOtpModal(d, 'pickup')}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center justify-center space-x-1"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Enter Sender's Pickup OTP</span>
                            </button>
                          </div>
                        )}

                        {/* Step 2: In-Transit Checkpoint Updates */}
                        {isInTransit && (
                          <div className="space-y-3">
                            <div className="p-3 bg-emerald-950/30 border border-emerald-800/30 rounded-xl space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-emerald-300">
                                  Step 2: Consignment In Transit (Safe Hand-Carry)
                                </span>
                                <span className="text-[10px] text-slate-400">Destination: {d.toCity}</span>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Recipient: {d.recipientName} ({d.recipientPhone}) at {d.recipientAddress}
                              </p>
                              
                              <div className="flex gap-2 pt-1">
                                <input
                                  type="text"
                                  value={checkpointInput[d.id] || ''}
                                  onChange={e => setCheckpointInput({ ...checkpointInput, [d.id]: e.target.value })}
                                  placeholder="Log checkpoint: e.g. Passed Aligarh Junction"
                                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  onClick={() => handleAddCheckpoint(d.id)}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition"
                                >
                                  Update
                                </button>
                              </div>
                            </div>

                            {/* Step 3: Complete Handover */}
                            <button
                              onClick={() => onOpenOtpModal(d, 'dropoff')}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center space-x-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Meet Recipient & Enter Dropoff OTP (Release ₹{d.payoutTraveller})</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => onOpenSealModal(d)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Seal: {d.envelopeSealCode}
                        </button>
                        <button
                          onClick={() => onOpenDetails(d)}
                          className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1"
                        >
                          <span>Full Consignment View</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: INCOMING / AVAILABLE REQUESTS */}
          {activeTab === 'incoming_requests' && (
            <div className="space-y-3">
              {incomingRequests.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                  No pending delivery requests currently awaiting travellers. Check back shortly!
                </div>
              ) : (
                incomingRequests.map(req => (
                  <div
                    key={req.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                          {req.id}
                        </span>
                        <span className="text-xs text-slate-300 font-semibold">{req.title}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        <span>{req.fromCity} ➔ {req.toCity}</span>
                        <span>•</span>
                        <span>{req.category}</span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">By: {req.preferredDeliveryTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase">Payout</span>
                        <div className="text-sm font-bold text-emerald-400">₹{req.payoutTraveller}</div>
                      </div>
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition"
                      >
                        Accept Delivery
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: MY TRAVEL SCHEDULES */}
          {activeTab === 'my_trips' && (
            <div className="space-y-3">
              {myTrips.map(trip => (
                <div
                  key={trip.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                      {trip.transportMode === 'Flight' ? <Plane className="w-5 h-5" /> : <Train className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{trip.fromCity} ➔ {trip.toCity}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {trip.transportMode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {trip.transportDetail} • Departs: {trip.departureTime} ({trip.departureDate})
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-4 justify-between sm:justify-end">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Capacity</span>
                      <div className="text-xs font-bold text-slate-200">
                        {trip.capacityAvailable} of {trip.capacityTotal} slots free
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      Active Route
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Col: Wallet & Earnings Sidebar */}
        <div className="space-y-4">
          <WalletCard />

          {/* Trust Guidelines card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Courier Protocol Rules</span>
            </h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">1.</span>
                <span>Never open or break the tamper-evident pouch seal code.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">2.</span>
                <span>Verify Pickup OTP before taking custody at origin.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">3.</span>
                <span>Handover only after recipient enters the 6-digit Dropoff OTP.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
