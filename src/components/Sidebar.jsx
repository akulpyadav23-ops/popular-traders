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
  Lock
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) => {
  const { currentUser, products, leaves } = useStore();
  const { t } = useLanguage();

  const lowStockCount = products.filter(p => p.stock < 5).length;
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  const isAdmin = currentUser.role === 'Admin';

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
      id: 'INVENTORY',
      label: t('stockTracker'),
      icon: <Boxes className="w-5 h-5" />,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeColor: 'bg-red-500 text-white',
      adminOnly: false,
      desc: t('stockTrackerDesc')
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
      badge: pendingLeaves > 0 ? `${pendingLeaves}` : null,
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
      id: 'ANALYTICS',
      label: t('adminAnalytics'),
      icon: <BarChart3 className="w-5 h-5" />,
      badge: null,
      adminOnly: true,
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
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t('operationalModules')}
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
                className={`w-full text-left px-3.5 py-3 rounded-2xl transition-all flex items-start gap-3 group relative ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold'
                    : isLocked
                    ? 'opacity-60 hover:bg-slate-50 text-slate-500'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className={`mt-0.5 transition-colors ${
                  isActive ? 'text-white' : isLocked ? 'text-slate-400' : 'text-slate-500 group-hover:text-emerald-600'
                }`}>
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm truncate">{item.label}</span>
                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                          {item.badge}
                        </span>
                      )
                    )}
                  </div>
                  <div className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current User Badge */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 ${isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              {isAdmin ? 'ADM' : 'CSH'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                <span>{currentUser.role} {t('accessLevel')}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
