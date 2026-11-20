import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Delivery, TravelPlan, City, KYCSubmission, AppNotification, AdminStats, WalletData } from '../types';
import { sounds } from '../utils/audio';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  activeRole: UserRole;
  deliveries: Delivery[];
  travels: TravelPlan[];
  cities: City[];
  kycSubmissions: KYCSubmission[];
  notifications: AppNotification[];
  adminStats: AdminStats | null;
  walletData: WalletData | null;
  isLoading: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => Promise<void>;
  createDelivery: (payload: any) => Promise<Delivery>;
  bookTraveller: (deliveryId: string, travellerId: string) => Promise<void>;
  verifyPickupOtp: (deliveryId: string, otp: string) => Promise<{ success: boolean; message: string }>;
  verifyDropoffOtp: (deliveryId: string, otp: string, proofPhotoUrl?: string) => Promise<{ success: boolean; message: string }>;
  addCheckpoint: (deliveryId: string, payload: any) => Promise<void>;
  postTravelPlan: (payload: any) => Promise<TravelPlan>;
  findMatches: (criteria: any) => Promise<any>;
  submitKyc: (payload: any) => Promise<void>;
  reviewKyc: (id: string, status: 'approved' | 'rejected', remarks?: string) => Promise<void>;
  withdrawFunds: (amount: number, upiId: string) => Promise<{ success: boolean; message: string }>;
  markNotificationsRead: () => Promise<void>;
  simulateStep: (deliveryId: string, step: 'pickup' | 'midway' | 'deliver') => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole>('sender');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [travels, setTravels] = useState<TravelPlan[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      sounds.enabled = !prev;
      return !prev;
    });
  };

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [uRes, usersRes, cRes, dRes, tRes, kycRes, nRes, statsRes] = await Promise.all([
        fetch('/api/currentUser').then(r => r.json()),
        fetch('/api/users').then(r => r.json()),
        fetch('/api/cities').then(r => r.json()),
        fetch('/api/deliveries').then(r => r.json()),
        fetch('/api/travels').then(r => r.json()),
        fetch('/api/verify/kyc').then(r => r.json()),
        fetch('/api/notifications').then(r => r.json()),
        fetch('/api/admin/stats').then(r => r.json()),
      ]);

      if (uRes.success) {
        setCurrentUser(uRes.user);
        setActiveRole(uRes.user.role);
        fetchWallet(uRes.user.id);
      }
      if (usersRes.success) setUsers(usersRes.users);
      if (cRes.success) setCities(cRes.cities);
      if (dRes.success) setDeliveries(dRes.deliveries);
      if (tRes.success) setTravels(tRes.travels);
      if (kycRes.success) setKycSubmissions(kycRes.submissions);
      if (nRes.success) setNotifications(nRes.notifications);
      if (statsRes.success) setAdminStats(statsRes.stats);
    } catch (err) {
      console.error('Error fetching data from API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWallet = async (userId: string) => {
    try {
      const res = await fetch(`/api/wallet/${userId}`).then(r => r.json());
      if (res.success) setWalletData(res.wallet);
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    // Find an appropriate user with that role
    const matchingUser = users.find(u => u.role === role);
    if (matchingUser && matchingUser.id !== currentUser?.id) {
      switchUser(matchingUser.id);
    }
  };

  const switchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/switchUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).then(r => r.json());

      if (res.success) {
        setCurrentUser(res.user);
        setActiveRole(res.user.role);
        fetchWallet(res.user.id);
        // Refresh notifications
        const nRes = await fetch('/api/notifications').then(r => r.json());
        if (nRes.success) setNotifications(nRes.notifications);
      }
    } catch (err) {
      console.error('Error switching user:', err);
    }
  };

  const createDelivery = async (payload: any): Promise<Delivery> => {
    const res = await fetch('/api/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json());

    if (res.success) {
      setDeliveries(prev => [res.delivery, ...prev]);
      if (soundEnabled) sounds.playSuccess();
      refreshAll();
      return res.delivery;
    }
    throw new Error(res.message || 'Failed to create delivery');
  };

  const bookTraveller = async (deliveryId: string, travellerId: string) => {
    const res = await fetch(`/api/deliveries/${deliveryId}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ travellerId }),
    }).then(r => r.json());

    if (res.success) {
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? res.delivery : d));
      if (soundEnabled) sounds.playSuccess();
      refreshAll();
    }
  };

  const verifyPickupOtp = async (deliveryId: string, otp: string) => {
    const res = await fetch(`/api/deliveries/${deliveryId}/verify-pickup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    }).then(r => r.json());

    if (res.success) {
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? res.delivery : d));
      if (soundEnabled) sounds.playUnlock();
      refreshAll();
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Invalid OTP' };
  };

  const verifyDropoffOtp = async (deliveryId: string, otp: string, proofPhotoUrl?: string) => {
    const res = await fetch(`/api/deliveries/${deliveryId}/verify-dropoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, proofPhotoUrl }),
    }).then(r => r.json());

    if (res.success) {
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? res.delivery : d));
      if (soundEnabled) sounds.playSuccess();
      refreshAll();
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Invalid OTP' };
  };

  const addCheckpoint = async (deliveryId: string, payload: any) => {
    const res = await fetch(`/api/deliveries/${deliveryId}/checkpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json());

    if (res.success) {
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? res.delivery : d));
      if (soundEnabled) sounds.playPing();
      refreshAll();
    }
  };

  const postTravelPlan = async (payload: any): Promise<TravelPlan> => {
    const res = await fetch('/api/travels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json());

    if (res.success) {
      setTravels(prev => [res.travel, ...prev]);
      if (soundEnabled) sounds.playSuccess();
      refreshAll();
      return res.travel;
    }
    throw new Error(res.message || 'Failed to post travel plan');
  };

  const findMatches = async (criteria: any) => {
    const res = await fetch('/api/matching/find-travellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria),
    }).then(r => r.json());
    return res;
  };

  const submitKyc = async (payload: any) => {
    const res = await fetch('/api/verify/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json());

    if (res.success) {
      setKycSubmissions(prev => [res.submission, ...prev]);
      if (currentUser) {
        setCurrentUser({ ...currentUser, kycStatus: 'pending' });
      }
      if (soundEnabled) sounds.playSuccess();
      refreshAll();
    }
  };

  const reviewKyc = async (id: string, status: 'approved' | 'rejected', remarks?: string) => {
    const res = await fetch(`/api/verify/kyc/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, remarks }),
    }).then(r => r.json());

    if (res.success) {
      setKycSubmissions(prev => prev.map(k => k.id === id ? res.submission : k));
      refreshAll();
    }
  };

  const withdrawFunds = async (amount: number, upiId: string) => {
    const res = await fetch('/api/wallet/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, upiId }),
    }).then(r => r.json());

    if (res.success) {
      if (soundEnabled) sounds.playSuccess();
      if (currentUser) {
        fetchWallet(currentUser.id);
      }
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Failed to withdraw' };
  };

  const markNotificationsRead = async () => {
    await fetch('/api/notifications/mark-read', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const simulateStep = async (deliveryId: string, step: 'pickup' | 'midway' | 'deliver') => {
    const res = await fetch('/api/simulation/advance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryId, step }),
    }).then(r => r.json());

    if (res.success) {
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? res.delivery : d));
      if (soundEnabled) {
        if (step === 'deliver') sounds.playSuccess();
        else sounds.playPing();
      }
      refreshAll();
    }
  };

  const refreshAll = async () => {
    const [dRes, tRes, nRes, sRes, kRes] = await Promise.all([
      fetch('/api/deliveries').then(r => r.json()),
      fetch('/api/travels').then(r => r.json()),
      fetch('/api/notifications').then(r => r.json()),
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/verify/kyc').then(r => r.json()),
    ]);
    if (dRes.success) setDeliveries(dRes.deliveries);
    if (tRes.success) setTravels(tRes.travels);
    if (nRes.success) setNotifications(nRes.notifications);
    if (sRes.success) setAdminStats(sRes.stats);
    if (kRes.success) setKycSubmissions(kRes.submissions);
    if (currentUser) fetchWallet(currentUser.id);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        activeRole,
        deliveries,
        travels,
        cities,
        kycSubmissions,
        notifications,
        adminStats,
        walletData,
        isLoading,
        soundEnabled,
        toggleSound,
        switchRole,
        switchUser,
        createDelivery,
        bookTraveller,
        verifyPickupOtp,
        verifyDropoffOtp,
        addCheckpoint,
        postTravelPlan,
        findMatches,
        submitKyc,
        reviewKyc,
        withdrawFunds,
        markNotificationsRead,
        simulateStep,
        refreshAll
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
