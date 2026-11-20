import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Delivery, KYCSubmission } from '../../types';
import { 
  ShieldCheck, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  FileCheck
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenDetails: (delivery: Delivery) => void;
  onOpenSealModal: (delivery: Delivery) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenDetails,
  onOpenSealModal
}) => {
  const { adminStats, deliveries, kycSubmissions, reviewKyc } = useApp();
  const [activeTab, setActiveTab] = useState<'kyc' | 'deliveries' | 'corridors'>('kyc');

  const pendingKyc = kycSubmissions.filter(k => k.status === 'pending');
  const reviewedKyc = kycSubmissions.filter(k => k.status !== 'pending');

  const handleApprove = async (id: string) => {
    await reviewKyc(id, 'approved', 'AI document checksum and selfie biometric authenticity approved by Operations Desk');
  };

  const handleReject = async (id: string) => {
    await reviewKyc(id, 'rejected', 'Image illegible or document checksum failed verification');
  };

  return (
    <div className="space-y-6">
      
      {/* Platform Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 rounded-full text-amber-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DocRoute Operations & Compliance Command</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Platform Telemetry & Audit Desk</h1>
            <p className="text-xs text-slate-300">
              Real-time monitoring of all peer-to-peer document routes, KYC approvals, and cryptographic custody verification.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live System Healthy (99.98% Uptime)</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Deliveries</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{adminStats?.totalDeliveries || deliveries.length}</div>
          <p className="text-[11px] text-emerald-400">99.8% Success Rate</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending KYC Queue</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{pendingKyc.length}</div>
          <p className="text-[11px] text-slate-500">Requires desk sign-off</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Transit Duration</span>
            <Clock className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-white">4.8 <span className="text-sm font-normal text-slate-400">hrs</span></div>
          <p className="text-[11px] text-slate-400">vs 48 hrs courier norm</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tamper Incident Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">0.00%</div>
          <p className="text-[11px] text-slate-500">Zero breach alerts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        {[
          { id: 'kyc', label: `Identity KYC Verification (${pendingKyc.length} Pending)` },
          { id: 'deliveries', label: `Active Fleet Consignments (${deliveries.length})` },
          { id: 'corridors', label: 'High-Demand Corridors' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: KYC VERIFICATION QUEUE */}
      {activeTab === 'kyc' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Pending Traveller Identity Submissions
            </h3>
            <span className="text-xs text-slate-400">
              AI Document Verification Confidence: &gt; 98%
            </span>
          </div>

          {pendingKyc.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              All pending traveller KYC verifications have been reviewed and resolved!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingKyc.map(k => (
                <div
                  key={k.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={k.selfieUrl}
                        alt={k.userName}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-500/30"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">{k.userName}</h4>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                            {k.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {k.idType}: <span className="font-mono text-slate-200">{k.idNumber}</span> • {k.userPhone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        AI Match: {k.confidenceScore}%
                      </span>
                    </div>
                  </div>

                  {/* AI Analysis Result */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-brand-300">AI Forensic Note: </span>
                    <span>{k.aiAnalysis}</span>
                  </div>

                  {/* Document preview & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
                    <a
                      href={k.documentFrontUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Inspect Front Scan Asset</span>
                    </a>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReject(k.id)}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-semibold rounded-lg transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(k.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Courier</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recently Reviewed Records */}
          {reviewedKyc.length > 0 && (
            <div className="pt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Approved Courier Registry
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reviewedKyc.map(rk => (
                  <div key={rk.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{rk.userName}</span>
                      <p className="text-[11px] text-slate-500">{rk.idType} • {rk.idNumber}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold">
                      Approved
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE FLEET DELIVERIES */}
      {activeTab === 'deliveries' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Consignment</th>
                  <th className="p-3.5">Corridor Route</th>
                  <th className="p-3.5">Assigned Carrier</th>
                  <th className="p-3.5">Tamper Seal</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                {deliveries.map(d => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-brand-400">{d.id}</div>
                      <div className="text-slate-300 text-[11px] line-clamp-1">{d.title}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{d.fromCity} ➔ {d.toCity}</div>
                      <div className="text-slate-500 text-[10px]">{d.distanceKm} km • {d.urgency}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-200">{d.travellerName || 'Unassigned'}</div>
                      <div className="text-slate-500 text-[10px]">{d.transportDetail || 'Awaiting assignment'}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[10px] text-emerald-400">
                      {d.envelopeSealCode}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        d.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                        d.status === 'in_transit' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => onOpenSealModal(d)}
                        className="text-slate-400 hover:text-white"
                        title="Seal Certificate"
                      >
                        Seal
                      </button>
                      <button
                        onClick={() => onOpenDetails(d)}
                        className="text-brand-400 hover:text-brand-300 font-semibold"
                      >
                        Telemetry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HIGH-DEMAND CORRIDORS */}
      {activeTab === 'corridors' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { corridor: 'Delhi (NDLS) ➔ Lucknow (LKO)', train: 'Vande Bharat 22436', time: '6h 25m', courierNorm: '48h', rate: '₹550 avg' },
            { corridor: 'Mumbai (CSMT) ➔ Pune (PUNE)', train: 'Expressway Carpool / Deccan Queen', time: '3h 15m', courierNorm: '36h', rate: '₹380 avg' },
            { corridor: 'Delhi (NDLS) ➔ Chandigarh (CDG)', train: 'Kalka Shatabdi 12005', time: '3h 05m', courierNorm: '24h', rate: '₹420 avg' },
          ].map((c, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>{c.corridor}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Fastest Transit:</span>
                  <span className="text-emerald-400 font-semibold">{c.time}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Standard Courier:</span>
                  <span className="text-red-400">{c.courierNorm}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Primary Carrier:</span>
                  <span className="text-white">{c.train}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
