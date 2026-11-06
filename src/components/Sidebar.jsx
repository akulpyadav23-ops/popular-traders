import React from 'react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShoppingCart,
  Boxes,
  BadgePercent,
  Users2,
  BookOpenCheck,
  BarChart3,
  Lock,
  User,
  Shield,
  Briefcase
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen, onOpenProfileDrawer }) => {
  const { currentUser, products, leaves, isAdmin, isWorker } = useStore();
  const { t } = useLanguage();

  const lowStockCount = products.filter(p => p.stock < 5).length;
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

  // Role Based Menu Items
  // Worker has: POS Billing, Price List, Staff Attendance, Customer Ledger
  // Admin has: All Worker modules + Inventory Control (OCR) + Store Analytics
  const menuItems = [
    {
      id: 'POS',
      label: t('posBilling'),
      icon: <ShoppingCart className="w-5 h-5" />,
      badge: null,
      adminOnly: false,
      desc: t('posBillingDesc')
    },
    {
      id: 'PRICING',
      label: t('priceChecklist'),
      icon: <BadgePercent className="w-5 h-5" />,
      badge: null,
      adminOnly: false,
      desc: t('priceChecklistDesc')
    },
    {
      id: 'STAFF',
      label: t('staffShifts'),
      icon: <Users2 className="w-5 h-5" />,
      badge: pendingLeaves > 0 && isAdmin ? `${pendingLeaves}` : null,
      badgeColor: 'bg-amber-500 text-white',
      adminOnly: false,
      desc: t('staffShiftsDesc')
    },
    {
      id: 'UDHAR',
      label: t('udharLedger'),
      icon: <BookOpenCheck className="w-5 h-5" />,
      badge: null,
      adminOnly: false,
      desc: t('udharLedgerDesc')
    },
    {
      id: 'INVENTORY',
      label: t('stockTracker'),
      icon: <Boxes className="w-5 h-5" />,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-red-500 text-white',
      adminOnly: true, // Only Admin can stock in / stock out / edit inventory
      desc: t('stockTrackerDesc')
    },
    {
      id: 'ANALYTICS',
      label: t('adminAnalytics'),
      icon: <BarChart3 className="w-5 h-5" />,
      badge: null,
      adminOnly: true, // Only Admin can access financial / revenue analytics
      desc: t('adminAnalyticsDesc')
    }
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>{t('operationalModules')}</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
              isAdmin ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-[#344336]'
            }`}>
              {isAdmin ? 'ADMIN' : 'WORKER'}
            </span>
          </div>

          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const isLocked = item.adminOnly && !isAdmin;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isLocked) {
                    alert(t('accessDenied'));
                    return;
                  }
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition-all flex items-start gap-3 group relative cursor-pointer ${
                  isActive
                    ? 'bg-[#7b977e] text-white shadow-md shadow-[#7b977e]/25 font-semibold'
                    : isLocked
                    ? 'opacity-40 hover:bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className={`mt-0.5 transition-colors ${
                  isActive ? 'text-white' : isLocked ? 'text-slate-400' : 'text-slate-500 group-hover:text-[#546956]'
                }`}>
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs truncate font-bold">{item.label}</span>
                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                          {item.badge}
                        </span>
                      )
                    )}
                  </div>
                  <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current User Card & Profile Drawer Trigger */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onOpenProfileDrawer}
            className="w-full p-2.5 bg-white hover:bg-[#e7ede8]/60 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 transition text-left cursor-pointer group"
            title="Click to view full staff profile & settings"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                isAdmin ? 'bg-indigo-600' : 'bg-[#7b977e]'
              }`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 truncate group-hover:text-[#546956]">
                {currentUser?.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <span>{currentUser?.role}</span>
                <span>•</span>
                <span>Profile Drawer →</span>
              </div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
