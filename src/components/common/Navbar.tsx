import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Send, 
  Compass, 
  ShieldCheck, 
  Bell, 
  Volume2, 
  VolumeX, 
  Plus, 
  ChevronDown, 
  CheckCircle2, 
  Sparkles,
  Train,
  Navigation
} from 'lucide-react';

interface NavbarProps {
  onOpenNewDelivery?: () => void;
  onOpenNewTrip?: () => void;
  onOpenKycModal?: () => void;
  onToggleNotifications?: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewDelivery,
  onOpenNewTrip,
  onOpenKycModal,
  onToggleNotifications,
  unreadCount = 0
}) => {
  const { currentUser, users, activeRole, switchRole, switchUser, soundEnabled, toggleSound } = useApp();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { role: 'sender', label: 'Sender', icon: <Send className="w-4 h-4" />, color: 'hover:text-blue-400' },
    { role: 'traveller', label: 'Traveller', icon: <Compass className="w-4 h-4" />, color: 'hover:text-emerald-400' },
    { role: 'admin', label: 'Operations Admin', icon: <ShieldCheck className="w-4 h-4" />, color: 'hover:text-amber-400' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-blue-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/25 ring-2 ring-brand-400/30">
              <Navigation className="w-5 h-5 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Doc<span className="text-brand-400">Route</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-500/15 text-brand-400 border border-brand-500/30 px-1.5 py-0.5 rounded-full">
                  P2P Express
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Your Document. Your Route. Faster Delivery.
              </p>
            </div>
          </div>

          {/* Role Switcher Pill */}
          <div className="hidden md:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shadow-inner">
            {roles.map(({ role, label, icon }) => {
              const isActive = activeRole === role;
              return (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? role === 'sender'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : role === 'traveller'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                        : 'bg-amber-600 text-white shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Action CTAs & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Action Button based on Role */}
            {activeRole === 'sender' && onOpenNewDelivery && (
              <button
                onClick={onOpenNewDelivery}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-brand-500 hover:from-blue-500 hover:to-brand-400 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-md shadow-blue-500/25 transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Send Document</span>
                <span className="sm:hidden">Send</span>
              </button>
            )}

            {activeRole === 'traveller' && onOpenNewTrip && (
              <button
                onClick={onOpenNewTrip}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-md shadow-emerald-500/25 transition-all transform active:scale-95"
              >
                <Train className="w-4 h-4" />
                <span className="hidden sm:inline">Post Travel Route</span>
                <span className="sm:hidden">Post Trip</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute Audio Cues' : 'Enable Audio Cues'}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onToggleNotifications}
              className="relative p-2 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown / User Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 pl-2 pr-1.5 py-1 bg-slate-800/70 hover:bg-slate-800 rounded-lg border border-slate-700/70 transition"
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser?.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-600"
                />
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-semibold text-slate-200 flex items-center space-x-1">
                    <span>{currentUser?.name.split(' ')[0]}</span>
                    {currentUser?.kycStatus === 'verified' && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {currentUser?.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Switcher Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Active Persona
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Experience DocRoute from any perspective
                    </p>
                  </div>
                  <div className="py-1 space-y-1">
                    {users.map(u => {
                      const isCurrent = u.id === currentUser?.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-xs transition ${
                            isCurrent
                              ? 'bg-brand-500/15 border border-brand-500/30 text-white'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-medium truncate">{u.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                                u.role === 'sender'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : u.role === 'traveller'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {u.role}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                              {u.city} • Trust: {u.trustScore}%
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Role Switcher Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/80">
          {roles.map(({ role, label, icon }) => {
            const isActive = activeRole === role;
            return (
              <button
                key={role}
                onClick={() => switchRole(role)}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-semibold ${
                  isActive
                    ? role === 'sender'
                      ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                      : role === 'traveller'
                      ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-600/30 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
