import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
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
  const [activeTab, setActiveTab] = useState('POS');
  const [pinPadOpen, setPinPadOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenPinPad={() => setPinPadOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
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
