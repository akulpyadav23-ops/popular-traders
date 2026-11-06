import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { ProfileDrawer } from './components/ProfileDrawer';
import { PosView } from './views/PosView';
import { InventoryView } from './views/InventoryView';
import { PriceChecklistView } from './views/PriceChecklistView';
import { StaffAttendanceView } from './views/StaffAttendanceView';
import { UdharLedgerView } from './views/UdharLedgerView';
import { AnalyticsView } from './views/AnalyticsView';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { PinPadModal } from './components/PinPadModal';
import { NotificationToast } from './components/NotificationToast';

function AppContent() {
  const { currentUser, isWorker } = useStore();
  const [activeTab, setActiveTab] = useState('POS');
  const [pinPadOpen, setPinPadOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // If worker logs in or switches, enforce restricted portal tabs:
  // 1. Price List (PRICING)
  // 2. Attendance (STAFF)
  // 3. Billing (POS)
  // 4. Ledger Entry (UDHAR)
  // Admin has access to all including INVENTORY & ANALYTICS
  useEffect(() => {
    if (isWorker && (activeTab === 'INVENTORY' || activeTab === 'ANALYTICS')) {
      setActiveTab('POS');
    }
  }, [isWorker, activeTab]);

  // If user is not authenticated, show role-based Login View
  if (!currentUser) {
    return (
      <>
        <LoginView />
        <NotificationToast />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenPinPad={() => setPinPadOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
        onOpenProfileDrawer={() => setProfileDrawerOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar with RBAC Filtering */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          onOpenProfileDrawer={() => setProfileDrawerOpen(true)}
        />

        {/* Dynamic Operational View */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'POS' && <PosView />}
          {activeTab === 'INVENTORY' && <InventoryView />}
          {activeTab === 'PRICING' && <PriceChecklistView />}
          {activeTab === 'STAFF' && (
            <StaffAttendanceView onOpenPinPad={() => setPinPadOpen(true)} />
          )}
          {activeTab === 'UDHAR' && <UdharLedgerView />}
          {activeTab === 'ANALYTICS' && <AnalyticsView />}
        </main>
      </div>

      {/* Top-Left Profile Slide-out Drawer */}
      <ProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
      />

      {/* Global Modals & Toasts */}
      <ThermalReceiptModal />
      <PinPadModal
        isOpen={pinPadOpen}
        onClose={() => setPinPadOpen(false)}
        mode="ATTENDANCE"
      />
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
