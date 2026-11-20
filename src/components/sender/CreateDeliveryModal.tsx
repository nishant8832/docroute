import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { City, TravelPlan } from '../../types';
import { 
  Send, 
  MapPin, 
  FileText, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Train,
  Plane,
  Car,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface CreateDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDeliveryModal: React.FC<CreateDeliveryModalProps> = ({ isOpen, onClose }) => {
  const { cities, findMatches, createDelivery } = useApp();
  
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Form state
  const [fromCity, setFromCity] = useState<string>('New Delhi');
  const [toCity, setToCity] = useState<string>('Lucknow');
  const [senderAddress, setSenderAddress] = useState<string>('Connaught Place, Barakhamba Road, New Delhi');
  const [recipientName, setRecipientName] = useState<string>('Advocate Rajesh Mishra');
  const [recipientPhone, setRecipientPhone] = useState<string>('+91 94150 78214');
  const [recipientAddress, setRecipientAddress] = useState<string>('High Court Bench, Gomti Nagar, Lucknow');

  const [title, setTitle] = useState<string>('Urgent Legal Court Affidavit & Petition');
  const [category, setCategory] = useState<string>('Legal Documents');
  const [weightCategory, setWeightCategory] = useState<string>('Standard Envelope (< 250g)');
  const [urgency, setUrgency] = useState<'Urgent' | 'Same Day' | 'Next Day' | 'Flexible'>('Same Day');
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState<string>('Today before 02:00 PM');
  const [notes, setNotes] = useState<string>('Handle with care. Tamper-evident barcode seal must remain untampered.');
  const [declaredValue, setDeclaredValue] = useState<number>(25000);
  const [insuranceCover, setInsuranceCover] = useState<boolean>(true);

  // Matching results from server
  const [matchData, setMatchData] = useState<{
    matches: TravelPlan[];
    pricing: any;
    distanceKm: number;
  } | null>(null);
  const [selectedTravellerId, setSelectedTravellerId] = useState<string | null>(null);

  // Categories
  const categories = [
    'Legal Documents',
    'Educational & Certificates',
    'Business & Contracts',
    'Passport & Visas',
    'Medical & Diagnostics',
    'Financial & Cheques',
  ];

  // Fetch match preview when route or urgency changes
  useEffect(() => {
    if (step === 3) {
      fetchMatchPreview();
    }
  }, [step, fromCity, toCity, urgency, category, declaredValue]);

  const fetchMatchPreview = async () => {
    try {
      const res = await findMatches({
        fromCity,
        toCity,
        category,
        urgency,
        declaredValue
      });
      if (res.success) {
        setMatchData(res);
        if (res.matches && res.matches.length > 0 && !selectedTravellerId) {
          setSelectedTravellerId(res.matches[0].travellerId);
        }
      }
    } catch (err) {
      console.error('Error finding matches:', err);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!fromCity || !toCity || !recipientName || !recipientPhone) {
        setErrorMsg('Please fill in all location and recipient details.');
        return;
      }
      if (fromCity === toCity) {
        setErrorMsg('Pickup city and destination city must be different.');
        return;
      }
    }
    setErrorMsg('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await createDelivery({
        title,
        category,
        weightCategory,
        fromCity,
        toCity,
        senderAddress,
        recipientName,
        recipientPhone,
        recipientAddress,
        urgency,
        preferredDeliveryTime,
        notes,
        declaredValue,
        insuranceCover,
        selectedTravellerId
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Document Delivery Request</h2>
              <p className="text-xs text-slate-400">Step {step} of 4 • AI Route Match & Verified Handover</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Indicators */}
        <div className="grid grid-cols-4 border-b border-slate-800 text-[11px] font-semibold text-center">
          {[
            { num: 1, label: 'Route & Parties' },
            { num: 2, label: 'Document Specs' },
            { num: 3, label: 'Traveller Match' },
            { num: 4, label: 'Seal & Escrow' },
          ].map(s => (
            <div
              key={s.num}
              className={`py-2.5 px-1 border-b-2 transition ${
                step === s.num
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : step > s.num
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-500'
              }`}
            >
              {s.num}. {s.label}
            </div>
          ))}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step Body */}
        <div className="p-6 space-y-4">
          
          {/* STEP 1: ROUTE & PARTIES */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Pickup City (Origin)
                  </label>
                  <select
                    value={fromCity}
                    onChange={e => setFromCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {cities.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                    Destination City
                  </label>
                  <select
                    value={toCity}
                    onChange={e => setToCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {cities.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sender Pickup Address / Rendezvous Point
                </label>
                <input
                  type="text"
                  value={senderAddress}
                  onChange={e => setSenderAddress(e.target.value)}
                  placeholder="e.g. Connaught Place, New Delhi or Station Platform 16"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Destination Recipient Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Recipient Full Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      placeholder="e.g. Adv. Rajesh Mishra"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Recipient Mobile Number</label>
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={e => setRecipientPhone(e.target.value)}
                      placeholder="+91 94150 XXXXX"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Delivery Dropoff Address</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={e => setRecipientAddress(e.target.value)}
                    placeholder="e.g. Lucknow High Court Bench, Gomti Nagar"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DOCUMENT SPECS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Consignment Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. High Court Affidavit & Power of Attorney"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Document Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Package Weight / Pouch</label>
                  <select
                    value={weightCategory}
                    onChange={e => setWeightCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Standard Envelope (< 250g)">Standard Envelope (&lt; 250g)</option>
                    <option value="Rigid Cardboard Mailer (< 500g)">Rigid Cardboard Mailer (&lt; 500g)</option>
                    <option value="A3 / Hardbound Pouch (< 1kg)">A3 / Hardbound Pouch (&lt; 1kg)</option>
                  </select>
                </div>
              </div>

              {/* Urgency selector pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Urgent', label: 'Urgent Express', sub: '< 8 hrs (Priority)', col: 'border-red-500/40 text-red-400 bg-red-500/10' },
                    { id: 'Same Day', label: 'Same Day', sub: '< 14 hrs', col: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
                    { id: 'Next Day', label: 'Next Day', sub: '< 24 hrs', col: 'border-slate-700 text-slate-300' },
                  ].map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        urgency === u.id ? `${u.col} ring-1 ring-blue-500/30` : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{u.label}</div>
                      <div className="text-[10px] text-slate-400">{u.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Preferred Delivery Deadline
                </label>
                <input
                  type="text"
                  value={preferredDeliveryTime}
                  onChange={e => setPreferredDeliveryTime(e.target.value)}
                  placeholder="e.g. Today before 02:00 PM (Pre-lunch filing)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Insurance & Declared Value */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">DocRoute Custody Insurance</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={insuranceCover}
                      onChange={e => setInsuranceCover(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-400">Declared Value:</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-500">₹</span>
                    <input
                      type="number"
                      value={declaredValue}
                      onChange={e => setDeclaredValue(Number(e.target.value))}
                      className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">(100% loss/damage guarantee fund)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TRAVELLER MATCH */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    <span>Matching Verified Travellers on Route</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {fromCity} ➔ {toCity} ({matchData?.distanceKm || 450} km)
                  </p>
                </div>
                {matchData?.pricing && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Estimated Fare</span>
                    <div className="text-base font-extrabold text-emerald-400">
                      ₹{matchData.pricing.totalFare}
                    </div>
                  </div>
                )}
              </div>

              {matchData?.matches && matchData.matches.length > 0 ? (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {matchData.matches.map(trip => {
                    const isSelected = selectedTravellerId === trip.travellerId;
                    return (
                      <div
                        key={trip.id}
                        onClick={() => setSelectedTravellerId(trip.travellerId)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/20'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={trip.travellerAvatar}
                              alt={trip.travellerName}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-xs text-white">{trip.travellerName}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-0.5">
                                  <UserCheck className="w-3 h-3" />
                                  <span>{trip.travellerTrustScore}% Trust</span>
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                                <span>{trip.transportDetail}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-bold text-white">
                              Departing: {trip.departureTime}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ETA: {trip.expectedArrivalTime}
                            </div>
                          </div>
                        </div>

                        {/* Match reasons pills */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                          {trip.matchReasons?.map((r, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              ✓ {r}
                            </span>
                          ))}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 ml-auto font-semibold">
                            Match Score: {trip.matchScore}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 text-center space-y-2">
                  <Clock className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">
                    No instant traveller matches right now for this exact corridor.
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    You can still broadcast this delivery request! Verified commuters passing through will be notified immediately to accept.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SEAL & ESCROW CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-800/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Tamper-Evident Security Protocol
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                    ENCRYPTED CUSTODY
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Upon creating this consignment, DocRoute generates:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400">1. Digital Pickup OTP</span>
                    <p className="text-white font-semibold mt-0.5">Held by Sender</p>
                    <p className="text-[10px] text-slate-500">Only handed to traveller in person upon envelope sealing.</p>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400">2. Recipient Handover OTP</span>
                    <p className="text-white font-semibold mt-0.5">Sent to Recipient</p>
                    <p className="text-[10px] text-slate-500">Only given to traveller once physical delivery is completed.</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                  Payment & Escrow Summary
                </h4>
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Base Distance Fare ({matchData?.distanceKm || 450} km):</span>
                  <span className="text-white">₹{matchData?.pricing?.totalFare ? matchData.pricing.totalFare - 70 : 450}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>Urgency Multiplier ({urgency}):</span>
                  <span className="text-white">Applied</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs">
                  <span>DocRoute Escrow Guarantee & Insurance:</span>
                  <span className="text-emerald-400">₹{matchData?.pricing?.insuranceFee || 70}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                  <span className="text-white">Total Amount (Held in Escrow):</span>
                  <span className="text-emerald-400">₹{matchData?.pricing?.totalFare || 520}</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Payment is securely held in DocRoute Escrow and is only released to the traveller when the recipient verifies the Dropoff OTP.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center space-x-1 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating Escrow...' : 'Confirm & Request Delivery'}</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
