import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { SenderDashboard } from './components/sender/SenderDashboard';
import { TravellerDashboard } from './components/traveller/TravellerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CreateDeliveryModal } from './components/sender/CreateDeliveryModal';
import { PostTripModal } from './components/traveller/PostTripModal';
import { KycVerificationModal } from './components/traveller/KycVerificationModal';
import { OtpVerificationModal } from './components/common/OtpVerificationModal';
import { SecuritySealModal } from './components/common/SecuritySealModal';
import { DeliveryDetailModal } from './components/sender/DeliveryDetailModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { SimulatorToolbar } from './components/simulator/SimulatorToolbar';
import { Delivery } from './types';
import { Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { activeRole, isLoading, notifications, deliveries } = useApp();

  // Modals state
  const [isNewDeliveryOpen, setIsNewDeliveryOpen] = useState(false);
  const [isNewTripOpen, setIsNewTripOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [selectedDeliveryDetails, setSelectedDeliveryDetails] = useState<Delivery | null>(null);
  const [sealModalDelivery, setSealModalDelivery] = useState<Delivery | null>(null);
  const [otpModalData, setOtpModalData] = useState<{ delivery: Delivery; type: 'pickup' | 'dropoff' } | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenDetails = (delivery: Delivery) => {
    setSelectedDeliveryDetails(delivery);
  };

  const handleOpenOtpModal = (delivery: Delivery, type: 'pickup' | 'dropoff') => {
    setOtpModalData({ delivery, type });
  };

  const handleOpenSealModal = (delivery: Delivery) => {
    setSealModalDelivery(delivery);
  };

  const handleNotificationSelectDelivery = (deliveryId: string) => {
    const d = deliveries.find(item => item.id === deliveryId);
    if (d) {
      setSelectedDeliveryDetails(d);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
          Initializing DocRoute Smart Logistics Platform...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        onOpenNewDelivery={() => setIsNewDeliveryOpen(true)}
        onOpenNewTrip={() => setIsNewTripOpen(true)}
        onOpenKycModal={() => setIsKycModalOpen(true)}
        onToggleNotifications={() => setIsNotificationsOpen(prev => !prev)}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {activeRole === 'sender' && (
          <SenderDashboard
            onOpenNewDelivery={() => setIsNewDeliveryOpen(true)}
            onOpenDetails={handleOpenDetails}
            onOpenOtpModal={handleOpenOtpModal}
            onOpenSealModal={handleOpenSealModal}
          />
        )}

        {activeRole === 'traveller' && (
          <TravellerDashboard
            onOpenNewTrip={() => setIsNewTripOpen(true)}
            onOpenKycModal={() => setIsKycModalOpen(true)}
            onOpenOtpModal={handleOpenOtpModal}
            onOpenSealModal={handleOpenSealModal}
            onOpenDetails={handleOpenDetails}
          />
        )}

        {activeRole === 'admin' && (
          <AdminDashboard
            onOpenDetails={handleOpenDetails}
            onOpenSealModal={handleOpenSealModal}
          />
        )}
      </main>

      {/* Modals and Overlay Sheets */}
      <CreateDeliveryModal
        isOpen={isNewDeliveryOpen}
        onClose={() => setIsNewDeliveryOpen(false)}
      />

      <PostTripModal
        isOpen={isNewTripOpen}
        onClose={() => setIsNewTripOpen(false)}
      />

      <KycVerificationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
      />

      {otpModalData && (
        <OtpVerificationModal
          delivery={otpModalData.delivery}
          type={otpModalData.type}
          onClose={() => setOtpModalData(null)}
        />
      )}

      {sealModalDelivery && (
        <SecuritySealModal
          delivery={sealModalDelivery}
          onClose={() => setSealModalDelivery(null)}
        />
      )}

      {selectedDeliveryDetails && (
        <DeliveryDetailModal
          delivery={selectedDeliveryDetails}
          onClose={() => setSelectedDeliveryDetails(null)}
          onOpenOtpModal={handleOpenOtpModal}
          onOpenSealModal={handleOpenSealModal}
        />
      )}

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectDelivery={handleNotificationSelectDelivery}
      />

      {/* Floating Demo Simulator Controls */}
      <SimulatorToolbar />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
